<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserInformation;
use App\Models\ClientUploadedFile;
use App\Models\UserStageItem;

class FormSubmitController extends Controller
{
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
                'passport_file_name' => 'nullable|string|max:255',
                'proof_address_file_name' => 'nullable|string|max:255',
                'signature_file_name' => 'nullable|string|max:255',
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

        // Save to client_uploaded_files
        $uploadedFiles = ClientUploadedFile::create([
            'user_id' => $validated['user_id'],
            'passport_file_name' => $validated['passport_file_name'] ?? null,
            'proof_address_file_name' => $validated['proof_address_file_name'] ?? null,
            'signature_file_name' => $validated['signature_file_name'] ?? null,
        ]);

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
                
                // Find and activate the next stage item
                $currentStageItemId = $profileSetupStage->stage_item_id;
                $nextStageItem = UserStageItem::where('user_id', $validated['user_id'])
                    ->where('stage_item_id', $currentStageItemId + 1)
                    ->where('status', UserStageItem::STATUS_PENDING)
                    ->first();
                
                if ($nextStageItem) {
                    $nextStageActivated = $nextStageItem->update([
                        'status' => UserStageItem::STATUS_ACTIVE
                    ]);
                }
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the entire request
            \Log::error('Failed to update Profile Setup stage: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Form submitted successfully',
            'user_information' => $userInfo,
            'uploaded_files' => $uploadedFiles,
            'profile_setup_completed' => $profileSetupCompleted,
            'next_stage_activated' => $nextStageActivated
        ], 201);
    }
}
