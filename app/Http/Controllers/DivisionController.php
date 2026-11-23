<?php

namespace App\Http\Controllers;

use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DivisionController extends Controller
{
    public function index(): Response
    {
        $divisions = Division::withCount('visits')
            ->orderBy('division_name')
            ->get();

        return Inertia::render('Admin/Divisions', [
            'divisions' => $divisions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'division_name' => ['required', 'string', 'max:255'],
            'pic_name' => ['nullable', 'string', 'max:255'],
            'room_location' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        Division::create($validated);

        return back()->with('success', 'Divisi baru berhasil ditambahkan.');
    }

    public function update(Request $request, Division $division)
    {
        $validated = $request->validate([
            'division_name' => ['required', 'string', 'max:255'],
            'pic_name' => ['nullable', 'string', 'max:255'],
            'room_location' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $division->update($validated);

        return back()->with('success', 'Data divisi berhasil diperbarui.');
    }

    public function toggle(Division $division)
    {
        $division->update(['is_active' => !$division->is_active]);

        $statusText = $division->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Divisi {$division->division_name} berhasil {$statusText}.");
    }

    public function destroy(Division $division)
    {
        $divisionName = $division->division_name;
        $division->delete();

        return back()->with('success', "Divisi {$divisionName} berhasil dihapus.");
    }
}
