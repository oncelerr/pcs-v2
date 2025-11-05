<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Notification extends Model
{
    use HasFactory;

    // ✅ Table name (explicit since it's singular in migration)
    protected $table = 'notification';

    // ✅ Mass assignable columns
    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'data',
        'is_read',
        'read_at',
        'status',
        'action_url',
    ];

    // ✅ Cast columns to proper data types
    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * 📌 Relationship: Notification belongs to a user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 🔧 Accessor: check if notification is unread
     */
    public function isUnread(): bool
    {
        return !$this->is_read;
    }

    /**
     * ✅ Mark as read
     */
    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }
}
