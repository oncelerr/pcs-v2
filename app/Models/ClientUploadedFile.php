<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientUploadedFile extends Model
{
    use HasFactory;

    protected $table = 'client_uploaded_files';

    protected $fillable = [
        'user_id',
        'passport_file_name',
        'proof_address_file_name',
        'signature_file_name',
    ];

    /**
     * If user_id actually references users.id
     * (but note: it’s varchar right now in your SQL dump).
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
