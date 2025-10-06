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
        Schema::table('compliance_users', function (Blueprint $table) {
            // Drop existing columns that need to be modified
            $table->dropColumn([
                'compliance_status',
                'state_registration_status',
                'bio_filing_status',
                'ein_filing_status',
                'bank_registration_status',
                'process_status',
            ]);
        });

        Schema::table('compliance_users', function (Blueprint $table) {
            // Re-add columns with enum values
            $table->enum('compliance_status', ['done', 'in progress', 'pending'])->nullable()->after('user_id');
            $table->enum('state_registration_status', ['done', 'in progress', 'pending'])->nullable()->after('compliance_status');
            $table->enum('bio_filing_status', ['done', 'in progress', 'pending'])->nullable()->after('state_registration_status');
            $table->enum('ein_filing_status', ['done', 'in progress', 'pending'])->nullable()->after('bio_filing_status');
            $table->enum('bank_registration_status', ['done', 'in progress', 'pending'])->nullable()->after('ein_filing_status');
            $table->enum('process_status', ['done', 'in progress', 'pending'])->nullable()->after('bank_registration_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('compliance_users', function (Blueprint $table) {
            // Drop enum columns
            $table->dropColumn([
                'compliance_status',
                'state_registration_status',
                'bio_filing_status',
                'ein_filing_status',
                'bank_registration_status',
                'process_status',
            ]);
        });

        Schema::table('compliance_users', function (Blueprint $table) {
            // Re-add columns as regular strings
            $table->string('compliance_status')->nullable()->after('user_id');
            $table->string('state_registration_status')->nullable()->after('compliance_status');
            $table->string('bio_filing_status')->nullable()->after('state_registration_status');
            $table->string('ein_filing_status')->nullable()->after('bio_filing_status');
            $table->string('bank_registration_status')->nullable()->after('ein_filing_status');
            $table->string('process_status')->nullable()->after('bank_registration_status');
        });
    }
};
