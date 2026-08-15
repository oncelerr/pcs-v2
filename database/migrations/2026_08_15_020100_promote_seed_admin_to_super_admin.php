<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Promotes the seeded root admin account (see DatabaseSeeder) to
     * Super Admin, so there's always at least one account that can see
     * the admin activity log after the role is introduced.
     */
    public function up(): void
    {
        $superAdminRole = DB::table('roles')->where('name', 'Super Admin')->first();

        if (!$superAdminRole) {
            return;
        }

        DB::table('users')
            ->where('email', 'admin@gmail.com')
            ->update(['role_id' => $superAdminRole->id]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $adminRole = DB::table('roles')->where('name', 'Admin')->first();

        if (!$adminRole) {
            return;
        }

        DB::table('users')
            ->where('email', 'admin@gmail.com')
            ->update(['role_id' => $adminRole->id]);
    }
};
