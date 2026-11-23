import React, { useState } from 'react';
import {
    ShieldCheck,
    AlertTriangle,
    Lock,
    CheckCircle2,
    X,
    FileText,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    AlertOctagon,
    Zap,
    Layers,
    Tag,
    KeyRound
} from 'lucide-react';

export type InductionZoneKey = 'merah' | 'kuning' | 'biru' | 'hijau';

interface SecurityInductionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAgree?: () => void;
    initialZone?: InductionZoneKey;
    settingTitle?: string | null;
    rawContent?: string | null;
}

interface ZoneInfo {
    key: InductionZoneKey;
    number: string;
    title: string;
    name: string;
    colorName: string;
    riskBadge: string;
    vitalStatus: string;
    definition: string;
    textColor: string;
    borderColor: string;
    bgAccent: string;
    dotGlow: string;
    icon: React.ComponentType<{ className?: string }>;
    markings: string[];
    pemberlakuan: string;
}

export const PLN_ZONES: Record<InductionZoneKey, ZoneInfo> = {
    merah: {
        key: 'merah',
        number: '1',
        title: 'Zona Tertutup (Merah)',
        name: 'Zona Tertutup',
        colorName: 'Merah',
        riskBadge: 'Risiko Sangat Tinggi dan Ekstrem',
        vitalStatus: 'Sangat Vital',
        definition: 'Daerah/lokasi tertentu yang dinilai sangat vital berdasarkan penilaian risiko sangat tinggi dan ekstrem, apabila terjadi gangguan akan/dapat mengakibatkan terhentinya aktifitas perusahaan kecuali mereka yang karena tugas dan jabatannya harus berada didalam dan orang-orang tertentu yang telah mendapatkan ijin kerja berdasarkan lokasi dan jenis pekerjaan melalui surat ijin kerja (Working Permit) dari pimpinan atau pejabat berwenang.',
        textColor: 'text-rose-400',
        borderColor: 'border-rose-500/50',
        bgAccent: 'bg-rose-950/40',
        dotGlow: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)]',
        icon: AlertOctagon,
        markings: [
            'Zona ditandai dengan warna merah',
            'Diberikan rambu zona tertutup',
            'Kartu visitor/pengunjung berwarna merah',
            'Area dilengkapi dengan akses kontrol'
        ],
        pemberlakuan: 'Masuk zona wajib memperoleh akses khusus atau izin dari pejabat terkait dan/atau penanggung jawab area.'
    },
    kuning: {
        key: 'kuning',
        number: '2',
        title: 'Zona Terlarang (Kuning)',
        name: 'Zona Terlarang',
        colorName: 'Kuning',
        riskBadge: 'Risiko Tinggi',
        vitalStatus: 'Lebih Vital',
        definition: 'Daerah/lokasi tertentu yang dinilai lebih vital berdasarkan penilaian risiko tinggi dengan ketentuan bahwa apabila terjadi gangguan akan/dapat mengakibatkan timbulnya gangguan terhadap aktivitas instalasi serta mempengaruhi aktivitas organisasi kecuali mereka yang telah mendapatkan ijin kerja berdasarkan lokasi dan jenis pekerjaan melalui surat ijin kerja (Working Permit) dari pimpinan atau pejabat berwenang.',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/50',
        bgAccent: 'bg-amber-950/40',
        dotGlow: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]',
        icon: AlertTriangle,
        markings: [
            'Zona ditandai dengan warna kuning',
            'Diberikan rambu zona terlarang',
            'Kartu visitor/pengunjung berwarna kuning'
        ],
        pemberlakuan: 'Masuk zona wajib memperoleh izin dari penanggung jawab area.'
    },
    biru: {
        key: 'biru',
        number: '3',
        title: 'Zona Terbatas (Biru)',
        name: 'Zona Terbatas',
        colorName: 'Biru',
        riskBadge: 'Risiko Moderat',
        vitalStatus: 'Tidak Terlalu Vital',
        definition: 'Daerah/lokasi tertentu yang dinilai tidak terlalu vital berdasarkan penilaian risiko moderat dengan ketentuan bahwa apabila terjadi suatu gangguan tidak mengakibatkan hambatan atau terhentinya aktivitas instalasi tersebut.',
        textColor: 'text-sky-400',
        borderColor: 'border-sky-500/50',
        bgAccent: 'bg-sky-950/40',
        dotGlow: 'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]',
        icon: Lock,
        markings: [
            'Zona ditandai dengan warna biru',
            'Diberikan rambu zona terbatas',
            'Kartu visitor/pengunjung berwarna biru'
        ],
        pemberlakuan: 'Masuk zona wajib memperoleh akses khusus atau izin dari Satuan Pengamanan.'
    },
    hijau: {
        key: 'hijau',
        number: '4',
        title: 'Zona Bebas Terbatas (Hijau)',
        name: 'Zona Bebas Terbatas',
        colorName: 'Hijau',
        riskBadge: 'Risiko Rendah',
        vitalStatus: 'Tidak Vital',
        definition: 'Merupakan daerah/lokasi tertentu yang dinilai tidak vital berdasarkan penilaian risiko rendah.',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/50',
        bgAccent: 'bg-emerald-950/40',
        dotGlow: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]',
        icon: CheckCircle2,
        markings: [
            'Zona ditandai dengan warna hijau',
            'Diberikan rambu zona bebas terbatas',
            'Kartu visitor/pengunjung berwarna hijau'
        ],
        pemberlakuan: 'Masuk zona wajib memperoleh akses khusus atau izin dari Satuan Pengamanan.'
    }
};

