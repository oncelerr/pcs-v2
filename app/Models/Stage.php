<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stage extends Model
{
    protected $fillable = [
        'name',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship: Stage has many items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(StageItem::class, 'stage_id');
    }

    /**
     * Relationship: Stage has many user stage items.
     */
    public function userStageItems(): HasMany
    {
        return $this->hasMany(UserStageItem::class);
    }

    /**
     * Active items (if you use is_active column).
     */
    public function activeItems(): HasMany
    {
        return $this->items()->where('is_active', true);
    }
}
