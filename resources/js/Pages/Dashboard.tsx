import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Division, PageProps, SiteSetting, Visit } from '@/types';
import { 
    User,
    Users, 
    UserCheck, 
    Clock, 
    Search, 
    Filter, 
    Download, 
    FileSpreadsheet, 
    FileText, 
    CheckCircle2, 
    Eye, 
    LogOut, 
    Trash2, 
    Building2, 
    Calendar,
    X,
    Maximize2,
    RefreshCw,
    UserPlus,
    QrCode,
    Zap
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface DashboardProps {
    visits: {
        data: Visit[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        status?: string;
        division_id?: string;
        date?: string;
        all_dates?: boolean;
    };
    stats: {
        total_today: number;
        active_now: number;
        checked_out_today: number;
        total_people_count: number;
        all_time_total: number;
    };
    divisions: Division[];
    setting: SiteSetting;
    initialFingerprint?: string;
}

const formatTimeWITA = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
    }) + ' WITA';
};

const formatDateTimeWITA = (dateString?: string | null) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    const datePart = d.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Makassar',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const timePart = d.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${datePart} ${timePart} WITA`;
};

export default function Dashboard({ auth, visits, filters, stats, divisions, setting, initialFingerprint }: PageProps<DashboardProps>) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [divisionId, setDivisionId] = useState(filters.division_id || '');
    const [date, setDate] = useState(filters.date || '');
    const [allDates, setAllDates] = useState(filters.all_dates || false);

    // Real-Time Auto-Sync State
    const [isLiveSyncActive, setIsLiveSyncActive] = useState<boolean>(true);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [lastSyncNotification, setLastSyncNotification] = useState<string | null>(null);
    const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => {
        return new Date().toLocaleTimeString('id-ID', {
            timeZone: 'Asia/Makassar',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }) + ' WITA';
    });

    const currentFingerprintRef = useRef<string>(initialFingerprint || '');
    const isFetchingRef = useRef<boolean>(false);

    useEffect(() => {
        if (initialFingerprint) {
            currentFingerprintRef.current = initialFingerprint;
        }
    }, [initialFingerprint]);

    // Live Sync Function
    const triggerSync = (manual = false) => {
        if (isFetchingRef.current) return;
        setIsSyncing(true);

        const syncUrl = new URL(route('admin.sync-status'), window.location.origin);
        if (!allDates && date) {
            syncUrl.searchParams.set('date', date);
        }

        isFetchingRef.current = true;

        fetch(syncUrl.toString(), {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Sync status failed');
                return res.json();
            })
            .then((data) => {
                const nowTimeStr = new Date().toLocaleTimeString('id-ID', {
                    timeZone: 'Asia/Makassar',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }) + ' WITA';
                setLastSyncedTime(nowTimeStr);

                // If fingerprint differs or manual refresh requested
                if (data.fingerprint && data.fingerprint !== currentFingerprintRef.current) {
                    currentFingerprintRef.current = data.fingerprint;

                    // Reload visits and stats smoothly without full page refresh
                    router.reload({
                        only: ['visits', 'stats', 'initialFingerprint'],
                        onSuccess: () => {
                            setLastSyncNotification('Data kunjungan tersinkronisasi otomatis!');
                            setTimeout(() => setLastSyncNotification(null), 4000);
                        },
                        onFinish: () => {
                            setIsSyncing(false);
                            isFetchingRef.current = false;
                        },
                    });
                } else {
                    if (manual) {
                        router.reload({
                            only: ['visits', 'stats', 'initialFingerprint'],
                            onSuccess: () => {
                                setLastSyncNotification('Data mutakhir terkonfirmasi.');
                                setTimeout(() => setLastSyncNotification(null), 3000);
                            },
                            onFinish: () => {
                                setIsSyncing(false);
                                isFetchingRef.current = false;
                            },
                        });
                    } else {
                        setIsSyncing(false);
                        isFetchingRef.current = false;
                    }
                }
            })
            .catch(() => {
                setIsSyncing(false);
                isFetchingRef.current = false;
            });
    };

    // Auto-polling effect (every 3.5 seconds)
    useEffect(() => {
        if (!isLiveSyncActive) return;

        const interval = setInterval(() => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
            if (isTyping && (activeEl as HTMLInputElement).type === 'text') {
                return; // skip polling step while user is actively typing
            }

            triggerSync(false);
        }, 3500);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                triggerSync(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isLiveSyncActive, date, allDates]);

    // Modal Zoom Signature State for single and group visitors
    const [selectedSignature, setSelectedSignature] = useState<{
        visitorName: string;
        ticketCode: string;
        members: { name: string; signature_base64: string; is_leader: boolean }[];
    } | null>(null);

    const openSignatureModal = (visit: Visit) => {
        const members = (visit.members && visit.members.length > 0)
            ? visit.members
            : [{ id: 1, visit_id: visit.id, name: visit.visitor_name, signature_base64: visit.signature_base64, is_leader: true }];

        setSelectedSignature({
            visitorName: visit.visitor_name,
            ticketCode: visit.ticket_code,
            members: members,
        });
    };

    const handleFilterChange = (params: Record<string, any>) => {
        let targetDate = params.date !== undefined ? params.date : date;
        if (targetDate) {
            const parts = targetDate.split('-');
            if (parts[0]) {
                const year = parseInt(parts[0], 10);
                if (parts[0].length > 4 || year < 2026 || year > 2099) {
                    targetDate = '2026-01-01';
                }
            }
        }

        const isAll = params.all_dates !== undefined ? params.all_dates : allDates;

        router.get(route('dashboard'), {
            search: params.search !== undefined ? params.search : search,
            status: params.status !== undefined ? params.status : status,
            division_id: params.division_id !== undefined ? params.division_id : divisionId,
            date: isAll ? undefined : targetDate,
            all_dates: isAll ? true : undefined,
            ...params,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    const handleCheckOut = (visitId: number, visitorName: string) => {
        if (confirm(`Konfirmasi check-out untuk tamu ${visitorName}?`)) {
            router.post(route('visits.checkout', visitId), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleDelete = (visitId: number, visitorName: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus catatan kunjungan ${visitorName}?`)) {
            router.delete(route('visits.destroy', visitId), {
                preserveScroll: true,
            });
        }
    };

    // Export to Excel
    const handleExportExcel = () => {
        const rows = visits.data.map((v, i) => {
            const memberNames = v.members && v.members.length > 0 
                ? v.members.map(m => m.name).join(', ') 
                : v.visitor_name;

            return {
                'No': i + 1,
                'Kode Tiket': v.ticket_code,
                'Nama Pengunjung': v.visitor_name,
                'Daftar Rombongan': memberNames,
                'Instansi/Asal': v.institution,
                'Nomor HP': v.phone_number,
                'Divisi Tujuan': v.destination_person ? `${v.division?.division_name || '-'} (Menemui: ${v.destination_person})` : (v.division?.division_name || '-'),
                'Pihak yang Ditemui': v.destination_person || '-',
                'Jumlah Tamu': v.visitor_count,
                'Keperluan': v.purpose,
                'Waktu Masuk': formatDateTimeWITA(v.check_in_time),
                'Waktu Keluar': v.check_out_time ? formatDateTimeWITA(v.check_out_time) : '-',
                'Status': v.status === 'checked_in' ? 'Sedang Berkunjung' : 'Selesai',
            };
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data Kunjungan');
        XLSX.writeFile(wb, `Laporan-Buku-Tamu-${date || 'Rekap'}.xlsx`);
    };

    // Export to PDF with embedded signature image per PRD acceptance criteria
    const handleExportPdf = () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });

        // Header
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 153, 216);
        doc.text('PT PLN (PERSERO) UPT MANADO', 14, 15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Laporan Rekapitulasi Kunjungan Tamu — ${allDates ? 'Semua Periode' : `Tanggal: ${date}`}`, 14, 21);

        const tableData = visits.data.map((v, i) => [
            (i + 1).toString(),
            v.ticket_code,
            v.visitor_name,
            v.institution,
            v.phone_number,
            v.destination_person ? `${v.division?.division_name || '-'}\n(Menemui: ${v.destination_person})` : (v.division?.division_name || '-'),
            `${v.visitor_count} Org`,
            formatTimeWITA(v.check_in_time),
            v.status === 'checked_in' ? 'Di Lokasi' : 'Selesai',
            '', // Placeholder cell for signature image
        ]);

        autoTable(doc, {
            startY: 26,
            head: [['No', 'Kode', 'Nama Tamu', 'Instansi', 'No. HP', 'Divisi Tujuan', 'Jml', 'Jam Masuk (WITA)', 'Status', 'Bukti Tanda Tangan']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 153, 216],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
            },
            styles: {
                fontSize: 8,
                cellPadding: 2,
                minCellHeight: 14,
                valign: 'middle',
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 24, fontStyle: 'bold' },
                2: { cellWidth: 35 },
                3: { cellWidth: 35 },
                4: { cellWidth: 25 },
                5: { cellWidth: 40 },
                6: { cellWidth: 14, halign: 'center' },
                7: { cellWidth: 20, halign: 'center' },
                8: { cellWidth: 22, halign: 'center' },
                9: { cellWidth: 35, halign: 'center' }, // Column for signature
            },
            didDrawCell: (data) => {
                // If it is the signature column in body row
                if (data.section === 'body' && data.column.index === 9) {
                    const visit = visits.data[data.row.index];
                    if (visit && visit.signature_base64) {
                        try {
                            doc.addImage(
                                visit.signature_base64,
                                'PNG',
                                data.cell.x + 4,
                                data.cell.y + 1,
                                26,
                                12
                            );
                        } catch (err) {
                            // ignore image draw errors
                        }
                    }
                }
            },
        });

        doc.save(`Laporan-Resmi-Buku-Tamu-${date || 'Semua'}.pdf`);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-400/30 text-[11px] font-bold">
                                <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
                                PT PLN (Persero) UPT Manado
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                            Dasbor Pantauan Tamu Real-Time
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Memantau tamu masuk, verifikasi tanda tangan digital, dan manajemen kepulangan (check-out).
                        </p>
                    </div>

                    {/* Live Sync Controls & Quick Navigation */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Live Sync Real-Time Status Pill */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs">
                            <button
                                type="button"
                                onClick={() => setIsLiveSyncActive(!isLiveSyncActive)}
                                className="flex items-center gap-1.5 font-medium hover:opacity-80 transition-opacity"
                                title={isLiveSyncActive ? "Klik untuk menjeda sinkronisasi otomatis" : "Klik untuk mengaktifkan sinkronisasi otomatis"}
                            >
                                <span className={`w-2 h-2 rounded-full ${isLiveSyncActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                                <span className={`text-[11px] font-bold ${isLiveSyncActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                                    {isLiveSyncActive ? 'Live Sync' : 'Sync Dijeda'}
                                </span>
                            </button>

                            <span className="text-zinc-300 dark:text-zinc-700">|</span>

                            <button
                                type="button"
                                onClick={() => triggerSync(true)}
                                disabled={isSyncing}
                                className="inline-flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors disabled:opacity-50"
                                title="Klik untuk sinkronisasi paksa sekarang"
                            >
                                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-brand-500' : ''}`} />
                                <span className="hidden sm:inline font-mono">
                                    {isSyncing ? 'Menyinkron...' : lastSyncedTime}
                                </span>
                            </button>
                        </div>

                        {/* Quick navigation to Division & CMS */}
                        <Link
                            href={route('admin.divisions.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all"
                        >
                            <Building2 className="w-3.5 h-3.5 text-brand-500" />
                            <span>Master Divisi</span>
                        </Link>
                        {auth.user.role === 'admin' && (
                            <Link
                                href={route('admin.settings.index')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all"
                            >
                                <Users className="w-3.5 h-3.5 text-brand-500" />
                                <span>CMS & Akun</span>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Dasbor Pantauan Tamu - PT PLN (Persero) UPT Manado" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Live Sync Notification Toast */}
                {lastSyncNotification && (
                    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-all">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>{lastSyncNotification}</span>
                        </div>
                        <span className="text-[10px] font-mono opacity-80">{lastSyncedTime}</span>
                    </div>
                )}

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs text-zinc-500 font-medium">Total Kunjungan Hari Ini</span>
                            <div className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">
                                {stats.total_today}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-xs text-zinc-500 font-medium">Sedang Di Lokasi (Aktif)</span>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                                {stats.active_now}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs text-zinc-500 font-medium">Sudah Check-Out</span>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {stats.checked_out_today}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs text-zinc-500 font-medium">Total Orang (Rombongan)</span>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 tabular-nums">
                                {stats.total_people_count}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter & Export Controls Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                        
                        {/* Instant Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, instansi, tiket, atau No HP..."
                                className="w-full pl-10 pr-20 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-all"
                            >
                                Cari
                            </button>
                        </form>

                        {/* Export Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExportPdf}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold transition-all"
                            >
                                <FileText className="w-4 h-4" />
                                <span>Ekspor PDF (Bukti TTD)</span>
                            </button>

                            <button
                                onClick={handleExportExcel}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold transition-all shadow-sm"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>Ekspor Excel (.xlsx)</span>
                            </button>

                            <Link
                                href={route('admin.qr-poster')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 text-xs font-semibold transition-all shadow-sm"
                                title="Cetak poster/standee QR code untuk dipajang di pos security atau meja lobi"
                            >
                                <QrCode className="w-4 h-4 text-brand-500" />
                                <span>Cetak Poster QR (Security)</span>
                            </Link>
                        </div>
                    </div>

                    {/* Filter Badges / Dropdowns */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                        <div className="flex items-center gap-1 text-zinc-400 font-semibold mr-1">
                            <Filter className="w-3.5 h-3.5" />
                            <span>Filter:</span>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                handleFilterChange({ status: e.target.value });
                            }}
                            className="py-1.5 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-700 dark:text-zinc-200"
                        >
                            <option value="">Semua Status</option>
                            <option value="checked_in">Sedang Berkunjung (Aktif)</option>
                            <option value="checked_out">Selesai (Sudah Check-Out)</option>
                        </select>

                        {/* Division Filter */}
                        <select
                            value={divisionId}
                            onChange={(e) => {
                                setDivisionId(e.target.value);
                                handleFilterChange({ division_id: e.target.value });
                            }}
                            className="py-1.5 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-700 dark:text-zinc-200"
                        >
                            <option value="">Semua Divisi Tujuan</option>
                            {divisions.map((div) => (
                                <option key={div.id} value={div.id}>
                                    {div.division_name}
                                </option>
                            ))}
                        </select>

                        {/* Date Filter */}
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                disabled={allDates}
                                min="2026-01-01"
                                max="2099-12-31"
                                value={date}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                        const parts = val.split('-');
                                        if (parts[0]) {
                                            const year = parseInt(parts[0], 10);
                                            if (parts[0].length > 4 || year < 2026 || year > 2099) {
                                                return;
                                            }
                                        }
                                    }
                                    setDate(val);
                                    handleFilterChange({ date: val });
                                }}
                                className="py-1.5 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-700 dark:text-zinc-200 disabled:opacity-40"
                            />

                            <label className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={allDates}
                                    onChange={(e) => {
                                        setAllDates(e.target.checked);
                                        handleFilterChange({ all_dates: e.target.checked });
                                    }}
                                    className="rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                                />
                                <span>Tampilkan Semua Hari</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4">Kode & Tamu</th>
                                    <th className="py-3.5 px-4">Instansi & Kontak</th>
                                    <th className="py-3.5 px-4">Divisi & Keperluan</th>
                                    <th className="py-3.5 px-4 text-center">Waktu Masuk / Keluar</th>
                                    <th className="py-3.5 px-4 text-center">Bukti Tanda Tangan</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                                {visits.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-zinc-400">
                                            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            <p className="font-medium">Tidak ada data kunjungan yang sesuai dengan filter.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    visits.data.map((visit) => (
                                        <tr key={visit.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                            {/* Kode & Tamu */}
                                            <td className="py-3.5 px-4">
                                                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 block">
                                                    {visit.ticket_code}
                                                </span>
                                                <span className="font-bold text-zinc-900 dark:text-white block mt-0.5">
                                                    {visit.visitor_name}
                                                </span>
                                                <span className="text-[11px] text-zinc-400 block">
                                                    {visit.visitor_count} Orang rombongan
                                                </span>
                                            </td>

                                            {/* Instansi & Kontak */}
                                            <td className="py-3.5 px-4">
                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                                                    {visit.institution}
                                                </span>
                                                <span className="text-xs text-zinc-500 font-mono block mt-0.5">
                                                    {visit.phone_number}
                                                </span>
                                            </td>

                                            {/* Divisi & Keperluan */}
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <span className="font-semibold text-brand-700 dark:text-brand-300 block">
                                                    {visit.division?.division_name || '-'}
                                                </span>
                                                {visit.destination_person && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 mt-0.5">
                                                        <User className="w-3 h-3 text-amber-500" />
                                                        Menemui: {visit.destination_person}
                                                    </span>
                                                )}
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5" title={visit.purpose}>
                                                    {visit.purpose}
                                                </p>
                                            </td>

                                            {/* Waktu */}
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                                    Masuk: {formatTimeWITA(visit.check_in_time)}
                                                </div>
                                                {visit.visitor_count > 1 && (
                                                    <div className="inline-block text-[10px] bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800 mt-0.5 font-medium">
                                                        Rombongan ({visit.visitor_count} Orang)
                                                    </div>
                                                )}
                                                {visit.check_out_time ? (
                                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                                                        Keluar: {formatTimeWITA(visit.check_out_time)}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-amber-500 font-semibold block mt-0.5">
                                                        (Belum Keluar)
                                                    </span>
                                                )}
                                            </td>

                                            {/* Bukti Tanda Tangan Digital */}
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => openSignatureModal(visit)}
                                                    className="group relative inline-flex items-center justify-center p-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white hover:border-brand-500 transition-all shadow-sm"
                                                    title="Klik untuk melihat tanda tangan semua tamu"
                                                >
                                                    <div className="w-20 h-10 flex items-center justify-center overflow-hidden bg-white rounded-lg">
                                                        <img
                                                            src={visit.signature_base64}
                                                            alt={`TTD ${visit.visitor_name}`}
                                                            className="max-h-full max-w-full object-contain filter contrast-125 group-hover:scale-105 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 bg-brand-600/10 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
                                                        <Eye className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                                                    </div>
                                                </button>
                                                {visit.members && visit.members.length > 1 && (
                                                    <div className="text-[10px] text-brand-600 dark:text-brand-400 font-bold mt-0.5">
                                                        {visit.members.length} Tanda Tangan
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-4 text-center">
                                                {visit.status === 'checked_in' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                        Sedang Berkunjung
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Selesai
                                                    </span>
                                                )}
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="py-3.5 px-4 text-right space-x-1.5">
                                                {visit.status === 'checked_in' && (
                                                    <button
                                                        onClick={() => handleCheckOut(visit.id, visit.visitor_name)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
                                                        title="Check-Out Tamu"
                                                    >
                                                        <LogOut className="w-3.5 h-3.5" />
                                                        <span>Check-Out</span>
                                                    </button>
                                                )}

                                                {auth.user.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(visit.id, visit.visitor_name)}
                                                        className="inline-flex items-center p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                        title="Hapus Kunjungan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View (Optimized for Smartphone Screens) */}
                    <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                        {visits.data.length === 0 ? (
                            <div className="py-12 text-center text-zinc-400 p-6">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="font-medium text-xs">Tidak ada data kunjungan yang sesuai dengan filter.</p>
                            </div>
                        ) : (
                            visits.data.map((visit) => (
                                <div key={visit.id} className="p-4 space-y-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                                            {visit.ticket_code}
                                        </span>
                                        {visit.status === 'checked_in' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Selesai
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                                            {visit.visitor_name}
                                        </h4>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                                            {visit.institution} • {visit.phone_number}
                                        </p>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-zinc-500 font-medium">Divisi Dituju:</span>
                                            <div className="text-right">
                                                <span className="font-semibold text-brand-700 dark:text-brand-300 block">{visit.division?.division_name || '-'}</span>
                                                {visit.destination_person && (
                                                    <span className="text-[11px] font-bold text-amber-500 block">
                                                        Menemui: {visit.destination_person}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-zinc-500 font-medium">Waktu:</span>
                                            <span className="text-zinc-800 dark:text-zinc-200 font-mono text-xs">
                                                Masuk {formatTimeWITA(visit.check_in_time)}
                                                {visit.check_out_time ? ` • Keluar ${formatTimeWITA(visit.check_out_time)}` : ''}
                                            </span>
                                        </div>
                                        <div className="pt-1 border-t border-zinc-200/60 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px]">
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Keperluan: </span>
                                            {visit.purpose}
                                        </div>
                                    </div>

                                    {/* Mobile Signature & Actions */}
                                    <div className="flex items-center justify-between pt-1">
                                        <button
                                            onClick={() => openSignatureModal(visit)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-brand-500" />
                                            <span>
                                                {visit.members && visit.members.length > 1 
                                                    ? `Lihat ${visit.members.length} TTD` 
                                                    : 'Lihat TTD'}
                                            </span>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            {visit.status === 'checked_in' && (
                                                <button
                                                    onClick={() => handleCheckOut(visit.id, visit.visitor_name)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
                                                >
                                                    <LogOut className="w-3.5 h-3.5" />
                                                    <span>Check-Out</span>
                                                </button>
                                            )}
                                            {auth.user.role === 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(visit.id, visit.visitor_name)}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {visits.links && visits.links.length > 3 && (
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-xs text-zinc-500">
                                Total {visits.total} tamu tercatat
                            </span>
                            <div className="flex items-center gap-1">
                                {visits.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                            link.active
                                                ? 'bg-brand-600 text-white font-bold'
                                                : link.url
                                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                                                : 'text-zinc-400 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Modal Zoom Tanda Tangan Digital (Mendukung Rombongan & Individu) */}
            {selectedSignature && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl text-center space-y-4 max-h-[90vh] flex flex-col">
                        <button
                            onClick={() => setSelectedSignature(null)}
                            className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div>
                            <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block">
                                Verifikasi Tanda Tangan ({selectedSignature.members.length} Orang)
                            </span>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                                {selectedSignature.visitorName}
                            </h3>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                                Tiket: {selectedSignature.ticketCode}
                            </span>
                        </div>

                        {/* List of Member Signatures */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-left">
                            {selectedSignature.members.map((m, idx) => (
                                <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-md bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                                                    {m.name}
                                                </h4>
                                                <p className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
                                                    {m.is_leader ? 'Ketua Rombongan' : 'Anggota Rombongan'}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Sah
                                        </span>
                                    </div>

                                    {/* Signature Display Box - Pure White Paper Surface with Solid Ink */}
                                    <div className="w-full h-32 bg-white rounded-xl border border-zinc-300 p-2 flex items-center justify-center overflow-hidden shadow-sm">
                                        {m.signature_base64 ? (
                                            <img
                                                src={m.signature_base64}
                                                alt={`TTD ${m.name}`}
                                                className="max-h-full max-w-full object-contain filter contrast-125"
                                            />
                                        ) : (
                                            <span className="text-xs text-zinc-400 italic">Tanpa TTD</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setSelectedSignature(null)}
                            className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all flex-shrink-0"
                        >
                            Tutup Pratinjau
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
