<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_reports', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['automated', 'manual']);
            $table->string('title');
            $table->longText('summary');
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->enum('status', ['generated', 'pending_approval', 'approved', 'rejected'])
                ->default('generated');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_reports');
    }
};
