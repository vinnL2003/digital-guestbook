<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $setting = SiteSetting::current();
        $users = User::latest()->get();

        return Inertia::render('Admin/Settings', [
            'setting' => $setting,
            'users' => $users,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'organization_name' => ['sometimes', 'required', 'string', 'max:255'],
            'welcome_title' => ['sometimes', 'required', 'string', 'max:255'],
            'welcome_subtitle' => ['nullable', 'string'],
            'announcement_text' => ['nullable', 'string'],
            'security_induction_title' => ['nullable', 'string', 'max:255'],
            'security_induction_content' => ['nullable', 'string'],
            'is_security_induction_active' => ['nullable', 'boolean'],
        ]);

        if ($request->has('is_security_induction_active')) {
            $validated['is_security_induction_active'] = $request->boolean('is_security_induction_active');
        }

        $setting = SiteSetting::current();
        $setting->update($validated);

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    public function resetInduction()
    {
        $setting = SiteSetting::current();
        $setting->update([
            'security_induction_title' => 'Security Induction PT PLN (Persero) UPT Manado',
            'security_induction_content' => SiteSetting::defaultSecurityInductionContent(),
            'is_security_induction_active' => true,
        ]);

        return back()->with('success', 'Ketentuan Security Induction berhasil dikembalikan ke standar resmi PLN UPT Manado.');
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['admin', 'operator'])],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => true,
        ]);

        return back()->with('success', "Akun {$validated['name']} berhasil dibuat.");
    }

    public function toggleUser(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun sendiri.');
        }

        $user->update(['is_active' => !$user->is_active]);

        $statusText = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Akun {$user->name} berhasil {$statusText}.");
    }

    public function destroyUser(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $userName = $user->name;
        $user->delete();

        return back()->with('success', "Akun {$userName} berhasil dihapus.");
    }
}
