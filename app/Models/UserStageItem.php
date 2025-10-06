<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStageItem extends Model
{
    /**
     * The status constants for the user stage item.
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_DONE = 'completed';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'stage_id',
        'stage_item_id',
        'status',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user that owns the user stage item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the stage that owns the user stage item.
     */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    /**
     * Get the stage item that owns the user stage item.
     */
    public function stageItem(): BelongsTo
    {
        return $this->belongsTo(StageItem::class);
    }

    /**
     * Mark the item as completed.
     */
    public function markAsCompleted(): bool
    {
        return $this->update([
            'status' => self::STATUS_DONE,
            'completed_at' => $this->completed_at ?? now(),
        ]);
    }

    /**
     * Check if the item is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_DONE;
    }

    /**
     * Check if the item is active.
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if the item is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
}
