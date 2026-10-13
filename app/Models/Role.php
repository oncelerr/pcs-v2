<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Defines available user roles (user, admin, super_admin) for access control
class Role extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
    ];

    /**
     * Get the users that belong to the role.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
