<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserInformation extends Model
{
    use HasFactory;

    protected $table = 'user_information';

    protected $fillable = [
        'user_id',
        'existing_record',
        'first_name',
        'middle_name',
        'last_name',
        'suffix_name',
        'country',
        'email_address',
        'contact_number',
        'ssn',
        'address_one',
        'address_two',
        'city',
        'state',
        'zip_code',
        'avail_service',
        'company_name',
        'company_type',
        'company_industry',
        'company_designator',
        'state_registration',
        'company_website',
        'business_description',
    ];

    /**
     * Relation to User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
