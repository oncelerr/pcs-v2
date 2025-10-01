<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stage;
use App\Models\UserStageItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserProgressController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Load all stages with their items
        $stages = Stage::with('items')->get();

        // Get user’s progress
        $userStageItems = UserStageItem::where('user_id', $user->id)->get()
            ->keyBy('stage_item_id'); // for quick lookup

        $result = $stages->map(function ($stage, $stageIndex) use ($userStageItems) {
            // Default stage status (first = active, rest = pending)
            $stageStatus = $stageIndex === 0 ? 'active' : 'pending';

            $items = $stage->items->map(function ($item, $itemIndex) use ($userStageItems, $stageIndex) {
                $userItem = $userStageItems->get($item->id);

                return [
                    'name' => $item->name,
                    'status' => $userItem
                        ? $userItem->status // from user_stage_items
                        : ($itemIndex === 0 && $stageIndex === 0 ? 'active' : 'pending')
                ];
            });

            // If any item is active, mark stage as active
            if ($items->contains(fn($i) => $i['status'] === 'active')) {
                $stageStatus = 'active';
            }

            return [
                'name' => $stage->name,
                'status' => $stageStatus,
                'items' => $items,
            ];
        });

        return response()->json([
            'stages' => $result
        ]);
    }
}
