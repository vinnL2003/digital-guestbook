<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\SiteSetting;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuestController extends Controller
{
    /**
     * Halaman Utama / Sambutan Kiosk Lobi & QR Code
     */
    public function welcome(): Response
    {
        $setting = SiteSetting::current();
        $todayVisitsCount = Visit::whereDate('check_in_time', Carbon::today())->count();
        $currentlyActive = Visit::where('status', 'checked_in')
            ->whereDate('check_in_time', Carbon::today())
            ->count();

        $host = request()->getHost();
        $port = request()->getPort();
        $portSuffix = ($port && $port != 80 && $port != 443) ? ":{$port}" : '';
        $qrHost = in_array($host, ['localhost', '127.0.0.1']) ? '192.168.1.25' : $host;
        $checkInUrl = request()->getScheme() . "://{$qrHost}{$portSuffix}/check-in";

        return Inertia::render('Welcome', [
            'setting' => $setting,
            'todayVisitsCount' => $todayVisitsCount,
            'currentlyActive' => $currentlyActive,
            'checkInUrl' => $checkInUrl,
        ]);
    }

    /**
     * Formulir Registrasi Mandiri Tamu
     */
    public function checkInForm(): Response
    {
        $setting = SiteSetting::current();
        $divisions = Division::active()->orderBy('division_name')->get();

        return Inertia::render('Guest/CheckIn', [
            'setting' => $setting,
            'divisions' => $divisions,
        ]);
    }

    /**
     * Simpan Kunjungan & Tanda Tangan
     */
    public function storeCheckIn(Request $request)
    {
        $validated = $request->validate([
            'visitor_name' => ['required', 'string', 'max:255'],
            'institution' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:30'],
            'division_id' => ['required', 'exists:divisions,id'],
            'destination_person' => ['nullable', 'string', 'max:255'],
            'visitor_count' => ['required', 'integer', 'min:1', 'max:100'],
            'purpose' => ['required', 'string'],
            'signature_base64' => ['required', 'string', 'min:50'],
            'members' => ['nullable', 'array'],
            'members.*.name' => ['required_with:members', 'string', 'max:255'],
            'members.*.signature_base64' => ['required_with:members', 'string', 'min:50'],
        ], [
            'visitor_name.required' => 'Nama lengkap wajib diisi.',
            'institution.required' => 'Instansi / Asal wajib diisi.',
            'phone_number.required' => 'Nomor WhatsApp / HP wajib diisi.',
            'division_id.required' => 'Pilih divisi atau pihak yang dituju.',
            'purpose.required' => 'Keperluan kunjungan wajib diisi.',
            'signature_base64.required' => 'Tanda tangan digital wajib digoreskan pada kanvas.',
            'signature_base64.min' => 'Goresan tanda tangan tidak boleh kosong.',
            'members.*.name.required_with' => 'Nama setiap anggota rombongan wajib diisi.',
            'members.*.signature_base64.required_with' => 'Tanda tangan setiap anggota rombongan wajib digoreskan.',
        ]);

        // If the chosen division is "Lainnya", validate destination_person is provided
        $selectedDivision = Division::find($validated['division_id']);
        if ($selectedDivision && str_contains(strtolower($selectedDivision->division_name), 'lainnya')) {
            $request->validate([
                'destination_person' => ['required', 'string', 'max:255'],
            ], [
                'destination_person.required' => 'Sebutkan nama orang atau pihak yang ingin Anda temui.',
            ]);
        }

        $ticketCode = Visit::generateTicketCode();

        // Primary visitor name and signature (leader / first member)
        $primaryName = !empty($validated['members'][0]['name']) 
            ? $validated['members'][0]['name'] 
            : $validated['visitor_name'];
        $primarySignature = !empty($validated['members'][0]['signature_base64']) 
            ? $validated['members'][0]['signature_base64'] 
            : $validated['signature_base64'];

        $visit = Visit::create([
            'ticket_code' => $ticketCode,
            'visitor_name' => $primaryName,
            'institution' => $validated['institution'],
            'phone_number' => $validated['phone_number'],
            'division_id' => $validated['division_id'],
            'destination_person' => $request->input('destination_person'),
            'visitor_count' => $validated['visitor_count'],
            'purpose' => $validated['purpose'],
            'signature_base64' => $primarySignature,
            'slot_time' => Carbon::now()->setTimezone('Asia/Makassar')->format('H:i') . ' WITA',
            'status' => 'checked_in',
            'check_in_time' => Carbon::now(), // Realtime timestamp
        ]);

        // Save individual group members
        if (!empty($validated['members']) && is_array($validated['members'])) {
            foreach ($validated['members'] as $index => $member) {
                \App\Models\VisitMember::create([
                    'visit_id' => $visit->id,
                    'name' => $member['name'],
                    'signature_base64' => $member['signature_base64'],
                    'is_leader' => ($index === 0),
                ]);
            }
        } else {
            \App\Models\VisitMember::create([
                'visit_id' => $visit->id,
                'name' => $visit->visitor_name,
                'signature_base64' => $visit->signature_base64,
                'is_leader' => true,
            ]);
        }

        return redirect()->route('guest.ticket', $visit->ticket_code)
            ->with('success', 'Registrasi berhasil! Tiket kunjungan Anda telah dibuat.');
    }

    /**
     * Tiket Kunjungan Digital
     */
    public function showTicket(string $ticket_code): Response
    {
        $visit = Visit::with(['division', 'members'])->where('ticket_code', $ticket_code)->firstOrFail();
        $setting = SiteSetting::current();

        return Inertia::render('Guest/Ticket', [
            'visit' => $visit,
            'setting' => $setting,
        ]);
    }

    /**
     * Halaman Check-Out Mandiri Tamu
     */
    public function checkOutForm(Request $request): Response
    {
        $setting = SiteSetting::current();
        $ticketCode = $request->query('ticket', $request->query('ticket_code', ''));
        $visit = null;
        $error = null;

        if ($ticketCode) {
            $ticketCode = trim(strtoupper($ticketCode));
            $found = Visit::with(['division', 'members'])->where('ticket_code', $ticketCode)->first();
            if ($found) {
                $visit = $found;
            } else {
                $error = "Kode ID Tiket '{$ticketCode}' tidak ditemukan dalam sistem.";
            }
        }

        return Inertia::render('Guest/CheckOut', [
            'setting' => $setting,
            'visit' => $visit,
            'queryTicket' => $ticketCode,
            'searchError' => $error,
        ]);
    }

    /**
     * Proses Check-Out Mandiri Tamu
     */
    public function processCheckOut(Request $request)
    {
        $validated = $request->validate([
            'ticket_code' => ['required', 'string'],
        ], [
            'ticket_code.required' => 'Kode tiket kunjungan wajib diisi.',
        ]);

        $ticketCode = trim(strtoupper($validated['ticket_code']));
        $visit = Visit::where('ticket_code', $ticketCode)->first();

        if (!$visit) {
            return back()->with('error', "Kode ID Tiket '{$ticketCode}' tidak ditemukan dalam sistem.");
        }

        if ($visit->status === 'checked_out') {
            return redirect()->route('guest.ticket', $visit->ticket_code)
                ->with('info', 'Kunjungan ini sudah berstatus Check-Out sebelumnya.');
        }

        $visit->update([
            'status' => 'checked_out',
            'check_out_time' => Carbon::now(),
        ]);

        return redirect()->route('guest.ticket', $visit->ticket_code)
            ->with('success', 'Check-out berhasil! Kunjungan Anda di PT PLN (Persero) UPT Manado telah resmi selesai.');
    }
}
