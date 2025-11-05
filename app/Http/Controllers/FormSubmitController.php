<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\NotificationController;
use App\Models\User;
use App\Models\UserInformation;
use App\Models\ClientUploadedFile;
use App\Models\UserStageItem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class FormSubmitController extends Controller
{
    /**
     * Generate a secure URL for a private file
     *
     * @param string $path Path relative to the private storage directory
     * @param int $userId User ID who owns the file
     * @param string $type Document type (passport, proof_address, signature)
     * @return string Secure URL with temporary signed access
     */
    private function getSecureFileUrl($path, $userId, $type)
    {
        // Generate a signed URL that expires in 30 minutes
        return URL::temporarySignedRoute(
            'document.view',
            now()->addMinutes(30),
            [
                'userId' => $userId,
                'documentType' => $type,
                'filePath' => $path
            ]
        );
    }

    public function store(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'firstName' => 'required|string|max:255',
                'lastName' => 'required|string|max:255',
                'emailAddress' => 'required|email|max:255',
                'contactNumber' => 'required|string|max:255',
                'ssn' => 'nullable|string|max:255',
                'country' => 'required|string|max:255',
                'streetAddress' => 'required|string|max:255',
                'streetAddressLine2' => 'nullable|string|max:255',
                'city' => 'required|string|max:255',
                'state' => 'required|string|max:255',
                'zipCode' => 'required|string|max:255',
                'companyName' => 'nullable|string|max:255',
                'companyType' => 'nullable|string|max:255',
                'companyWebsite' => 'nullable|string|max:255',
                'companyIndustry' => 'nullable|string|max:255',
                'companyDesignator' => 'nullable|string|max:255',
                'stateRegistration' => 'nullable|string|max:255',
                'passport_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:4096',
                'passport_file_path' => 'nullable|string',
                'proof_address_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:4096',
                'proof_address_file_path' => 'nullable|string',
                'signature_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:4096',
                'signature_file_path' => 'nullable|string',
                'user_id' => 'required', // from auth or frontend
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        // Save to user_information
        $userInfo = UserInformation::create([
            'user_id' => $validated['user_id'],
            'first_name' => $validated['firstName'],
            'last_name' => $validated['lastName'],
            'email_address' => $validated['emailAddress'],
            'contact_number' => $validated['contactNumber'],
            'ssn' => $validated['ssn'] ?? null,
            'country' => $validated['country'],
            'address_one' => $validated['streetAddress'],
            'address_two' => $validated['streetAddressLine2'] ?? null,
            'city' => $validated['city'],
            'state' => $validated['state'],
            'zip_code' => $validated['zipCode'],
            'company_name' => $validated['companyName'] ?? null,
            'company_type' => $validated['companyType'] ?? null,
            'company_website' => $validated['companyWebsite'] ?? null,
            'company_industry' => $validated['companyIndustry'] ?? null,
            'company_designator' => $validated['companyDesignator'] ?? null,
            'state_registration' => $validated['stateRegistration'] ?? null,
        ]);

        // Handle file uploads and save to client_uploaded_files
        $fileData = [
            'user_id' => $validated['user_id'],
            'passport_file_name' => null,
            'proof_address_file_name' => null,
            'signature_file_name' => null,
        ];

        // We'll use Laravel's private storage instead of public directory

        // Handle passport file
        if ($request->hasFile('passport_file')) {
            $file = $request->file('passport_file');
            $filePath = $request->input('passport_file_path'); // Contains the full path with user ID

            // Make sure the directory exists
            $directory = dirname(storage_path('app/private/client_upload/' . $filePath));
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
                Log::info("Created directory: {$directory}");
            }

            // Store the file in private storage with the secure path
            $storedPath = Storage::disk('private')->putFileAs(
                'client_upload', // Base directory in private storage
                $file,
                $filePath // Already includes client_ID/document_type/filename
            );

            $fileData['passport_file_name'] = $filePath; // Store the full path
            Log::info("Passport file saved to private storage: {$storedPath}");
        }

        // Handle proof of address file
        if ($request->hasFile('proof_address_file')) {
            $file = $request->file('proof_address_file');
            $filePath = $request->input('proof_address_file_path');

            // Make sure the directory exists
            $directory = dirname(storage_path('app/private/client_upload/' . $filePath));
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
                Log::info("Created directory: {$directory}");
            }

            // Store the file in private storage with the secure path
            $storedPath = Storage::disk('private')->putFileAs(
                'client_upload',
                $file,
                $filePath
            );

            $fileData['proof_address_file_name'] = $filePath;
            Log::info("Proof of address file saved to private storage: {$storedPath}");
        }

        // Handle signature file
        if ($request->hasFile('signature_file')) {
            $file = $request->file('signature_file');
            $filePath = $request->input('signature_file_path');

            // Make sure the directory exists
            $directory = dirname(storage_path('app/private/client_upload/' . $filePath));
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
                Log::info("Created directory: {$directory}");
            }

            // Store the file in private storage with the secure path
            $storedPath = Storage::disk('private')->putFileAs(
                'client_upload',
                $file,
                $filePath
            );

            $fileData['signature_file_name'] = $filePath;
            Log::info("Signature file saved to private storage: {$storedPath}");
        }

        // Save file information to database
        $uploadedFiles = ClientUploadedFile::create($fileData);
        
        // Get user details for notification
        $user = User::find($validated['user_id']);
        
        // Notify admins about profile completion and document uploads
        try {
            $notificationController = new NotificationController();
            
            // Prepare list of uploaded documents for notification
            $uploadedDocuments = [];
            if ($fileData['passport_file_name']) $uploadedDocuments[] = 'Passport';
            if ($fileData['proof_address_file_name']) $uploadedDocuments[] = 'Proof of Address';
            if ($fileData['signature_file_name']) $uploadedDocuments[] = 'Signature';
            
            $uploadedDocumentsText = !empty($uploadedDocuments) ? 
                'Uploaded documents: ' . implode(', ', $uploadedDocuments) : 
                'No documents uploaded';
                
            $notificationController->notifyAdmins(
                'User Profile Completed',
                "User {$user->name} ({$user->email}) has completed their profile and uploaded supporting documents. {$uploadedDocumentsText}",
                [
                    'type' => 'profile_completion',
                    'data' => [
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'company_name' => $validated['companyName'] ?? null,
                        'uploaded_documents' => $uploadedDocuments,
                        'completed_at' => now()->toDateTimeString()
                    ]
                ]
            );
        } catch (\Exception $e) {
            // Log error but continue with the process
            Log::error('Failed to send admin notification about profile completion', ['error' => $e->getMessage()]);
        }

        // Update Profile Setup stage status to completed and activate next stage
        $profileSetupCompleted = false;
        $nextStageActivated = false;
        try {
            $profileSetupStage = UserStageItem::where('user_id', $validated['user_id'])
                ->whereHas('stageItem', function ($query) {
                    $query->where('name', 'Profile Setup');
                })
                ->where('status', UserStageItem::STATUS_ACTIVE)
                ->first();

            if ($profileSetupStage) {
                $profileSetupCompleted = $profileSetupStage->markAsCompleted();

                // Specifically target and activate the Payment stage item (stage_item_id = 2)
                $nextStageItem = UserStageItem::where('user_id', $validated['user_id'])
                    ->whereHas('stageItem', function ($query) {
                        $query->where('name', 'Payment');
                    })
                    ->where('status', UserStageItem::STATUS_PENDING)
                    ->first();
                
                // If we can't find it by name, try to find it by ID
                if (!$nextStageItem) {
                    $nextStageItem = UserStageItem::where('user_id', $validated['user_id'])
                        ->where('stage_item_id', 2) // Payment stage item ID
                        ->where('status', UserStageItem::STATUS_PENDING)
                        ->first();
                }
                
                // Log for debugging
                Log::info('Next stage item search result:', [
                    'found' => $nextStageItem ? true : false,
                    'stage_item_id' => $nextStageItem ? $nextStageItem->stage_item_id : null,
                    'status' => $nextStageItem ? $nextStageItem->status : null
                ]);

                if ($nextStageItem) {
                    $nextStageActivated = $nextStageItem->update([
                        'status' => UserStageItem::STATUS_ACTIVE
                    ]);
                    
                    Log::info('Payment stage activated successfully:', [
                        'stage_item_id' => $nextStageItem->stage_item_id,
                        'new_status' => UserStageItem::STATUS_ACTIVE,
                        'success' => $nextStageActivated
                    ]);
                } else {
                    Log::warning('Could not find Payment stage item to activate for user:', [
                        'user_id' => $validated['user_id']
                    ]);
                    
                    // Let's log all user's stage items for debugging
                    $allUserStageItems = UserStageItem::where('user_id', $validated['user_id'])->get();
                    Log::info('All user stage items:', $allUserStageItems->toArray());
                }
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the entire request
            \Log::error('Failed to update Profile Setup stage: ' . $e->getMessage());
        }

        // Generate secure URLs for the uploaded files
        $fileUrls = [];
        $userId = $validated['user_id'];

        if ($fileData['passport_file_name']) {
            $fileUrls['passport_url'] = $this->getSecureFileUrl($fileData['passport_file_name'], $userId, 'passport');
        }
        if ($fileData['proof_address_file_name']) {
            $fileUrls['proof_address_url'] = $this->getSecureFileUrl($fileData['proof_address_file_name'], $userId, 'proof_address');
        }
        if ($fileData['signature_file_name']) {
            $fileUrls['signature_url'] = $this->getSecureFileUrl($fileData['signature_file_name'], $userId, 'signature');
        }

        return response()->json([
            'message' => 'Form submitted successfully',
            'user_information' => $userInfo,
            'uploaded_files' => $uploadedFiles,
            'file_urls' => $fileUrls,
            'profile_setup_completed' => $profileSetupCompleted,
            'next_stage_activated' => $nextStageActivated
        ], 201);
    }
}
