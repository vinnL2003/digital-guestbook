import React, { useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { SiteSetting, Visit } from '@/types';
import confetti from 'canvas-confetti';
import { 
    CheckCircle2, 
    Printer, 
    ArrowLeft, 
    Calendar, 
    Clock, 
    Building2, 
    User, 
    Users, 
    Briefcase, 
    MapPin, 
    FileText,
    Download,
    Fingerprint,
    ShieldCheck,
    Lock,
    Sparkles,
    Check,
    PenTool,
    Zap,
    LogOut
} from 'lucide-react';
import PlnBrandHeader from '@/Components/PlnBrandHeader';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ShineBorder } from '@/components/ui/shine-border-02';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TicketProps {
    visit: Visit;
    setting: SiteSetting;
}

export default function Ticket({ visit, setting }: TicketProps) {
    const ticketRef = useRef<HTMLDivElement | null>(null);

    // Fire confetti on ticket generated
    useEffect(() => {
        try {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#0e8ce4', '#10b981', '#6366f1', '#f59e0b'],
            });
        } catch (e) {
            // ignore if blocked
        }
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const membersList = (visit.members && visit.members.length > 0)
        ? visit.members
        : [{ id: 1, visit_id: visit.id, name: visit.visitor_name, signature_base64: visit.signature_base64, is_leader: true }];

    const handleDownloadPdf = () => {
        // Adjust PDF page height dynamically if group has many members
        const extraHeight = Math.max(0, (membersList.length - 1) * 16);
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [105, 148 + extraHeight], // Dynamic A6 height
        });

        // Header (PLN Blue #0099D8 & PLN Yellow #FFD500 Accent)
        doc.setFillColor(0, 153, 216);
        doc.rect(0, 0, 105, 18, 'F');
        doc.setFillColor(255, 213, 0);
        doc.rect(0, 18, 105, 1.5, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.text('PT PLN (PERSERO) UPT MANADO', 52.5, 8.5, { align: 'center' });
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text('E-BADGE RESMI KUNJUNGAN TAMU', 52.5, 13.5, { align: 'center' });

        // Ticket Code Box
        doc.setFillColor(243, 248, 252);
        doc.roundedRect(8, 23, 89, 14, 2, 2, 'F');
        doc.setTextColor(7, 21, 38);
        doc.setFontSize(8);
        doc.text('ID BADGE / TIKET KUNJUNGAN', 52.5, 28, { align: 'center' });
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 153, 216);
        doc.text(visit.ticket_code, 52.5, 34, { align: 'center' });

        // Visitor Details Table
        const checkInDate = new Date(visit.check_in_time).toLocaleString('id-ID', {
            timeZone: 'Asia/Makassar',
            dateStyle: 'medium',
            timeStyle: 'short',
        }) + ' WITA';

        const membersNames = membersList.map(m => m.name).join(', ');

        autoTable(doc, {
            startY: 38,
            theme: 'plain',
            styles: { fontSize: 8, cellPadding: 1.5, textColor: [30, 41, 59] },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 32 },
                1: { cellWidth: 55 },
            },
            body: [
                ['Nama Pengunjung', `: ${visit.visitor_name}`],
                ...(membersList.length > 1 ? [['Daftar Rombongan', `: ${membersNames}`]] : []),
                ['Instansi / Asal', `: ${visit.institution}`],
                ['Nomor Telepon', `: ${visit.phone_number}`],
                ['Tujuan Divisi', `: ${visit.division ? visit.division.division_name : '-'}`],
                ...(visit.destination_person ? [['Menemui (Pihak)', `: ${visit.destination_person}`]] : []),
                ['Lokasi Ruangan', `: ${visit.division?.room_location || '-'}`],
                ['Jumlah Tamu', `: ${visit.visitor_count} Orang`],
                ['Waktu Masuk', `: ${checkInDate}`],
                ['Keperluan', `: ${visit.purpose}`],
            ],
        });

        // Add Individual Signature Images for each group member
        // @ts-ignore
        let currentY = (doc.lastAutoTable?.finalY || 95) + 4;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`Bukti Tanda Tangan (${membersList.length} Orang):`, 10, currentY);
        currentY += 4;

        membersList.forEach((m, idx) => {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(14, 140, 228);
            doc.text(`${idx + 1}. ${m.name} (${m.is_leader ? 'Ketua' : 'Anggota'}):`, 10, currentY + 3);

            if (m.signature_base64) {
                try {
                    doc.addImage(m.signature_base64, 'PNG', 55, currentY - 2, 32, 11);
                } catch (err) {
                    // fallback
                }
            }
            currentY += 13;
        });

        // Footer note
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('*Harap tunjukkan badge ini kepada petugas saat check-out kepulangan.', 52.5, currentY + 4, { align: 'center' });

        doc.save(`Badge-Tamu-${visit.ticket_code}.pdf`);
    };

    const checkInDateObj = new Date(visit.check_in_time);

    const formattedDate = checkInDateObj.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Makassar',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const formattedTime = checkInDateObj.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
    });

    const checkOutDateObj = visit.check_out_time ? new Date(visit.check_out_time) : null;
    const formattedCheckOutTime = checkOutDateObj ? checkOutDateObj.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
    }) : null;

    const calculateDuration = () => {
        if (!visit.check_in_time) return '-';
        const inTime = new Date(visit.check_in_time).getTime();
        const outTime = visit.check_out_time ? new Date(visit.check_out_time).getTime() : new Date().getTime();
        const diffMs = Math.max(0, outTime - inTime);
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        if (hours > 0) {
            return `${hours} Jam ${mins} Menit`;
        }
        return `${Math.max(1, mins)} Menit`;
    };

    return (
        <>
            <Head title={`E-Badge Tamu: ${visit.ticket_code} - ${setting.organization_name}`} />

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
                <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-sky-500/15 blur-[140px] pointer-events-none" />
                <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

                {/* Header (hidden during print) */}
                <header className="print:hidden relative z-10 border-b border-sky-900/40 bg-[#061423]/85 backdrop-blur-md px-4 sm:px-6 py-3.5">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <Link
                            href={route('guest.welcome')}
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-sky-200 hover:text-white transition-colors py-2 px-3 rounded-xl hover:bg-sky-950/60 border border-sky-900/50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Halaman Depan</span>
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
                <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
                    <div className="max-w-md w-full space-y-6">
                        
                        {/* Action Bar (hidden during print) */}
                        <div className="print:hidden flex items-center justify-between gap-2">
                            <Link
                                href={route('guest.check-in')}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-950/70 hover:bg-sky-900/80 border border-sky-800/60 text-xs sm:text-sm font-medium text-sky-200 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Input Tamu Lain</span>
                            </Link>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handlePrint}
                                    className="gap-1.5 h-10 px-3.5 text-xs sm:text-sm border-sky-800 bg-sky-950/60 hover:bg-sky-900/80 text-sky-200"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Cetak</span>
                                </Button>
                                <Button
                                    onClick={handleDownloadPdf}
                                    className="gap-1.5 h-10 px-4 text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Unduh PDF</span>
                                </Button>
                            </div>
                        </div>

                        {/* ======================================================== */}
                        {/* 21ST.DEV INTEGRATION: SHINEBORDER LASER SCAN VISITOR BADGE */}
                        {/* ======================================================== */}
                        <div ref={ticketRef} className="w-full">
                            <ShineBorder
                                borderWidth={2}
                                duration={3.5}
                                gradient="from-[#0099D8] via-[#FFD500] to-[#0284c7]"
                                className="w-full rounded-3xl bg-sky-950/40 border-sky-900/60 shadow-2xl backdrop-blur-xl"
                            >
                                <Card className="relative h-full rounded-3xl border-0 ring-0 bg-transparent overflow-hidden text-zinc-100">
                                    
                                    {/* Badge Top Header with Official PLN Dual Logos */}
                                    <CardHeader className="p-5 sm:p-6 pb-4 border-b border-sky-900/60 bg-sky-950/30">
                                        {/* Dual Logo Row */}
                                        <div className="flex items-center justify-between pb-3 border-b border-sky-900/50">
                                            <div className="flex items-center gap-2 sm:gap-2.5">
                                                <img
                                                    src="/images/Logo_PLN.png"
                                                    alt="PLN"
                                                    className="h-8 w-auto object-contain"
                                                />
                                                <div className="h-6 w-px bg-sky-700/60" />
                                                <img
                                                    src="/images/Logo_UPT_Manado.png"
                                                    alt="UPT Manado"
                                                    className="h-7 w-auto object-contain"
                                                />
                                            </div>
                                            <Badge className="gap-1 bg-amber-400/10 text-amber-300 border-amber-400/30 px-2 py-0.5 text-[10px] font-bold">
                                                <Zap className="size-3 text-amber-400 animate-pulse" />
                                                VISITOR PASS
                                            </Badge>
                                        </div>

                                        {/* Badge Verification Row */}
                                        <div className="flex items-center justify-between pt-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="size-8 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
                                                    <Fingerprint className="size-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white tracking-tight">
                                                        PT PLN (Persero) UPT Manado
                                                    </p>
                                                    <p className="text-[10px] text-sky-300/70">
                                                        Tanda Tangan Digital Sah Terverifikasi
                                                    </p>
                                                </div>
                                            </div>
                                            {visit.status === 'checked_out' ? (
                                                <span className="text-[10px] font-mono font-bold text-sky-300 flex items-center gap-1 bg-sky-950/70 border border-sky-800 px-2.5 py-0.5 rounded-full">
                                                    <CheckCircle2 className="size-3 text-emerald-400" />
                                                    Checked Out
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                                                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    Checked In
                                                </span>
                                            )}
                                        </div>
                                    </CardHeader>

                                    {/* Badge Main Body */}
                                    <CardContent className="p-5 sm:p-6 flex flex-col gap-5">
                                        
                                        {/* Visitor Identity (Tanpa Foto Profil) */}
                                        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block mb-0.5">
                                                        Nama Pengunjung / PIC
                                                    </span>
                                                    <p className="text-base sm:text-lg font-extrabold text-white truncate">
                                                        {visit.visitor_name}
                                                    </p>
                                                    <p className="text-xs text-zinc-300 font-medium truncate mt-0.5">
                                                        {visit.institution}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-[10px] font-semibold text-zinc-500 block uppercase">
                                                        ID Tiket
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-white bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 inline-block mt-0.5">
                                                        #{visit.ticket_code}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active Check-Out Trigger OR Departure Verification Stamp */}
                                        {visit.status === 'checked_in' ? (
                                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                                                <div className="flex items-center justify-between text-xs px-1">
                                                    <span className="text-amber-300 font-bold flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                                        Kunjungan Berlangsung ({calculateDuration()})
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 font-mono">
                                                        #{visit.ticket_code}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={route('guest.check-out', { ticket: visit.ticket_code })}
                                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40 transition-all hover:scale-[1.01]"
                                                >
                                                    <LogOut className="w-4 h-4 text-zinc-950" />
                                                    <span>Selesaikan Kunjungan (Check-Out Mandiri)</span>
                                                </Link>
                                                <p className="text-[10px] text-zinc-400">
                                                    *Tekan tombol ini saat keluar, atau scan QR Code di Pos Security.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-center space-y-1.5 shadow-lg">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
                                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                                    <span>IZIN KELUAR RESMI TERVERIFIKASI</span>
                                                </div>
                                                <p className="text-xs text-white font-extrabold">
                                                    Check-Out: {formattedCheckOutTime} WITA • Durasi: {calculateDuration()}
                                                </p>
                                                <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                                                    Harap perlihatkan layar E-Badge ini kepada Petugas Security di Gerbang Keluar PT PLN (Persero) UPT Manado sebelum meninggalkan kantor.
                                                </p>
                                            </div>
                                        )}

                                        {/* Security & Access Grid (2x2 Matrix) */}
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/80 p-3">
                                                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                                    Waktu Masuk
                                                </p>
                                                <p className="text-sm font-bold text-white mt-1">
                                                    {formattedTime} WITA
                                                </p>
                                                <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                                                    {formattedDate}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/80 p-3">
                                                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                                    {visit.destination_person ? 'Menemui / Divisi' : 'Divisi Dituju'}
                                                </p>
                                                <p className="text-xs font-bold text-white mt-1 truncate" title={visit.destination_person ? `Menemui: ${visit.destination_person}` : (visit.division?.division_name || '-')}>
                                                    {visit.destination_person ? `Menemui: ${visit.destination_person}` : (visit.division ? visit.division.division_name : '-')}
                                                </p>
                                                <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                                                    {visit.destination_person ? (visit.division?.division_name || 'Personal') : (visit.division?.room_location || 'Gedung Utama')}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/80 p-3">
                                                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                                    Jumlah Tamu
                                                </p>
                                                <p className="text-xs font-bold text-white mt-1">
                                                    {visit.visitor_count} Orang
                                                </p>
                                                <p className="text-[10px] text-zinc-500 mt-0.5">
                                                    {visit.visitor_count > 1 ? 'Kunjungan Rombongan' : 'Kunjungan Individu'}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/80 p-3">
                                                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                                    Status Kunjungan
                                                </p>
                                                {visit.status === 'checked_out' ? (
                                                    <div>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <CheckCircle2 className="size-3.5 text-emerald-400" />
                                                            <p className="text-xs font-bold text-emerald-400">
                                                                Checked Out
                                                            </p>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                                                            Keluar: {formattedCheckOutTime} WITA
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                                                            <p className="text-xs font-bold text-emerald-400">
                                                                Diizinkan Masuk
                                                            </p>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5">
                                                            Checked In
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Purpose Box */}
                                        <div className="rounded-xl bg-zinc-950/40 border border-zinc-800/80 p-3">
                                            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                                                Keperluan Kunjungan
                                            </p>
                                            <p className="text-xs text-zinc-300 leading-relaxed">
                                                {visit.purpose}
                                            </p>
                                        </div>

                                        {/* Laser Scan Verification Success Banner */}
                                        <div className="flex items-center gap-2.5 rounded-xl border border-teal-400/20 bg-teal-400/5 px-4 py-3">
                                            <ShieldCheck className="size-4 text-teal-400 shrink-0" />
                                            <p className="text-xs text-teal-300 font-medium leading-tight">
                                                Verifikasi Komplit — Akses masuk gedung diotorisasi secara digital
                                            </p>
                                        </div>

                                        {/* ========================================================= */}
                                        {/* DAFTAR NAMA & TANDA TANGAN TIAP ANGGOTA ROMBONGAN         */}
                                        {/* ========================================================= */}
                                        <div className="space-y-3 pt-2 border-t border-zinc-800">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                                                    <PenTool className="size-3.5 text-brand-400" />
                                                    <span>Tanda Tangan Pengunjung ({membersList.length} Orang)</span>
                                                </p>
                                                <span className="text-[10px] text-zinc-500">
                                                    Direct Canvas
                                                </span>
                                            </div>

                                            <div className="space-y-2.5">
                                                {membersList.map((m, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between gap-3 shadow-sm"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                                                    #{idx + 1}
                                                                </span>
                                                                <p className="text-xs font-bold text-white truncate">
                                                                    {m.name}
                                                                </p>
                                                            </div>
                                                            <p className="text-[10px] text-brand-300 font-medium mt-0.5">
                                                                Tanda Tangan Sah: {m.is_leader ? 'Ketua' : 'Anggota'}
                                                            </p>
                                                        </div>

                                                        {/* Individual Signature Preview Box (White Background with Dark Ink) */}
                                                        <div className="w-28 h-12 bg-white rounded-xl border border-zinc-200 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                                                            {m.signature_base64 ? (
                                                                <img
                                                                    src={m.signature_base64}
                                                                    alt={`TTD ${m.name}`}
                                                                    className="max-h-full max-w-full object-contain"
                                                                />
                                                            ) : (
                                                                <span className="text-[10px] text-zinc-400 italic">Tanpa TTD</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Button inside card */}
                                        <Button
                                            variant="outline"
                                            onClick={handleDownloadPdf}
                                            className="w-full gap-2 h-10 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold"
                                        >
                                            <Lock className="size-4 text-brand-400" />
                                            Simpan E-Badge Resmi ({membersList.length} Tanda Tangan)
                                        </Button>

                                    </CardContent>
                                </Card>
                            </ShineBorder>
                        </div>

                    </div>
                </main>
            </div>
        </>
    );
}
