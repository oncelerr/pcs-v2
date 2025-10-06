<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserInformation;
use Illuminate\Support\Str;

class UserInformationSeeder extends Seeder
{
    public function run(): void
    {
        $countries = ['Philippines', 'United States', 'Canada', 'Australia', 'United Kingdom'];
        $industries = ['Technology', 'Finance', 'Healthcare', 'Construction', 'Education', 'Retail'];
        $types = ['Sole Proprietorship', 'Corporation', 'LLC', 'Partnership'];
        $services = ['Accounting', 'Legal', 'Consulting', 'Marketing', 'IT Support', 'Design'];

        // Get users except admin and base user
        $users = User::whereNotIn('email', ['admin@example.com', 'user@example.com'])->get();

        foreach ($users as $user) {
            // Skip if already has info (avoid duplicates)
            if ($user->information()->exists()) {
                continue;
            }

            UserInformation::create([
                'user_id' => $user->id,
                'existing_record' => fake()->boolean(),
                'first_name' => fake()->firstName(),
                'middle_name' => fake()->optional()->firstName(),
                'last_name' => fake()->lastName(),
                'suffix_name' => fake()->optional()->randomElement(['Jr.', 'Sr.', 'III']),
                'country' => fake()->randomElement($countries),
                'email_address' => $user->email, // use user’s actual email
                'contact_number' => '+63' . fake()->numerify('9#########'),
                'ssn' => strtoupper(Str::random(10)),
                'address_one' => fake()->streetAddress(),
                'address_two' => fake()->optional()->secondaryAddress(),
                'city' => fake()->city(),
                'state' => fake()->state(),
                'zip_code' => fake()->postcode(),
                'avail_service' => fake()->randomElement($services),
                'company_name' => fake()->company(),
                'company_type' => fake()->randomElement($types),
                'company_industry' => fake()->randomElement($industries),
                'company_designator' => fake()->optional()->randomElement(['Inc.', 'Ltd.', 'Corp.', 'LLC']),
                'state_registration' => fake()->bothify('REG-#####'),
                'company_website' => fake()->domainName(),
            ]);
        }
    }
}
