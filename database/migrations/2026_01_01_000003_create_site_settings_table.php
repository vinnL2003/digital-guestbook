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
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('organization_name')->default('Kantor Pemerintahan / Instansi Layanan');
            $table->string('welcome_title')->default('Selamat Datang di Buku Tamu Digital');
            $table->text('welcome_subtitle')->nullable();
            $table->string('logo_url')->nullable();
            $table->text('announcement_text')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