const ZONE_KEYS: InductionZoneKey[] = ['merah', 'kuning', 'biru', 'hijau'];

export default function SecurityInductionModal({
    isOpen,
    onClose,
    onAgree,
    initialZone = 'merah',
    settingTitle,
    rawContent
}: SecurityInductionModalProps) {
    const [activeZone, setActiveZone] = useState<InductionZoneKey>(initialZone);
    const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');

    if (!isOpen) return null;

    const currentZone = PLN_ZONES[activeZone];
    const CurrentIcon = currentZone.icon;

    const currentIndex = ZONE_KEYS.indexOf(activeZone);
    const prevZone = currentIndex > 0 ? ZONE_KEYS[currentIndex - 1] : null;
    const nextZone = currentIndex < ZONE_KEYS.length - 1 ? ZONE_KEYS[currentIndex + 1] : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#071526] border border-sky-800/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* ======================================================== */}
                {/* MODAL HEADER: BRAND IDENTITY & MODE SWITCHER             */}
                {/* ======================================================== */}
                <div className="p-4 sm:p-5 border-b border-sky-900/80 bg-[#06111f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-lg shadow-amber-500/10">
                            <ShieldCheck className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                                    <Zap className="w-3 h-3 text-amber-400" />
                                    <span>Sistem Manajemen Pengamanan (SMP)</span>
                                </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight mt-1">
                                {settingTitle || 'Security Induction PT PLN (Persero) UPT Manado'}
                            </h3>
                            <p className="text-[11px] text-sky-300/70">
                                Wilayah Kerja PT PLN (Persero) Unit Pelaksana Transmisi Manado
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Switch View Mode */}
                        <div className="inline-flex items-center p-1 rounded-xl bg-sky-950/80 border border-sky-800/70 text-xs">
                            <button
                                type="button"
                                onClick={() => setViewMode('visual')}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'visual'
                                        ? 'bg-sky-500 text-white shadow-sm'
                                        : 'text-sky-300 hover:text-white'
                                    }`}
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>Panduan Visual</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('raw')}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'raw'
                                        ? 'bg-sky-500 text-white shadow-sm'
                                        : 'text-sky-300 hover:text-white'
                                    }`}
                            >
                                <FileText className="w-3 h-3" />
                                <span>Naskah Dokumen</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-sky-400 hover:text-white hover:bg-sky-900/60 border border-sky-800/50 transition-colors cursor-pointer"
                            title="Tutup"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ======================================================== */}
                {/* MODAL BODY                                               */}
                {/* ======================================================== */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

                    {viewMode === 'visual' ? (
                        <>
                            {/* OFFICIAL PREAMBLE BANNER */}
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-950/40 border border-sky-800/50 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div className="text-xs text-sky-200/90 leading-relaxed font-sans">
                                    <span className="font-bold text-white">Ketentuan Umum: </span>
                                    Sesuai dengan penerapan Sistem Manajemen Pengamanan (SMP) di wilayah kerja PT PLN (Persero) Unit Pelaksana Transmisi Manado, maka setiap tamu dipersyaratkan memahami dan melaksanakan peraturan keamanan yang dibuat sebagai berikut:
                                </div>
                            </div>

                            {/* INTERACTIVE 4 ZONE TABS */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-sky-400" />
                                        <span>Pilih Zonasi Pengamanan:</span>
                                    </span>
                                    <span className="text-[11px] text-sky-400/80 hidden sm:inline">
                                        Klik untuk melihat ketentuan masing-masing zona
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {ZONE_KEYS.map((key) => {
                                        const z = PLN_ZONES[key];
                                        const isActive = activeZone === key;

                                        let activeCardStyle = '';
                                        if (key === 'merah') {
                                            activeCardStyle = isActive
                                                ? 'bg-gradient-to-br from-red-950/90 via-red-900/60 to-slate-950 border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-950/80'
                                                : 'bg-red-950/20 border-red-900/40 hover:bg-red-950/40 hover:border-red-700/60';
                                        } else if (key === 'kuning') {
                                            activeCardStyle = isActive
                                                ? 'bg-gradient-to-br from-amber-950/90 via-amber-900/60 to-slate-950 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-950/80'
                                                : 'bg-amber-950/20 border-amber-900/40 hover:bg-amber-950/40 hover:border-amber-700/60';
                                        } else if (key === 'biru') {
                                            activeCardStyle = isActive
                                                ? 'bg-gradient-to-br from-sky-950/90 via-sky-900/60 to-slate-950 border-sky-400 ring-2 ring-sky-400/50 shadow-lg shadow-sky-950/80'
                                                : 'bg-sky-950/20 border-sky-900/40 hover:bg-sky-950/40 hover:border-sky-700/60';
                                        } else {
                                            activeCardStyle = isActive
                                                ? 'bg-gradient-to-br from-emerald-950/90 via-emerald-900/60 to-slate-950 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-950/80'
                                                : 'bg-emerald-950/20 border-emerald-900/40 hover:bg-emerald-950/40 hover:border-emerald-700/60';
                                        }

                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setActiveZone(key)}
                                                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${activeCardStyle}`}
                                            >
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-2.5 h-2.5 rounded-full ${z.dotGlow}`} />
                                                        <span className="font-extrabold text-xs text-white">
                                                            {z.colorName}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-400 opacity-60">
                                                        #{z.number}
                                                    </span>
                                                </div>

                                                <div className="text-[11px] font-semibold text-zinc-300 truncate">
                                                    {z.name}
                                                </div>

                                                <div className="mt-1 flex items-center justify-between">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${key === 'merah' ? 'bg-red-500/20 text-red-300' :
                                                            key === 'kuning' ? 'bg-amber-500/20 text-amber-300' :
                                                                key === 'biru' ? 'bg-sky-500/20 text-sky-300' :
                                                                    'bg-emerald-500/20 text-emerald-300'
                                                        }`}>
                                                        {z.riskBadge}
                                                    </span>
                                                    {isActive && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ACTIVE ZONE SHOWCASE CARD */}
                            <div className={`rounded-3xl border ${currentZone.borderColor} ${currentZone.bgAccent} p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl transition-all`}>

                                {/* Ambient Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                                {/* Zone Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className={`w-12 h-12 rounded-2xl ${currentZone.bgAccent} border ${currentZone.borderColor} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                            <CurrentIcon className={`w-6 h-6 ${currentZone.textColor}`} />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-base sm:text-lg font-black text-white tracking-tight">
                                                    {currentZone.number}. {currentZone.title}
                                                </h4>
                                                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${currentZone.borderColor} ${currentZone.textColor} bg-black/40`}>
                                                    {currentZone.riskBadge}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-300 mt-0.5">
                                                Klasifikasi Keamanan: <span className="font-bold text-white">{currentZone.vitalStatus}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Prev / Next controls */}
                                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                        <button
                                            type="button"
                                            disabled={!prevZone}
                                            onClick={() => prevZone && setActiveZone(prevZone)}
                                            className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Sebelumnya</span>
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!nextZone}
                                            onClick={() => nextZone && setActiveZone(nextZone)}
                                            className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <span className="hidden sm:inline">Selanjutnya</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Section 1: Definisi Daerah/Lokasi (Exact Text from Document) */}
                                <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                                        <span className={`w-2 h-2 rounded-full ${currentZone.dotGlow}`} />
                                        <span>Karakteristik & Definisi Daerah/Lokasi:</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                                        {currentZone.definition}
                                    </p>
                                </div>

                                {/* Section 2: Two Pillars from Document (Penandaan/Pembatasan & Pemberlakuan) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {/* Pillar 1: Penandaan / Pembatasan */}
                                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                                            <Tag className={`w-4 h-4 ${currentZone.textColor}`} />
                                            <span>Penandaan / Pembatasan:</span>
                                        </div>
                                        <ul className="text-xs text-zinc-200 space-y-2">
                                            {currentZone.markings.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className={`mt-0.5 font-bold ${currentZone.textColor}`}>•</span>
                                                    <span className="leading-snug">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Pillar 2: Pemberlakuan */}
                                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                                            <KeyRound className={`w-4 h-4 ${currentZone.textColor}`} />
                                            <span>Pemberlakuan:</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-xs text-zinc-200 leading-relaxed">
                                            {currentZone.pemberlakuan}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* OFFICIAL FOOTER NOTICE */}
                            <div className="p-3 rounded-xl bg-black/30 border border-sky-900/50 text-[11px] text-sky-300/80 text-center font-sans">
                                <em>"Peraturan ini akan selalu ditinjau dan diubah sewaktu-waktu sesuai perkembangan yang ada."</em>
                            </div>
                        </>
                    ) : (
                        /* RAW DOCUMENT TEXT VIEW */
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
                                <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <span>
                                    Menampilkan seluruh naskah resmi Dokumen Security Induction Sistem Manajemen Pengamanan (SMP) PT PLN (Persero) UPT Manado.
                                </span>
                            </div>

                            <div className="p-5 sm:p-6 rounded-2xl bg-black/50 border border-sky-900/60 whitespace-pre-line text-xs sm:text-sm text-sky-100 font-sans leading-relaxed select-text shadow-inner">
                                <div className="font-extrabold text-white text-base mb-3 pb-2 border-b border-sky-900/60 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                                    <span>{settingTitle || 'Security Induction PT PLN (Persero) UPT Manado'}</span>
                                </div>
                                {rawContent || 'Belum ada rincian ketentuan security induction yang diunggah.'}
                            </div>
                        </div>
                    )}

                </div>

                {/* ======================================================== */}
                {/* MODAL FOOTER                                             */}
                {/* ======================================================== */}
                <div className="p-4 sm:p-5 border-t border-sky-900/80 bg-[#06111f] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-sky-300/70 text-center sm:text-left">
                        *Dengan mengklik setuju, Anda menyatakan memahami dan bersedia mematuhi peraturan keamanan di atas.
                    </p>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-sky-800 text-xs font-semibold text-sky-300 hover:text-white hover:bg-sky-950 transition-colors cursor-pointer"
                        >
                            Tutup
                        </button>

                        {onAgree && (
                            <button
                                type="button"
                                onClick={() => {
                                    onAgree();
                                    onClose();
                                }}
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-sky-500 to-brand-600 hover:from-brand-500 hover:to-sky-400 text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/25 ring-1 ring-sky-400/40 cursor-pointer"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Saya Paham & Setuju</span>
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
