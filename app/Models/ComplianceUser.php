<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplianceUser extends Model
{
    /**
     * Status constants
     */
    const STATUS_DONE = 'done';
    const STATUS_IN_PROGRESS = 'in progress';
    const STATUS_PENDING = 'pending';
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'compliance_status',
        'state_registration_status',
        'bio_filing_status',
        'ein_filing_status',
        'bank_registration_status',
        'process_status',
        'annual_franchise_tax',
        'annual_irs_tax',
    ];

    /**
     * Get the user that owns the compliance record.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Check if compliance status is done.
     *
     * @return bool
     */
    public function isComplianceDone(): bool
    {
        return $this->compliance_status === self::STATUS_DONE;
    }
    
    /**
     * Check if compliance status is in progress.
     *
     * @return bool
     */
    public function isComplianceInProgress(): bool
    {
        return $this->compliance_status === self::STATUS_IN_PROGRESS;
    }
    
    /**
     * Check if compliance status is pending.
     *
     * @return bool
     */
    public function isCompliancePending(): bool
    {
        return $this->compliance_status === self::STATUS_PENDING;
    }
    
    /**
     * Get overall process completion percentage.
     *
     * @return int
     */
    public function getCompletionPercentage(): int
    {
        $statuses = [
            $this->compliance_status,
            $this->state_registration_status,
            $this->bio_filing_status,
            $this->ein_filing_status,
            $this->bank_registration_status,
            $this->process_status
        ];
        
        $doneCount = count(array_filter($statuses, function($status) {
            return $status === self::STATUS_DONE;
        }));
        
        $totalFields = count($statuses);
        
        return $totalFields > 0 ? (int) round(($doneCount / $totalFields) * 100) : 0;
    }
}
