<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserStageItem;

class UserStageItemService
{
    public static function initializeFor(User $user): void
    {
        // Define your default rows
        $defaults = [
            ['stage_id' => 1, 'stage_item_id' => null, 'status' => UserStageItem::STATUS_ACTIVE],
            ['stage_id' => 2, 'stage_item_id' => null, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => 3, 'stage_item_id' => null, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => null, 'stage_item_id' => 1, 'status' => UserStageItem::STATUS_ACTIVE],
            ['stage_id' => null, 'stage_item_id' => 2, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => null, 'stage_item_id' => 3, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => null, 'stage_item_id' => 4, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => null, 'stage_item_id' => 5, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => null, 'stage_item_id' => 6, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => null, 'stage_item_id' => 7, 'status' => UserStageItem::STATUS_PENDING],
        ];

        foreach ($defaults as $row) {
            UserStageItem::create(array_merge($row, [
                'user_id' => $user->id,
            ]));
        }
    }

    public static function initializeForNewCandidate(User $user): void
    {
        // Define your default rows
        $defaults = [
            ['stage_id' => 1, 'stage_item_id' => null, 'status' => UserStageItem::STATUS_ACTIVE],
            ['stage_id' => 2, 'stage_item_id' => null, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => 3, 'stage_item_id' => null, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => null, 'stage_item_id' => 1, 'status' => UserStageItem::STATUS_DONE],
            ['stage_id' => null, 'stage_item_id' => 2, 'status' => UserStageItem::STATUS_DONE],
            ['stage_id' => null, 'stage_item_id' => 3, 'status' => UserStageItem::STATUS_ACTIVE],
            ['stage_id' => null, 'stage_item_id' => 4, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => null, 'stage_item_id' => 5, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => null, 'stage_item_id' => 6, 'status' => UserStageItem::STATUS_PENDING],
            ['stage_id' => null, 'stage_item_id' => 7, 'status' => UserStageItem::STATUS_PENDING],
        ];

        foreach ($defaults as $row) {
            UserStageItem::create(array_merge($row, [
                'user_id' => $user->id,
            ]));
        }
    }
}
