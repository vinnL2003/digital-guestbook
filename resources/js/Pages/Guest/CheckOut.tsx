import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { SiteSetting, Visit } from '@/types';
import PlnBrandHeader from '@/Components/PlnBrandHeader';
import { 
    ArrowLeft, 
    Search, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Calendar, 
    User, 
    Users, 
    Briefcase, 
    Building2, 
    LogOut, 
    ShieldCheck, 
    Zap, 
    Star, 
    ExternalLink,
    Check
} from 'lucide-react';

interface CheckOutProps {
    setting: SiteSetting;
    visit: Visit | null;
    queryTicket?: string;
    searchError?: string | null;
}

export default function CheckOut({ setting, visit, queryTicket = '', searchError = null }: CheckOutProps) {
    const [inputTicket, setInputTicket] = useState<string>(queryTicket || '');
    const [currentTime, setCurrentTime] = useState<string>('');
    const [rating, setRating] = useState<number>(5);

    // Live Clock WITA
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('id-ID', {
                timeZone: 'Asia/Makassar',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }) + ' WITA');
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    const todayFormatted = new Date().toLocaleDateString('id-ID', {
        timeZone: 'Asia/Makassar',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    // Handle Search Ticket Code
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputTicket.trim()) return;
        router.get(route('guest.check-out'), { ticket: inputTicket.trim().toUpperCase() }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Calculate Duration
    const calculateDuration = (checkInTime: string) => {
        const inTime = new Date(checkInTime).getTime();
        const nowTime = new Date().getTime();
        const diffMs = Math.max(0, nowTime - inTime);
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;

        if (hours > 0) {
            return `${hours} Jam ${mins} Menit`;
        }
        return `${Math.max(1, mins)} Menit`;
    };

    // Form to Process Check-Out
    const [processing, setProcessing] = useState(false);

    const handleConfirmCheckOut = () => {
        if (!visit) return;
        setProcessing(true);
        router.post(route('guest.check-out.process'), {
            ticket_code: visit.ticket_code,
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title={`Check-Out Kunjungan Mandiri - PT PLN (Persero) UPT Manado`} />

            <div className="min-h-screen bg-[#061423] text-zinc-100 flex flex-col relative selection:bg-brand-500 selection:text-white pb-20">
                {/* Dot background */}
                <div 
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }}
                />

                {/* Soft ambient glowing electrical orbs */}
                <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-sky-500/15 blur-[140px] pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

                {/* Header */}
                <header className="relative z-10 border-b border-sky-900/40 bg-[#061423]/85 backdrop-blur-md px-4 sm:px-6 py-3.5">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <Link
                            href={route('guest.welcome')}
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-sky-200 hover:text-white transition-colors py-2 px-3 rounded-xl hover:bg-sky-950/60 border border-sky-900/50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Sambutan</span>
                        </Link>

                        <PlnBrandHeader
                            size="sm"
                            showTitle={true}
                            subtitle="Unit Pelaksana Transmisi Manado"
                            variant="dark"
                        />
                    </div>
                </header>

                {/* Main Content */}
                <main className="relative z-10 flex-1 py-8 sm:py-12 px-4 sm:px-6">
                    <div className="max-w-xl mx-auto space-y-6">

                        {/* Title Card */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-1">
                                <LogOut className="w-3.5 h-3.5 text-amber-400" />
                                <span>Pos Keamanan • Check-Out Mandiri Tamu</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Check-Out Kunjungan Tamu
                            </h1>
                            <p className="text-xs sm:text-sm text-sky-200/70 max-w-md mx-auto">
                                Masukkan Kode ID Tiket dari E-Badge Anda untuk mengakhiri kunjungan dan verifikasi izin keluar di pos security.
                            </p>

                            {/* Realtime Timestamp Badge */}
                            <div className="pt-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-950/70 border border-sky-800/60 text-xs font-medium text-sky-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-sky-300/80">Waktu Keluar Real-Time:</span>
                                <span className="font-mono font-bold text-white">{currentTime || '...'}</span>
                                <span className="text-sky-400/60 hidden sm:inline">• {todayFormatted}</span>
                            </div>
                        </div>

                        {/* Search Ticket Input Box */}
                        <div className="bg-sky-950/40 border border-sky-900/60 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
                            <form onSubmit={handleSearch} className="space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-sky-300">
                                    Kode Tiket / ID Kunjungan:
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={inputTicket}
                                            onChange={(e) => setInputTicket(e.target.value.toUpperCase())}
                                            placeholder="Contoh: VST-849201"
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-sky-950/80 border border-sky-800/80 text-white font-mono font-bold text-sm tracking-wider placeholder:text-sky-700/60 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
                                        />
                                        <Search className="w-5 h-5 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] shrink-0"
                                    >
                                        Cari Tiket
                                    </button>
                                </div>
                                <p className="text-[11px] text-sky-400/60">
                                    *Kode 6 karakter terdapat pada E-Badge yang Anda dapatkan saat registrasi masuk.
                                </p>
                            </form>
                        </div>

                        {/* Search Error Alert */}
                        {searchError && (
                            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm flex items-start gap-3 shadow-lg animate-shake">
                                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-rose-100">ID Tiket Tidak Ditemukan</p>
                                    <p className="text-xs text-rose-300 mt-0.5">{searchError}</p>
                                </div>
                            </div>
                        )}

                        {/* Visit Found Card */}
                        {visit && (
                            <div className="bg-sky-950/50 border border-sky-800/70 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                                
                                {/* Status Banner */}
                                <div className="flex items-center justify-between pb-4 border-b border-sky-900/60">
                                    <div>
                                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                                            Tiket Kunjungan Terdaftar
                                        </span>
                                        <p className="text-xl font-mono font-black text-white">
                                            #{visit.ticket_code}
                                        </p>
                                    </div>

                                    {visit.status === 'checked_out' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            Sudah Check-Out
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-xs font-bold text-emerald-400">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            Sedang di Lokasi
                                        </span>
                                    )}
                                </div>

                                {/* Details Grid */}
                                <div className="space-y-3">
                                    <div className="p-3.5 rounded-2xl bg-[#061423]/70 border border-sky-900/60">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">
                                            Nama Tamu / Penanggung Jawab
                                        </span>
                                        <p className="text-base font-extrabold text-white">
                                            {visit.visitor_name}
                                        </p>
                                        <p className="text-xs text-sky-200/80 font-medium mt-0.5">
                                            {visit.institution}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-[#061423]/60 border border-sky-900/50">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">
                                                {visit.destination_person ? 'Menemui / Divisi' : 'Divisi Dituju'}
                                            </span>
                                            <p className="text-xs font-bold text-white truncate" title={visit.destination_person ? `Menemui: ${visit.destination_person}` : (visit.division?.division_name || '-')}>
                                                {visit.destination_person ? `Menemui: ${visit.destination_person}` : (visit.division?.division_name || '-')}
                                            </p>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[#061423]/60 border border-sky-900/50">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">
                                                Jumlah Orang
                                            </span>
                                            <p className="text-xs font-bold text-white">
                                                {visit.visitor_count} Tamu
                                            </p>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[#061423]/60 border border-sky-900/50">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">
                                                Waktu Masuk
                                            </span>
                                            <p className="text-xs font-bold text-white">
                                                {new Date(visit.check_in_time).toLocaleTimeString('id-ID', {
                                                    timeZone: 'Asia/Makassar',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })} WITA
                                            </p>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[#061423]/60 border border-sky-900/50">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">
                                                Durasi Kunjungan
                                            </span>
                                            <p className="text-xs font-bold text-amber-300">
                                                {calculateDuration(visit.check_in_time)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* If already checked out */}
                                {visit.status === 'checked_out' ? (
                                    <div className="pt-2 space-y-4">
                                        <div className="p-4 rounded-2xl bg-sky-900/30 border border-sky-700/50 text-center space-y-1">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                                            <h4 className="font-bold text-white text-sm">
                                                Kunjungan Ini Telah Selesai
                                            </h4>
                                            <p className="text-xs text-sky-200/70">
                                                E-Badge Anda telah terverifikasi check-out. Silakan perlihatkan layar E-Badge ke petugas security.
                                            </p>
                                        </div>

                                        <Link
                                            href={route('guest.ticket', visit.ticket_code)}
                                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-800 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            <span>Buka E-Badge Kunjungan</span>
                                        </Link>
                                    </div>
                                ) : (
                                    /* If still checked in -> Form to confirm check out */
                                    <div className="pt-2 space-y-5">
                                        {/* Optional Satisfaction Rating */}
                                        <div className="p-4 rounded-2xl bg-[#061423]/80 border border-sky-900/60 text-center space-y-2">
                                            <span className="text-xs font-bold text-sky-300 block">
                                                Bagaimana pengalaman pelayanan di UPT Manado hari ini?
                                            </span>
                                            <div className="flex items-center justify-center gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        className="p-1 text-amber-400 hover:scale-125 transition-transform"
                                                    >
                                                        <Star 
                                                            className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} 
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-sky-400/70">
                                                {rating === 5 ? 'Sangat Memuaskan ⭐⭐⭐⭐⭐' : `${rating} dari 5 Bintang`}
                                            </p>
                                        </div>

                                        {/* Check-Out Action Button */}
                                        <button
                                            type="button"
                                            onClick={handleConfirmCheckOut}
                                            disabled={processing}
                                            className="w-full min-h-[52px] inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-base shadow-xl shadow-amber-500/20 ring-4 ring-amber-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            <LogOut className="w-5 h-5 text-zinc-950" />
                                            <span>
                                                {processing 
                                                    ? 'Memproses Check-Out...' 
                                                    : 'Konfirmasi Check-Out & Selesaikan Kunjungan'}
                                            </span>
                                        </button>

                                        {/* Security Notice */}
                                        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-sky-950/80 border border-sky-800/60 text-xs text-sky-300/80">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            <p>
                                                Setelah check-out, E-Badge Anda akan otomatis terstempel <strong className="text-white">"Checked Out"</strong>. Harap perlihatkan layar tersebut kepada petugas security sebelum meninggalkan gerbang kantor.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 border-t border-sky-950 bg-[#040e1a]/90 px-6 py-4 text-center text-xs text-sky-400/70">
                    <p>
                        © {new Date().getFullYear()} PT PLN (Persero) UPT Manado — Sistem Buku Tamu Digital • Listrik untuk Kehidupan yang Lebih Baik
                    </p>
                </footer>
            </div>
        </>
    );
}
