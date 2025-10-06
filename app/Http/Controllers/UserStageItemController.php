<?php

namespace App\Http\Controllers;

use App\Models\UserStageItem;
use App\Models\StageItem;
use App\Models\Stage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserStageItemController extends Controller
{
    /**
     * Display a listing of the user stage items.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }
        
        $userStageItems = UserStageItem::where('user_id', $user->id)
            ->with(['stage', 'stageItem'])
            ->get();
            
        return response()->json([
            'user_stage_items' => $userStageItems
        ]);
    }
    
    /**
     * Display the specified user stage item.
     *
     * @param  int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }
        
        $userStageItem = UserStageItem::where('id', $id)
            ->where('user_id', $user->id)
            ->with(['stage', 'stageItem'])
            ->first();
            
        if (!$userStageItem) {
            return response()->json([
                'message' => 'User stage item not found',
            ], 404);
        }
        
        return response()->json([
            'user_stage_item' => $userStageItem
        ]);
    }
    
    /**
     * Update the specified user stage item.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }
        
        // Validate the request
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|required|in:' . 
                UserStageItem::STATUS_PENDING . ',' . 
                UserStageItem::STATUS_ACTIVE . ',' . 
                UserStageItem::STATUS_DONE,
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        // Find the user stage item
        $userStageItem = UserStageItem::where('id', $id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$userStageItem) {
            return response()->json([
                'message' => 'User stage item not found',
            ], 404);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update the user stage item
            $data = $request->only(['status']);
            
            // If status is being set to completed, set the completed_at timestamp
            if (isset($data['status']) && $data['status'] === UserStageItem::STATUS_DONE) {
                $data['completed_at'] = now();
            }
            
            $userStageItem->update($data);
            
            // If the item is marked as completed, check if the entire stage is completed
            if (isset($data['status']) && $data['status'] === UserStageItem::STATUS_DONE) {
                $this->checkAndUpdateStageCompletion($user->id, $userStageItem->stage_id);
            }
            
            DB::commit();
            
            return response()->json([
                'message' => 'User stage item updated successfully',
                'user_stage_item' => $userStageItem->fresh()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to update user stage item',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Mark a user stage item as completed.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsCompleted(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }
        
        // Find the user stage item
        $userStageItem = UserStageItem::where('id', $id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$userStageItem) {
            return response()->json([
                'message' => 'User stage item not found',
            ], 404);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Mark as completed using the model method
            $result = $userStageItem->markAsCompleted();
            
            if ($result) {
                // Check if the entire stage is completed
                $this->checkAndUpdateStageCompletion($user->id, $userStageItem->stage_id);
                
                DB::commit();
                
                return response()->json([
                    'message' => 'User stage item marked as completed',
                    'user_stage_item' => $userStageItem->fresh()
                ]);
            }
            
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to mark user stage item as completed',
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to mark user stage item as completed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update the status of a user stage item.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }
        
        // Validate the request
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:' . 
                UserStageItem::STATUS_PENDING . ',' . 
                UserStageItem::STATUS_ACTIVE . ',' . 
                UserStageItem::STATUS_DONE,
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }
        
        // Find the user stage item
        $userStageItem = UserStageItem::where('id', $id)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$userStageItem) {
            return response()->json([
                'message' => 'User stage item not found',
            ], 404);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update the status
            $status = $request->input('status');
            $userStageItem->status = $status;
            
            // If status is being set to completed, set the completed_at timestamp
            if ($status === UserStageItem::STATUS_DONE) {
                $userStageItem->completed_at = now();
            }
            
            $userStageItem->save();
            
            // If the item is marked as completed, check if the entire stage is completed
            if ($status === UserStageItem::STATUS_DONE) {
                $this->checkAndUpdateStageCompletion($user->id, $userStageItem->stage_id);
            }
            
            DB::commit();
            
            return response()->json([
                'message' => 'User stage item status updated successfully',
                'user_stage_item' => $userStageItem
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to update user stage item status',
                'error' => $e->getMessage()
            ], 500);
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
