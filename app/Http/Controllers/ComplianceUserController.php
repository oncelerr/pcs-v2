<?php

namespace App\Http\Controllers;

use App\Models\ComplianceUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ComplianceUserController extends Controller
{
    /**
     * Display a paginated listing of compliance user information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Default pagination parameters
        $perPage = $request->input('per_page', 10); // Default to 10 items per page
        $page = $request->input('page', 1);
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        // Validate pagination parameters
        $validator = Validator::make([
            'per_page' => $perPage,
            'page' => $page,
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder
        ], [
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'sort_by' => 'string|in:id,created_at,updated_at',
            'sort_order' => 'string|in:asc,desc'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid pagination parameters',
                'errors' => $validator->errors()
            ], 400);
        }
        
        // Build the query with filters
        $query = ComplianceUser::with(['user', 'user.information']);
        
        // Apply search filter if provided
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function($q) use ($searchTerm) {
                // Search in compliance_users table
                $q->where('compliance_status', 'like', "%{$searchTerm}%")
                  ->orWhere('state_registration_status', 'like', "%{$searchTerm}%")
                  ->orWhere('bio_filing_status', 'like', "%{$searchTerm}%")
                  ->orWhere('ein_filing_status', 'like', "%{$searchTerm}%")
                  ->orWhere('bank_registration_status', 'like', "%{$searchTerm}%")
                  ->orWhere('process_status', 'like', "%{$searchTerm}%")
                  // Also search in related user if it exists
                  ->orWhereHas('user', function($userQuery) use ($searchTerm) {
                      $userQuery->where('name', 'like', "%{$searchTerm}%")
                               ->orWhere('email', 'like', "%{$searchTerm}%");
                  })
                  // Search in user_information table
                  ->orWhereHas('user.information', function($infoQuery) use ($searchTerm) {
                      $infoQuery->where('company_name', 'like', "%{$searchTerm}%")
                               ->orWhere('first_name', 'like', "%{$searchTerm}%")
                               ->orWhere('last_name', 'like', "%{$searchTerm}%");
                  });
            });
        }
        
        // Apply status filter if provided
        if ($request->has('company_type')) {
            $statusFilter = $request->input('company_type');
            $query->where(function($q) use ($statusFilter) {
                $q->where('compliance_status', $statusFilter)
                  ->orWhere('state_registration_status', $statusFilter)
                  ->orWhere('bio_filing_status', $statusFilter)
                  ->orWhere('ein_filing_status', $statusFilter)
                  ->orWhere('bank_registration_status', $statusFilter);
            });
        }
        
        // Apply process status filter if provided
        if ($request->has('process_status')) {
            $processStatusFilter = $request->input('process_status');
            $query->where('process_status', $processStatusFilter);
        }
        
        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);
        
        // Execute the query with pagination
        $complianceUsers = $query->paginate($perPage, ['*'], 'page', $page);
        
        // Format the response data to match the frontend requirements
        $formattedData = collect($complianceUsers->items())->map(function ($complianceUser) {
            // Add null check for user relationship
            $user = $complianceUser->user;
            
            // Get user information if available
            $userInfo = $user ? $user->information : null;
            
            return [
                'id' => $complianceUser->id,
                'user_id' => $user ? $user->id : null,
                'company_name' => $userInfo ? ($userInfo->company_name ?? 'N/A') : 'N/A', // Get company_name from user_information
                'compliance_status' => $complianceUser->compliance_status ?: ComplianceUser::STATUS_PENDING,
                'state_registration_status' => $complianceUser->state_registration_status ?: ComplianceUser::STATUS_PENDING,
                'bio_filing_status' => $complianceUser->bio_filing_status ?: ComplianceUser::STATUS_PENDING,
                'ein_filing_status' => $complianceUser->ein_filing_status ?: ComplianceUser::STATUS_PENDING,
                'bank_registration_status' => $complianceUser->bank_registration_status ?: ComplianceUser::STATUS_PENDING,
                'annual_franchise_tax' => $complianceUser->annual_franchise_tax ?? 'N/A',
                'annual_irs_tax' => $complianceUser->annual_irs_tax ?? 'N/A',
                'process_status' => $complianceUser->process_status ?: ComplianceUser::STATUS_PENDING,
                'created_at' => $complianceUser->created_at,
                'updated_at' => $complianceUser->updated_at
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $formattedData,
            'pagination' => [
                'total' => $complianceUsers->total(),
                'per_page' => $complianceUsers->perPage(),
                'current_page' => $complianceUsers->currentPage(),
                'last_page' => $complianceUsers->lastPage(),
                'from' => $complianceUsers->firstItem(),
                'to' => $complianceUsers->lastItem(),
            ]
        ]);
    }

    /**
     * Display the specified compliance user information.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $complianceUser = ComplianceUser::with(['user', 'user.information'])->find($id);
        
        if (!$complianceUser) {
            return response()->json([
                'success' => false,
                'message' => 'Compliance user information not found'
            ], 404);
        }
        
        // Add null check for user relationship
        $user = $complianceUser->user;
        
        // Get user information if available
        $userInfo = $user ? $user->information : null;
        
        $formattedData = [
            'id' => $complianceUser->id,
            'user_id' => $user ? $user->id : null,
            'company_name' => $userInfo ? ($userInfo->company_name ?? 'N/A') : 'N/A', // Get company_name from user_information
            'compliance_status' => $complianceUser->compliance_status ?: ComplianceUser::STATUS_PENDING,
            'state_registration_status' => $complianceUser->state_registration_status ?: ComplianceUser::STATUS_PENDING,
            'bio_filing_status' => $complianceUser->bio_filing_status ?: ComplianceUser::STATUS_PENDING,
            'ein_filing_status' => $complianceUser->ein_filing_status ?: ComplianceUser::STATUS_PENDING,
            'bank_registration_status' => $complianceUser->bank_registration_status ?: ComplianceUser::STATUS_PENDING,
            'annual_franchise_tax' => $complianceUser->annual_franchise_tax ?? 'N/A',
            'annual_irs_tax' => $complianceUser->annual_irs_tax ?? 'N/A',
            'process_status' => $complianceUser->process_status ?: ComplianceUser::STATUS_PENDING,
            'created_at' => $complianceUser->created_at,
            'updated_at' => $complianceUser->updated_at
        ];
        
        return response()->json([
            'success' => true,
            'data' => $formattedData
        ]);
    }

    /**
     * Store a newly created compliance user information in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'compliance_status' => 'required|string|in:done,in progress,pending',
            'state_registration_status' => 'required|string|in:done,in progress,pending',
            'bio_filing_status' => 'required|string|in:done,in progress,pending',
            'ein_filing_status' => 'required|string|in:done,in progress,pending',
            'bank_registration_status' => 'required|string|in:done,in progress,pending',
            'process_status' => 'required|string|in:done,in progress,pending',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $complianceUser = ComplianceUser::create($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Compliance user information created successfully',
            'data' => $complianceUser
        ], 201);
    }

    /**
     * Update the specified compliance user information in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $complianceUser = ComplianceUser::find($id);
        
        if (!$complianceUser) {
            return response()->json([
                'success' => false,
                'message' => 'Compliance user information not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'compliance_status' => 'string|in:done,in progress,pending',
            'state_registration_status' => 'string|in:done,in progress,pending',
            'bio_filing_status' => 'string|in:done,in progress,pending',
            'ein_filing_status' => 'string|in:done,in progress,pending',
            'bank_registration_status' => 'string|in:done,in progress,pending',
            'process_status' => 'string|in:done,in progress,pending',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $complianceUser->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Compliance user information updated successfully',
            'data' => $complianceUser
        ]);
    }

    /**
     * Remove the specified compliance user information from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $complianceUser = ComplianceUser::find($id);
        
        if (!$complianceUser) {
            return response()->json([
                'success' => false,
                'message' => 'Compliance user information not found'
            ], 404);
        }
        
        $complianceUser->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Compliance user information deleted successfully'
        ]);
    }
    
    /**
     * Upload documents for compliance user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadDocuments(Request $request, $id)
    {
        $complianceUser = ComplianceUser::find($id);
        
        if (!$complianceUser) {
            return response()->json([
                'success' => false,
                'message' => 'Compliance user information not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'document_type' => 'required|string|in:state_registration,boi_filing,ein_filing,bank_registration',
            'document' => 'required|file|max:10240', // Max 10MB
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Handle file upload
        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $userId = $complianceUser->user_id;
            $documentType = $request->input('document_type');
            
            // Get file extension
            $extension = $file->getClientOriginalExtension();
            
            // Create client-specific folder name
            $folderName = 'client_' . $userId;
            
            // Create filename based on document type and user ID
            $fileName = $documentType . '_' . $userId . '.' . $extension;
            
            // Store file in client-specific folder
            $filePath = $file->storeAs('compliance_documents/' . $folderName, $fileName, 'public');
            
            // Update the document path in the database based on document type
            $complianceUser->update([
                $documentType . '_document' => $filePath
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'data' => [
                    'document_type' => $documentType,
                    'file_path' => $filePath
                ]
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'No document provided'
        ], 400);
    }
    
    /**
     * Add tax information for compliance user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function addTaxInfo(Request $request, $id)
    {
        $complianceUser = ComplianceUser::find($id);
        
        if (!$complianceUser) {
            return response()->json([
                'success' => false,
                'message' => 'Compliance user information not found'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'annual_franchise_tax' => 'nullable|numeric',
            'annual_irs_tax' => 'nullable|numeric',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $complianceUser->update($request->only(['annual_franchise_tax', 'annual_irs_tax']));
        
        return response()->json([
            'success' => true,
            'message' => 'Tax information updated successfully',
            'data' => $complianceUser
        ]);
    }
    
    /**
     * Helper method to convert status to user-friendly text.
     *
     * @param  string|null  $status
     * @return string
     */
    private function getStatusText(?string $status): string
    {
        switch ($status) {
            case ComplianceUser::STATUS_DONE:
                return 'Completed';
            case ComplianceUser::STATUS_IN_PROGRESS:
                return 'In Progress';
            case ComplianceUser::STATUS_PENDING:
                return 'Pending';
            default:
                return 'N/A';
        }
    }
    
    /**
     * Helper method to convert compliance status to percentage text.
     * Note: This method is no longer used as we're returning raw status values.
     *
     * @param  string|null  $status
     * @return string
     */
    private function getComplianceStatusText(?string $status): string
    {
        switch ($status) {
            case ComplianceUser::STATUS_DONE:
                return '100%';
            case ComplianceUser::STATUS_IN_PROGRESS:
                return '50%';
            case ComplianceUser::STATUS_PENDING:
                return '0%';
            default:
                return 'N/A';
        }
    }
}
