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
        Schema::table('site_settings', function (Blueprint $table) {
            $table->string('security_induction_title')->nullable()->default('Security Induction PT PLN (Persero) UPT Manado');
            $table->longText('security_induction_content')->nullable();
            $table->boolean('is_security_induction_active')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'security_induction_title',
                'security_induction_content',
                'is_security_induction_active',
            ]);
        });
    }
};
