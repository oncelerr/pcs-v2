<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdminReport extends Model
{
    public const TYPE_AUTOMATED = 'automated';
    public const TYPE_MANUAL = 'manual';

    public const STATUS_GENERATED = 'generated';
    public const STATUS_PENDING_APPROVAL = 'pending_approval';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public const REQUIRED_APPROVALS = 2;

    protected $fillable = [
        'type',
        'title',
        'summary',
        'period_start',
        'period_end',
        'status',
        'created_by',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(AdminReportApproval::class, 'report_id');
    }
}
