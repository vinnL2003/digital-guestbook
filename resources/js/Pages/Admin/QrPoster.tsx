import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps, SiteSetting } from '@/types';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { 
    Printer, 
    Download, 
    ArrowLeft, 
    QrCode, 
    Copy, 
    Check, 
    Building2, 
    ShieldCheck, 
    Smartphone, 
    Sparkles, 
    FileText,
    ExternalLink
} from 'lucide-react';

interface QrPosterProps {
    setting: SiteSetting;
    defaultCheckInUrl: string;
    defaultCheckOutUrl?: string;
    defaultWelcomeUrl: string;
}

export default function QrPoster({ auth, setting, defaultCheckInUrl, defaultCheckOutUrl, defaultWelcomeUrl }: PageProps<QrPosterProps>) {
    const [targetType, setTargetType] = useState<'check-in' | 'check-out' | 'welcome'>('check-in');
    const [customUrl, setCustomUrl] = useState<string>(defaultCheckInUrl);
    const [copied, setCopied] = useState<boolean>(false);
    const qrCanvasRef = useRef<HTMLDivElement | null>(null);

    const handleTargetChange = (type: 'check-in' | 'check-out' | 'welcome') => {
        setTargetType(type);
        if (type === 'check-in') {
            setCustomUrl(defaultCheckInUrl);
        } else if (type === 'check-out') {
            setCustomUrl(defaultCheckOutUrl || `${defaultWelcomeUrl}/check-out`);
        } else {
            setCustomUrl(defaultWelcomeUrl);
        }
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(customUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadQrPng = () => {
        if (!qrCanvasRef.current) return;
        const canvas = qrCanvasRef.current.querySelector('canvas');
        if (!canvas) return;

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `QR-Buku-Tamu-${setting.organization_name.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('dashboard')}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                                Generator Poster QR Code Masuk (Lobi & Security)
                            </h2>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 ml-6">
                            Cetak poster atau standee akrilik resmi untuk ditempel di meja security/pintu masuk. Tamu cukup scan dengan HP.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownloadQrPng}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-all shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Unduh Gambar QR</span>
                        </button>

                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Poster (Print)</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Poster QR Code - ${setting.organization_name}`} />

            {/* Hidden canvas for PNG export */}
            <div ref={qrCanvasRef} className="hidden">
                <QRCodeCanvas
                    value={customUrl}
                    size={600}
                    level="H"
                    includeMargin={true}
                />
            </div>

            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Control Panel (Hidden during print) */}
                <div className="print:hidden p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                        <QrCode className="w-4 h-4" />
                        <span>Pengaturan Sasaran Tautan QR Code</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Target Option */}
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                Halaman Tujuan saat Tamu Scan QR:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleTargetChange('check-in')}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                        targetType === 'check-in'
                                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold ring-2 ring-brand-500/20'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium'
                                    }`}
                                >
                                    <span className="text-xs block font-bold">1. Form Masuk (Check-In)</span>
                                    <span className="text-[10px] opacity-75 font-normal block mt-0.5">
                                        Pintu masuk/lobi: Tamu isi data & TTD
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleTargetChange('check-out')}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                        targetType === 'check-out'
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/20'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium'
                                    }`}
                                >
                                    <span className="text-xs block font-bold">2. Pos Keluar (Check-Out)</span>
                                    <span className="text-[10px] opacity-75 font-normal block mt-0.5">
                                        Gerbang security: Tamu selesai kunjungan
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleTargetChange('welcome')}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                        targetType === 'welcome'
                                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold ring-2 ring-brand-500/20'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium'
                                    }`}
                                >
                                    <span className="text-xs block font-bold">3. Layar Registrasi Lobi</span>
                                    <span className="text-[10px] opacity-75 font-normal block mt-0.5">
                                        Halaman sambutan depan
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* URL Box */}
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                Tautan URL yang Disematkan di QR:
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={customUrl}
                                    onChange={(e) => setCustomUrl(e.target.value)}
                                    placeholder="Contoh: http://192.168.1.25:8080/check-out"
                                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={handleCopyUrl}
                                    className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 inline-flex items-center gap-1.5 shrink-0"
                                    title="Salin Tautan"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                                </button>
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                                *Saat ini menggunakan IP Wi-Fi lokal <span className="font-mono text-brand-600 dark:text-brand-400">192.168.1.25</span> agar HP tamu yang terhubung ke Wi-Fi kantor dapat langsung membukanya.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ======================================================== */}
                {/* PRINTABLE POSTER / STANDEE PREVIEW (A4 / A5 RATIO)       */}
                {/* ======================================================== */}
                <div className="flex justify-center print:block print:w-full print:m-0">
                    <div 
                        id="printable-qr-poster"
                        className="w-full max-w-xl bg-white text-zinc-900 rounded-3xl p-8 sm:p-12 shadow-2xl border-4 border-zinc-900/10 print:border-2 print:border-zinc-800 print:shadow-none print:max-w-none print:w-full print:rounded-none relative overflow-hidden"
                    >
                        {/* Top Decorative Border Banner (PLN Official Colors) */}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-[#0099D8] via-[#FFD500] to-[#E31B23]" />

                        {/* Poster Header with Dual Logos */}
                        <div className="text-center space-y-3 pb-6 border-b-2 border-dashed border-zinc-200">
                            <div className="flex items-center justify-center gap-4 mx-auto mb-2">
                                <img
                                    src="/images/Logo_PLN.png"
                                    alt="Logo PLN"
                                    className="h-14 w-auto object-contain drop-shadow-sm"
                                />
                                <div className="h-10 w-[2px] bg-zinc-300" />
                                <img
                                    src="/images/Logo_UPT_Manado.png"
                                    alt="Logo UPT Manado"
                                    className="h-12 w-auto object-contain drop-shadow-sm"
                                />
                            </div>

                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-tight">
                                    PT PLN (PERSERO)
                                </h1>
                                <p className="text-sm font-extrabold text-[#0099D8] tracking-wider uppercase">
                                    UNIT PELAKSANA TRANSMISI MANADO
                                </p>
                            </div>

                            <div className="inline-block px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-widest">
                                {targetType === 'check-out' ? 'Pos Keamanan • Check-Out Mandiri' : 'Sistem Buku Tamu Digital'}
                            </div>
                        </div>

                        {/* Poster Hero Callout */}
                        <div className="text-center py-6 space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                                {targetType === 'check-out' ? 'CHECK-OUT KUNJUNGAN' : 'SELAMAT DATANG'}
                            </h2>
                            <p className="text-sm sm:text-base font-semibold text-brand-700 max-w-md mx-auto">
                                {targetType === 'check-out' 
                                    ? 'Pindai (Scan) QR Code di Bawah Ini untuk Menyelesaikan Kunjungan Sebelum Keluar' 
                                    : 'Silakan Pindai (Scan) QR Code di Bawah Ini untuk Mengisi Kehadiran Kunjungan'}
                            </p>
                        </div>

                        {/* Large High-Contrast QR Code Card */}
                        <div className="flex justify-center my-2">
                            <div className="p-5 bg-white rounded-3xl border-4 border-zinc-900 shadow-xl inline-block print:border-4">
                                <QRCodeSVG
                                    value={customUrl}
                                    size={230}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                        </div>

                        {/* 3 Step Instruction Guide */}
                        <div className="mt-8 pt-6 border-t-2 border-dashed border-zinc-200">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider text-center mb-4">
                                {targetType === 'check-out' 
                                    ? '3 Langkah Check-Out Kunjungan:' 
                                    : '3 Langkah Mudah Mengisi Buku Tamu:'}
                            </p>

                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                                    <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1 shadow-sm">
                                        1
                                    </div>
                                    <p className="text-xs font-extrabold text-zinc-800">
                                        Buka Kamera
                                    </p>
                                    <p className="text-[10px] text-zinc-500 leading-tight">
                                        Arahkan kamera smartphone ke kode QR
                                    </p>
                                </div>

                                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                                    <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1 shadow-sm">
                                        2
                                    </div>
                                    <p className="text-xs font-extrabold text-zinc-800">
                                        {targetType === 'check-out' ? 'Input ID Badge' : 'Isi Data & TTD'}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 leading-tight">
                                        {targetType === 'check-out' 
                                            ? 'Masukkan kode tiket dari E-Badge Anda' 
                                            : 'Isi identitas & goreskan tanda tangan'}
                                    </p>
                                </div>

                                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                                    <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1 shadow-sm">
                                        3
                                    </div>
                                    <p className="text-xs font-extrabold text-zinc-800">
                                        {targetType === 'check-out' ? 'Tunjukkan E-Badge' : 'E-Badge Terbit'}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 leading-tight">
                                        {targetType === 'check-out' 
                                            ? 'Perlihatkan status "Checked Out" ke security' 
                                            : 'Simpan tiket digital sebagai izin masuk'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Alternate direct link & security footnote */}
                        <div className="mt-8 text-center space-y-1 text-zinc-500">
                            <p className="text-[11px] font-mono text-zinc-600 bg-zinc-100 py-1 px-3 rounded-lg inline-block border border-zinc-200">
                                Akses Manual: {customUrl}
                            </p>
                            <p className="text-[10px] text-zinc-400 italic">
                                *Harap tunjukkan E-Badge digital Anda kepada petugas keamanan / resepsionis saat check-out kepulangan.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
