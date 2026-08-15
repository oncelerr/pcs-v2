<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\NotificationController;
use App\Models\StateServiceRequest;
use App\Services\AdminActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StateServiceRequestController extends Controller
{
    protected $notificationController;

    public function __construct(NotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    /**
     * Store a newly created state service request.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|max:255',
                'companyName' => 'required|string|max:255',
                'stateOfRegistration' => 'required|string|max:100',
                'serviceType' => 'required|string|max:255',
                'briefDescription' => 'required|string|min:20',
                'termsAccepted' => 'required|boolean|accepted',
                'user_id' => 'required|exists:users,id'
            ]);

            // Get the user who submitted the request
            $user = \App\Models\User::find($validated['user_id']);

            // Create the service request
            $serviceRequest = StateServiceRequest::create([
                'user_id' => $validated['user_id'],
                'email' => $validated['email'],
                'company_name' => $validated['companyName'],
                'state_of_registration' => $validated['stateOfRegistration'],
                'service_type' => $validated['serviceType'],
                'description' => $validated['briefDescription'],
                'status' => 'pending',
                'terms_accepted_at' => now()
            ]);

            // Log the creation
            Log::info('State service request created', [
                'request_id' => $serviceRequest->id,
                'user_id' => $validated['user_id'],
                'service_type' => $validated['serviceType']
            ]);

            // Send notification to admins
            $this->notificationController->notifyAdmins(
                'New State Service Request',
                "A new state service request has been submitted by {$user->name} ({$user->email}).",
                [
                    'type' => 'state_service_request',
                    'data' => [
                        'request_id' => $serviceRequest->id,
                        'user_name' => $user->name,
                        'user_email' => $user->email,
                        'company_name' => $validated['companyName'],
                        'state_of_registration' => $validated['stateOfRegistration'],
                        'service_type' => $validated['serviceType'],
                        'description' => $validated['briefDescription'],
                        'submitted_at' => $serviceRequest->created_at->format('Y-m-d H:i:s'),
                    ],
                    'status' => 'pending'
                ]
            );

            // Send confirmation notification to the user
            $this->notificationController->sendToUser(
                $validated['user_id'],
                'Service Request Submitted',
                "Your state service request for {$validated['serviceType']} has been submitted successfully. We will review your request and get back to you soon.",
                [
                    'type' => 'service_request_confirmation',
                    'data' => [
                        'request_id' => $serviceRequest->id,
                        'service_type' => $validated['serviceType'],
                        'status' => 'pending'
                    ]
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Service request submitted successfully',
                'data' => [
                    'request_id' => $serviceRequest->id,
                    'status' => $serviceRequest->status,
                    'created_at' => $serviceRequest->created_at->toDateTimeString()
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error creating state service request', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing your request. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display a listing of the user's service requests.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        
        $requests = StateServiceRequest::forUser($userId)
            ->with(['user', 'assignedTo'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    /**
     * Display the specified service request.
     */
    public function show(Request $request, StateServiceRequest $stateServiceRequest)
    {
        // Ensure user can only view their own requests (unless admin)
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        
        if ($stateServiceRequest->user_id !== $user->id && !$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $stateServiceRequest->load(['user', 'assignedTo']);

        return response()->json([
            'success' => true,
            'data' => $stateServiceRequest
        ]);
    }

    /**
     * Update the specified service request (admin only).
     */
    public function update(Request $request, StateServiceRequest $stateServiceRequest)
    {
        // Ensure only admins can update
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        
        if (!$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
            'admin_notes' => 'sometimes|string|nullable',
            'assigned_to' => 'sometimes|exists:users,id|nullable'
        ]);

        $oldStatus = $stateServiceRequest->status;
        $stateServiceRequest->update($validated);

        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $stateServiceRequest->completed_at = now();
            $stateServiceRequest->save();
        }

        // Notify user of status change
        if (isset($validated['status']) && $validated['status'] !== $oldStatus) {
            $statusMessages = [
                'in_progress' => 'Your state service request is now being processed.',
                'completed' => 'Your state service request has been completed successfully.',
                'cancelled' => 'Your state service request has been cancelled.',
            ];

            if (isset($statusMessages[$validated['status']])) {
                $this->notificationController->sendToUser(
                    $stateServiceRequest->user_id,
                    'Service Request Status Updated',
                    $statusMessages[$validated['status']],
                    [
                        'type' => 'service_request_status_update',
                        'data' => [
                            'request_id' => $stateServiceRequest->id,
                            'service_type' => $stateServiceRequest->service_type,
                            'old_status' => $oldStatus,
                            'new_status' => $validated['status'],
                            'admin_notes' => $validated['admin_notes'] ?? null
                        ]
                    ]
                );
            }
        }

        // If assigned to someone, notify them
        if (isset($validated['assigned_to']) && $validated['assigned_to']) {
            $assignedAdmin = \App\Models\User::find($validated['assigned_to']);
            if ($assignedAdmin) {
                $this->notificationController->sendToUser(
                    $validated['assigned_to'],
                    'Service Request Assigned to You',
                    "A state service request ({$stateServiceRequest->service_type}) has been assigned to you.",
                    [
                        'type' => 'service_request_assignment',
                        'data' => [
                            'request_id' => $stateServiceRequest->id,
                            'company_name' => $stateServiceRequest->company_name,
                            'service_type' => $stateServiceRequest->service_type,
                            'user_name' => $stateServiceRequest->user->name ?? 'Unknown'
                        ]
                    ]
                );
            }
        }

        AdminActivityLogger::log(
            'state_service_request_update',
            "Updated service request #{$stateServiceRequest->id} ({$stateServiceRequest->service_type})",
            $stateServiceRequest,
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Service request updated successfully',
            'data' => $stateServiceRequest->fresh()
        ]);
    }

    /**
     * Get all service requests (admin only).
     */
    public function adminIndex(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        
        if (!$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $query = StateServiceRequest::with(['user', 'assignedTo']);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('service_type')) {
            $query->where('service_type', $request->service_type);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    /**
     * Cancel a service request (user can cancel their own pending requests).
     */
    public function cancel(Request $request, StateServiceRequest $stateServiceRequest)
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        
        // Check authorization
        if ($stateServiceRequest->user_id !== $user->id && !$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Only pending or in_progress requests can be cancelled
        if (!in_array($stateServiceRequest->status, ['pending', 'in_progress'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only pending or in-progress requests can be cancelled'
            ], 400);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);

        $stateServiceRequest->markAsCancelled($validated['reason'] ?? 'Cancelled by user');

        if ($isAdmin) {
            AdminActivityLogger::log(
                'state_service_request_cancelled',
                "Cancelled service request #{$stateServiceRequest->id} ({$stateServiceRequest->service_type})",
                $stateServiceRequest,
                ['reason' => $validated['reason'] ?? null]
            );
        }

        // Notify admins about cancellation
        $this->notificationController->notifyAdmins(
            'Service Request Cancelled',
            "Service request #{$stateServiceRequest->id} has been cancelled by the user.",
            [
                'type' => 'service_request_cancelled',
                'data' => [
                    'request_id' => $stateServiceRequest->id,
                    'service_type' => $stateServiceRequest->service_type,
                    'company_name' => $stateServiceRequest->company_name,
                    'reason' => $validated['reason'] ?? 'No reason provided',
                    'cancelled_by' => $user->name
                ]
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Service request cancelled successfully',
            'data' => $stateServiceRequest->fresh()
        ]);
    }
}