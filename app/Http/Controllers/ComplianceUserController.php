<?php

namespace App\Http\Controllers;

use App\Models\ComplianceUser;
use App\Models\ClientComplianceFile;
use App\Models\User;
use App\Models\UserStageItem;
use App\Models\Stage;
use App\Models\StageItem;
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
        
        // Begin transaction to ensure data consistency
        DB::beginTransaction();
        
        try {
            // Get the fields being updated
            $updatedFields = $request->only([
                'compliance_status',
                'state_registration_status',
                'bio_filing_status',
                'ein_filing_status',
                'bank_registration_status',
                'process_status'
            ]);
            
            // Update the compliance user record
            $complianceUser->update($updatedFields);
            
            // Update corresponding user stage items based on the updated fields
            $this->updateUserStageItems($complianceUser->user_id, $updatedFields);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Compliance user information updated successfully',
                'data' => $complianceUser
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating compliance user: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update compliance user information',
                'error' => $e->getMessage()
            ], 500);
        }
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
            'document_type' => 'required|string|in:compliance,state_registration,boi_filing,bio_filing,ein_filing,bank_registration,registration_agent_service,business_license_research,trademark_registration,dba_registration,copyright_registration,brand_strategy_consultation,business_address,mail_forwarding,meeting_room_access,phone_answering_service,virtual_receptionist',
            'document' => 'required|file|max:10240', // Max 10MB
            'naming' => 'nullable|string', // Optional title/name for the document
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
            
            // Create base filename based on document type and user ID
            $baseFileName = $documentType . '_' . $userId;
            
            // Check if file already exists and add sequential numbering if needed
            $counter = 0;
            $fileName = $baseFileName . '.' . $extension;
            $fullPath = storage_path('app/public/compliance_documents/' . $folderName . '/' . $fileName);
            
            while (file_exists($fullPath)) {
                $counter++;
                $fileName = $baseFileName . '(' . $counter . ').' . $extension;
                $fullPath = storage_path('app/public/compliance_documents/' . $folderName . '/' . $fileName);
            }
            
            // Store file in client-specific folder
            $filePath = $file->storeAs('compliance_documents/' . $folderName, $fileName, 'public');
            
            // Update the document path in the database based on document type
            $complianceUser->update([
                $documentType . '_document' => $filePath
            ]);
            
            // Get the naming/title for the document (use filename if not provided)
            $naming = $request->input('naming') ?? $file->getClientOriginalName();
            
            // Map document_type to column_for format
            $columnFor = $documentType;
            
            // Handle special cases
            if ($documentType === 'boi_filing' || $documentType === 'bio_filing') {
                $columnFor = 'bio_filing';
            } elseif ($documentType === 'compliance') {
                $columnFor = 'compliance';
            }
            
            // Add _status suffix to match the column names in ComplianceUser
            $columnFor .= '_status';
            
            // Save record to client_compliance_files table
            $clientComplianceFile = ClientComplianceFile::create([
                'user_id' => $userId,
                'file_name' => $fileName,
                'column_for' => $columnFor,
                'naming' => $naming
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'data' => [
                    'document_type' => $documentType,
                    'file_path' => $filePath,
                    'compliance_file' => $clientComplianceFile
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
            'annual_franchise_tax' => 'nullable|string', // Changed to string to store date
            'annual_irs_tax' => 'nullable|string', // Changed to string to store date
            'franchise_tax_document' => 'nullable|file|max:10240', // Max 10MB
            'irs_tax_document' => 'nullable|file|max:10240', // Max 10MB
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Update tax dates
        $complianceUser->update($request->only(['annual_franchise_tax', 'annual_irs_tax']));
        
        $userId = $complianceUser->user_id;
        $uploadedFiles = [];
        
        // Handle franchise tax document upload
        if ($request->hasFile('franchise_tax_document')) {
            $file = $request->file('franchise_tax_document');
            $extension = $file->getClientOriginalExtension();
            $folderName = 'client_' . $userId;
            
            // Create base filename
            $baseFileName = 'franchise_tax_' . $userId;
            
            // Check if file already exists and add sequential numbering if needed
            $counter = 0;
            $fileName = $baseFileName . '.' . $extension;
            $fullPath = storage_path('app/public/compliance_documents/' . $folderName . '/' . $fileName);
            
            while (file_exists($fullPath)) {
                $counter++;
                $fileName = $baseFileName . '(' . $counter . ').' . $extension;
                $fullPath = storage_path('app/public/compliance_documents/' . $folderName . '/' . $fileName);
            }
            
            // Store file
            $filePath = $file->storeAs('compliance_documents/' . $folderName, $fileName, 'public');
            
            // Save to client_compliance_files table
            $clientComplianceFile = ClientComplianceFile::create([
                'user_id' => $userId,
                'file_name' => $fileName,
                'column_for' => 'annual_franchise_tax',
                'naming' => 'Annual Franchise Tax Document'
            ]);
            
            $uploadedFiles['franchise_tax'] = [
                'file_path' => $filePath,
                'compliance_file' => $clientComplianceFile
            ];
        }
        
        // Handle IRS tax document upload
        if ($request->hasFile('irs_tax_document')) {
            $file = $request->file('irs_tax_document');
            $extension = $file->getClientOriginalExtension();
            $folderName = 'client_' . $userId;
            
            // Create base filename
            $baseFileName = 'irs_tax_' . $userId;
            
            // Check if file already exists and add sequential numbering if needed
            $counter = 0;
            $fileName = $baseFileName . '.' . $extension;
            $fullPath = storage_path('app/public/compliance_documents/' . $folderName . '/' . $fileName);
            
            while (file_exists($fullPath)) {
                $counter++;
                $fileName = $baseFileName . '(' . $counter . ').' . $extension;
                $fullPath = storage_path('app/public/compliance_documents/' . $folderName . '/' . $fileName);
            }
            
            // Store file
            $filePath = $file->storeAs('compliance_documents/' . $folderName, $fileName, 'public');
            
            // Save to client_compliance_files table
            $clientComplianceFile = ClientComplianceFile::create([
                'user_id' => $userId,
                'file_name' => $fileName,
                'column_for' => 'annual_irs_tax',
                'naming' => 'IRS Annual Tax Return Document'
            ]);
            
            $uploadedFiles['irs_tax'] = [
                'file_path' => $filePath,
                'compliance_file' => $clientComplianceFile
            ];
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Tax information updated successfully',
            'data' => [
                'compliance_user' => $complianceUser,
                'uploaded_files' => $uploadedFiles
            ]
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
    
    /**
     * Update user stage items based on compliance status changes.
     *
     * @param int $userId
     * @param array $updatedFields
     * @return void
     */
    private function updateUserStageItems(int $userId, array $updatedFields): void
    {
        // Map compliance fields to stage item names
        // Instead of hardcoding IDs, let's find the stage items by name
        $stateRegistrationItem = StageItem::where('name', 'State Registration')->first();
        $boiFilingItem = StageItem::where('name', 'BOI Filing')->first();
        $einFilingItem = StageItem::where('name', 'EIN Filing')->first();
        $bankRegistrationItem = StageItem::where('name', 'Bank Registration')->first();
        $complianceItem = StageItem::where('name', 'Compliance')->first();
        
        // Map fields to stage item IDs (if found)
        $fieldToStageItemMap = [
            'compliance_status' => $complianceItem ? $complianceItem->id : null,
            'state_registration_status' => $stateRegistrationItem ? $stateRegistrationItem->id : null,
            'bio_filing_status' => $boiFilingItem ? $boiFilingItem->id : null, // Maps to BOI Filing
            'ein_filing_status' => $einFilingItem ? $einFilingItem->id : null,
            'bank_registration_status' => $bankRegistrationItem ? $bankRegistrationItem->id : null,
        ];
        
        // Filter out null values (stage items not found)
        $fieldToStageItemMap = array_filter($fieldToStageItemMap);
        
        // Process each updated field
        foreach ($updatedFields as $field => $status) {
            // Skip if the field is not in our map
            if (!array_key_exists($field, $fieldToStageItemMap)) {
                continue;
            }
            
            $stageItemId = $fieldToStageItemMap[$field];
            
            // Get the stage item to determine its stage
            $stageItem = StageItem::find($stageItemId);
            if (!$stageItem) {
                continue;
            }
            
            // Find or create the user stage item
            $userStageItem = UserStageItem::firstOrCreate(
                ['user_id' => $userId, 'stage_item_id' => $stageItemId],
                ['stage_id' => $stageItem->stage_id, 'status' => UserStageItem::STATUS_PENDING]
            );
            
            // Map ComplianceUser status to UserStageItem status
            $userStageItemStatus = UserStageItem::STATUS_PENDING;
            if ($status === ComplianceUser::STATUS_IN_PROGRESS) {
                $userStageItemStatus = UserStageItem::STATUS_ACTIVE;
            } elseif ($status === ComplianceUser::STATUS_DONE) {
                $userStageItemStatus = UserStageItem::STATUS_DONE;
            }
            
            // Update the user stage item status
            $userStageItem->update([
                'status' => $userStageItemStatus,
                'completed_at' => $userStageItemStatus === UserStageItem::STATUS_DONE ? now() : null
            ]);
            
            // If item is completed, check if all items in the stage are completed
            if ($userStageItemStatus === UserStageItem::STATUS_DONE) {
                $this->checkAndUpdateStageCompletion($userId, $stageItem->stage_id);
            }
        }
    }
    
    /**
     * Check if all items in a stage are completed and update next stage if needed.
     *
     * @param int $userId
     * @param int $stageId
     * @return void
     */
    private function checkAndUpdateStageCompletion(int $userId, int $stageId): void
    {
        // Get all stage items for this stage
        $stageItems = StageItem::where('stage_id', $stageId)->get();
        $stageItemIds = $stageItems->pluck('id')->toArray();
        
        // Get user stage items for these stage items
        $userStageItems = UserStageItem::where('user_id', $userId)
            ->whereIn('stage_item_id', $stageItemIds)
            ->get();
            
        // Check if all items are completed
        $allCompleted = $userStageItems->count() === $stageItems->count() &&
            $userStageItems->every(function ($item) {
                return $item->status === UserStageItem::STATUS_DONE;
            });
            
        if ($allCompleted) {
            // Find the next stage
            $nextStage = Stage::where('id', '>', $stageId)->orderBy('id')->first();
            
            if ($nextStage) {
                // Get the first item of the next stage
                $nextStageFirstItem = StageItem::where('stage_id', $nextStage->id)
                    ->orderBy('id')
                    ->first();
                    
                if ($nextStageFirstItem) {
                    // Find or create user stage item for the first item of the next stage
                    $nextUserStageItem = UserStageItem::firstOrCreate(
                        ['user_id' => $userId, 'stage_item_id' => $nextStageFirstItem->id],
                        ['stage_id' => $nextStage->id, 'status' => UserStageItem::STATUS_PENDING]
                    );
                    
                    // Set it to active
                    $nextUserStageItem->update(['status' => UserStageItem::STATUS_ACTIVE]);
                }
            }
        }
    }
}
