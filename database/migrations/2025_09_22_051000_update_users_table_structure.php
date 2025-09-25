<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop foreign key constraints safely using raw SQL
        $db = DB::connection()->getPdo();
        
        // Check if sessions table exists first
        $tableExists = DB::select("SHOW TABLES LIKE 'sessions'");
        
        if (!empty($tableExists)) {
            $result = DB::select("SHOW CREATE TABLE sessions");
            
            // Check if foreign key exists using regex
            if (isset($result[0]->{'Create Table'}) && 
                preg_match('/CONSTRAINT `sessions_user_id_foreign` FOREIGN KEY/', $result[0]->{'Create Table'})) {
                Schema::table('sessions', function (Blueprint $table) {
                    $table->dropForeign('sessions_user_id_foreign');
                });
            }
        }

        // Drop existing tables that reference users
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        
        // Recreate users table with exact structure
        Schema::dropIfExists('users');
        
        DB::statement("
            CREATE TABLE `users` (
                `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `email_verified_at` timestamp NULL DEFAULT NULL,
                `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                `otp` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                `otp_expires_at` timestamp NULL DEFAULT NULL,
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                `role_id` int(11) DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `users_email_unique` (`email`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Recreate the password reset tokens table
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Recreate the sessions table
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a one-way migration due to the complex changes
        throw new \RuntimeException('This migration cannot be reverted.');
    }
};
