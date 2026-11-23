<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - Sistem Manajemen Buku Tamu Digital
|--------------------------------------------------------------------------
*/

// Antarmuka Publik (Tamu & Registrasi)
Route::get('/', [GuestController::class, 'welcome'])->name('guest.welcome');
Route::get('/check-in', [GuestController::class, 'checkInForm'])->name('guest.check-in');
Route::post('/check-in', [GuestController::class, 'storeCheckIn'])->name('guest.check-in.store');
Route::get('/check-out', [GuestController::class, 'checkOutForm'])->name('guest.check-out');
Route::post('/check-out', [GuestController::class, 'processCheckOut'])->name('guest.check-out.process');
Route::get('/ticket/{ticket_code}', [GuestController::class, 'showTicket'])->name('guest.ticket');

// Dasbor Operator & Admin (Dilindungi Autentikasi)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/admin/sync-status', [DashboardController::class, 'syncStatus'])->name('admin.sync-status');
    Route::get('/admin/qr-poster', [DashboardController::class, 'qrPoster'])->name('admin.qr-poster');
    Route::post('/visits/{visit}/check-out', [DashboardController::class, 'checkOut'])->name('visits.checkout');
    Route::delete('/visits/{visit}', [DashboardController::class, 'destroy'])->name('visits.destroy');

    // Master Data Divisi
    Route::get('/admin/divisions', [DivisionController::class, 'index'])->name('admin.divisions.index');
    Route::post('/admin/divisions', [DivisionController::class, 'store'])->name('admin.divisions.store');
    Route::put('/admin/divisions/{division}', [DivisionController::class, 'update'])->name('admin.divisions.update');
    Route::patch('/admin/divisions/{division}/toggle', [DivisionController::class, 'toggle'])->name('admin.divisions.toggle');
    Route::delete('/admin/divisions/{division}', [DivisionController::class, 'destroy'])->name('admin.divisions.destroy');

    // CMS & Akun Pengguna
    Route::get('/admin/settings', [SettingController::class, 'index'])->name('admin.settings.index');
    Route::post('/admin/settings', [SettingController::class, 'update'])->name('admin.settings.update');
    Route::post('/admin/settings/reset-induction', [SettingController::class, 'resetInduction'])->name('admin.settings.reset-induction');
    Route::post('/admin/users', [SettingController::class, 'storeUser'])->name('admin.users.store');
    Route::patch('/admin/users/{user}/toggle', [SettingController::class, 'toggleUser'])->name('admin.users.toggle');
    Route::delete('/admin/users/{user}', [SettingController::class, 'destroyUser'])->name('admin.users.destroy');

    // Profil Akun
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
