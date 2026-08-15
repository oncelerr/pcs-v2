<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_report_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('admin_reports')->cascadeOnDelete();
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->enum('decision', ['approved', 'rejected']);
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['report_id', 'admin_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_report_approvals');
    }
};
