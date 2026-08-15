<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Stage;
use App\Models\UserInformation;
use App\Models\ComplianceUser;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'username',
        'password',
        'otp',
        'otp_expires_at',
        'role_id',
        'is_profile_completed',
        'is_paid',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp',
        'otp_expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'otp_expires_at' => 'datetime',
            'password' => 'hashed',
            'is_profile_completed' => 'boolean',
            'is_paid' => 'boolean',
        ];
    }

    /**
     * Get the role that owns the user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the user's additional information.
     */
    public function information(): HasOne
    {
        return $this->hasOne(UserInformation::class);
    }
    
    /**
     * Get the user's compliance information.
     */
    public function compliance(): HasOne
    {
        return $this->hasOne(ComplianceUser::class);
    }
    
    /**
     * Check if the user has a specific role
     *
     * @param string $roleName
     * @return bool
     */
    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }

    /**
     * Check if the user has admin-level access. Super Admin is a superset
     * of Admin - anywhere a regular Admin is allowed, Super Admin is too.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role && in_array($this->role->name, ['Admin', 'Super Admin'], true);
    }

    /**
     * Check if the user has Super Admin access specifically.
     *
     * @return bool
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('Super Admin');
    }
}
