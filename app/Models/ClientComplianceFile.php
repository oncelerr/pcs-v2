<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Stores metadata for compliance documents uploaded by admins on behalf of clients
class ClientComplianceFile extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'file_name',
        'column_for',
        'naming',
    ];

    /**
     * Get the user that owns the compliance file.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
