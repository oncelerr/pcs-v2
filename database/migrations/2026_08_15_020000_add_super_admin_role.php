<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::table('roles')->where('name', 'Super Admin')->exists()) {
            return;
        }

        $nextId = (int) (DB::table('roles')->max('id') ?? 0) + 1;

        DB::table('roles')->insert([
            'id' => $nextId,
            'name' => 'Super Admin',
            'slug' => 'super-admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('roles')->where('name', 'Super Admin')->delete();
    }
};
