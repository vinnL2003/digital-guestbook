<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\SiteSetting;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Dasbor Pantauan Tamu Real-Time & Rekapitulasi
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $divisionId = $request->input('division_id');
        $todayWita = Carbon::today('Asia/Makassar');
        $defaultDate = $todayWita->year >= 2026 ? $todayWita->toDateString() : '2026-01-01';

        $rawDate = $request->input('date');
        $date = $rawDate ?? $defaultDate;

        // Validasi batasan tanggal: Hanya tahun 4-digit mulai 2026 ke atas
        if ($date) {
            $parts = explode('-', $date);
            if (isset($parts[0])) {
                $year = (int) $parts[0];
                if (strlen($parts[0]) !== 4 || $year < 2026 || $year > 2099) {
                    $date = $defaultDate;
                }
            }
        }
        $allDates = $request->boolean('all_dates', false);

        $query = Visit::with(['division', 'checkedOutByUser', 'members'])
            ->latest('check_in_time');

        if (!$allDates && $date) {
            $query->whereDate('check_in_time', $date);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('visitor_name', 'like', "%{$search}%")
                    ->orWhere('institution', 'like', "%{$search}%")
                    ->orWhere('ticket_code', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        if ($status && in_array($status, ['checked_in', 'checked_out'])) {
            $query->where('status', $status);
        }

        if ($divisionId) {
            $query->where('division_id', $divisionId);
        }

        $visits = $query->paginate(20)->withQueryString();

        // Metric Statistics for selected date (or today)
        $statDate = $date ?: $defaultDate;
        $stats = [
            'total_today' => Visit::whereDate('check_in_time', $statDate)->count(),
            'active_now' => Visit::where('status', 'checked_in')->whereDate('check_in_time', $statDate)->count(),
            'checked_out_today' => Visit::where('status', 'checked_out')->whereDate('check_in_time', $statDate)->count(),
            'total_people_count' => (int) Visit::whereDate('check_in_time', $statDate)->sum('visitor_count'),
            'all_time_total' => Visit::count(),
        ];

        $divisions = Division::orderBy('division_name')->get();
        $setting = SiteSetting::current();

        $latestUpdated = Visit::max('updated_at');
        $activeNow = $stats['active_now'];
        $checkedOutToday = $stats['checked_out_today'];
        $totalCount = $stats['all_time_total'];
        $latestCheckedOut = Visit::where('status', 'checked_out')->max('check_out_time');
        $initialFingerprint = md5("{$latestUpdated}|{$totalCount}|{$activeNow}|{$checkedOutToday}|{$latestCheckedOut}");

        return Inertia::render('Dashboard', [
            'visits' => $visits,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'division_id' => $divisionId,
                'date' => $date,
                'all_dates' => $allDates,
            ],
            'stats' => $stats,
            'divisions' => $divisions,
            'setting' => $setting,
            'initialFingerprint' => $initialFingerprint,
        ]);
    }

    /**
     * Aksi Cepat Check-Out Tamu
     */
    public function checkOut(Visit $visit)
    {
        if ($visit->status === 'checked_out') {
            return back()->with('info', 'Tamu sudah melakukan check-out sebelumnya.');
        }

        $visit->update([
            'status' => 'checked_out',
            'check_out_time' => Carbon::now(),
            'checked_out_by' => auth()->id(),
        ]);

        return back()->with('success', "Tamu {$visit->visitor_name} berhasil di-check-out.");
    }

    /**
     * Hapus Rekaman Tamu (Hanya Admin)
     */
    public function destroy(Visit $visit)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Hanya Administrator yang berhak menghapus rekaman kunjungan.');
        }

        $visitorName = $visit->visitor_name;
        $visit->delete();

        return back()->with('success', "Data kunjungan {$visitorName} berhasil dihapus.");
    }

    /**
     * Halaman Cetak Poster QR Standee Lobi / Security
     */
    public function qrPoster(Request $request): Response
    {
        $setting = SiteSetting::current();
        $host = request()->getHost();
        $port = request()->getPort();
        $portSuffix = ($port && $port != 80 && $port != 443) ? ":{$port}" : '';
        $qrHost = in_array($host, ['localhost', '127.0.0.1']) ? '192.168.1.25' : $host;

        $checkInUrl = request()->getScheme() . "://{$qrHost}{$portSuffix}/check-in";
        $checkOutUrl = request()->getScheme() . "://{$qrHost}{$portSuffix}/check-out";
        $welcomeUrl = request()->getScheme() . "://{$qrHost}{$portSuffix}";

        return Inertia::render('Admin/QrPoster', [
            'setting' => $setting,
            'defaultCheckInUrl' => $checkInUrl,
            'defaultCheckOutUrl' => $checkOutUrl,
            'defaultWelcomeUrl' => $welcomeUrl,
        ]);
    }

    /**
     * Endpoint Cek Sinkronisasi Real-Time (Fingerprint Ringan < 1ms)
     */
    public function syncStatus(Request $request)
    {
        $todayWita = Carbon::today('Asia/Makassar');
        $defaultDate = $todayWita->year >= 2026 ? $todayWita->toDateString() : '2026-01-01';
        $statDate = $request->input('date', $defaultDate);

        $latestUpdated = Visit::max('updated_at');
        $totalCount = Visit::count();
        $activeNow = Visit::where('status', 'checked_in')->whereDate('check_in_time', $statDate)->count();
        $checkedOutToday = Visit::where('status', 'checked_out')->whereDate('check_in_time', $statDate)->count();
        $latestCheckedOut = Visit::where('status', 'checked_out')->max('check_out_time');

        $fingerprint = md5("{$latestUpdated}|{$totalCount}|{$activeNow}|{$checkedOutToday}|{$latestCheckedOut}");

        return response()->json([
            'fingerprint' => $fingerprint,
            'last_updated' => $latestUpdated,
            'active_now' => $activeNow,
            'checked_out_today' => $checkedOutToday,
            'total_count' => $totalCount,
        ]);
    }
}
