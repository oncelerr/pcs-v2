<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $excludedEmails = ['admin@example.com', 'user@example.com'];

        for ($i = 1; $i <= 30; $i++) {
            $email = fake()->unique()->safeEmail();

            // Skip if matches excluded
            if (in_array($email, $excludedEmails)) {
                continue;
            }

            User::create([
                'name' => fake()->name(),
                'email' => $email,
                'username' => fake()->unique()->userName(),
                'password' => Hash::make('password123'),
                'role_id' => 2, // regular user
                'email_verified_at' => now(),
            ]);
        }
    }
}
