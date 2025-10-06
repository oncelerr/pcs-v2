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
        Schema::create('compliance_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('compliance_status')->nullable();
            $table->string('state_registration_status')->nullable();
            $table->string('bio_filing_status')->nullable();
            $table->string('ein_filing_status')->nullable();
            $table->string('bank_registration_status')->nullable();
            $table->string('process_status')->nullable();
            $table->string('annual_franchise_tax')->nullable();
            $table->string('annual_irs_tax')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_users');
    }
};
