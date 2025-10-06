<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create roles if not exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Create base admin account
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'email_verified_at' => now(),
            ]
        );

        // Create base user account
        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Test User',
                'username' => 'user',
                'password' => Hash::make('password'),
                'role_id' => $userRole->id,
                'email_verified_at' => now(),
            ]
        );

        // Run migrations for stages and other tables
        $this->call([
            StagesTableSeeder::class,
            UserSeeder::class,              // 👈 seeds new users starting after admin/user
            UserInformationSeeder::class,   // 👈 attaches info to new users only
        ]);
    }
}
