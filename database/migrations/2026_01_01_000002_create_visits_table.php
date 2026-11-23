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
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code')->unique();
            $table->string('visitor_name');
            $table->string('institution');
            $table->string('phone_number');
            $table->foreignId('division_id')->constrained('divisions')->onDelete('cascade');
            $table->integer('visitor_count')->default(1);
            $table->text('purpose');
            $table->longText('signature_base64');
            $table->enum('status', ['checked_in', 'checked_out'])->default('checked_in');
            $table->timestamp('check_in_time');
            $table->timestamp('check_out_time')->nullable();
            $table->foreignId('checked_out_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
