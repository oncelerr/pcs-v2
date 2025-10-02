<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('client_uploaded_files', function (Blueprint $table) {
            $table->id();
            $table->string('user_id'); // varchar(255) from your dump
            $table->string('passport_file_name')->nullable();
            $table->string('proof_address_file_name')->nullable();
            $table->string('signature_file_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_uploaded_files');
    }
};
