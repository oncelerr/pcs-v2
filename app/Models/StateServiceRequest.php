<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StateServiceRequest extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'state_service_requests';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'email',
        'company_name',
        'state_of_registration',
        'service_type',
        'description',
        'status',
        'terms_accepted_at',
        'admin_notes',
        'completed_at',
        'assigned_to',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'terms_accepted_at' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Available service types
     *
     * @var array<string>
     */
    public const SERVICE_TYPES = [
        'amendment' => 'Amendment',
        'certificate_of_good_standing' => 'Certificate of Good Standing',
        'fictitious_name_dba' => 'Fictitious Name (DBA)',
        'itin' => 'Individual Taxpayer Identification Number (ITIN)',
        'apostilled_document' => 'Apostilled Document',
        'register_trademark' => 'Register a Trademark',
        'company_dissolution' => 'Company Dissolution',
        'ein_registration' => 'EIN Registration',
        'boi_report' => 'Beneficial Ownership Information Report (BOI)',
        'registered_agents_subscription' => 'Registered Agents Subscription',
        'us_bank_account' => 'US Bank Account Registration',
        'state_compliance_reporting' => 'State Compliance Reporting',
        'change_of_registered_agents' => 'Change of Registered Agents',
        'virtual_address' => 'Virtual Address',
        'us_phone_number' => 'US Phone Number',
        'annual_tax_return' => 'Annual Tax Return Filing (soon)',
    ];

    /**
     * Available statuses
     *
     * @var array<string>
     */
    public const STATUSES = [
        'pending' => 'Pending',
        'in_progress' => 'In Progress',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ];

    /**
     * Get the user who submitted the request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the admin user assigned to this request.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Scope a query to only include pending requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include in-progress requests.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope a query to only include completed requests.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include cancelled requests.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope a query to filter by service type.
     */
    public function scopeOfServiceType($query, string $serviceType)
    {
        return $query->where('service_type', $serviceType);
    }

    /**
     * Scope a query to filter by user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to filter by assigned admin.
     */
    public function scopeAssignedTo($query, int $adminId)
    {
        return $query->where('assigned_to', $adminId);
    }

    /**
     * Check if the request is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the request is in progress.
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if the request is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the request is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Mark the request as in progress.
     */
    public function markAsInProgress(?int $assignedToId = null): bool
    {
        $this->status = 'in_progress';
        if ($assignedToId) {
            $this->assigned_to = $assignedToId;
        }
        return $this->save();
    }

    /**
     * Mark the request as completed.
     */
    public function markAsCompleted(?string $adminNotes = null): bool
    {
        $this->status = 'completed';
        $this->completed_at = now();
        if ($adminNotes) {
            $this->admin_notes = $adminNotes;
        }
        return $this->save();
    }

    /**
     * Mark the request as cancelled.
     */
    public function markAsCancelled(?string $reason = null): bool
    {
        $this->status = 'cancelled';
        if ($reason) {
            $this->admin_notes = $reason;
        }
        return $this->save();
    }

    /**
     * Get the human-readable service type name.
     */
    public function getServiceTypeNameAttribute(): string
    {
        return self::SERVICE_TYPES[$this->service_type] ?? $this->service_type;
    }

    /**
     * Get the human-readable status name.
     */
    public function getStatusNameAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    /**
     * Get the status badge color for UI.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'warning',
            'in_progress' => 'info',
            'completed' => 'success',
            'cancelled' => 'danger',
            default => 'secondary',
        };
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Automatically set terms_accepted_at when creating
        static::creating(function ($model) {
            if (!$model->terms_accepted_at) {
                $model->terms_accepted_at = now();
            }
        });
    }
}