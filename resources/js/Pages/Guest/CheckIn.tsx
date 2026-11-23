import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Division, SiteSetting } from '@/types';
import SignaturePad from '@/Components/SignaturePad';
import {
    Building2,
    ArrowLeft,
    User,
    Briefcase,
    Phone,
    MapPin,
    Users,
    FileText,
    Send,
    AlertCircle,
    ShieldCheck,
    CheckCircle2,
    Clock,
    Calendar,
    Sparkles,
    UserPlus,
    Trash2,
    PenTool,
    Zap,
    Eye,
    X
} from 'lucide-react';
import PlnBrandHeader from '@/Components/PlnBrandHeader';
import SecurityInductionModal, { InductionZoneKey } from '@/Components/SecurityInductionModal';

interface CheckInProps {
    setting: SiteSetting;
    divisions: Division[];
}

interface MemberItem {
    name: string;
    signature_base64: string;
}

export default function CheckIn({ setting, divisions }: CheckInProps) {
    const { data, setData, post, processing, errors } = useForm<{
        visitor_name: string;
        institution: string;
        phone_number: string;
        division_id: string;
        destination_person: string;
        visitor_count: number;
        purpose: string;
        signature_base64: string;
        members: MemberItem[];
    }>({
        visitor_name: '',
        institution: '',
        phone_number: '',
        division_id: divisions.length > 0 ? divisions[0].id.toString() : '',
        destination_person: '',
        visitor_count: 1,
        purpose: '',
        signature_base64: '',
        members: [
            { name: '', signature_base64: '' }
        ],
    });

    const selectedDivision = divisions.find((d) => d.id.toString() === data.division_id.toString());
    const isCustomPerson = selectedDivision ? selectedDivision.division_name.toLowerCase().includes('lainnya') : false;

    const [clientError, setClientError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>('');
    const [inductionAgreed, setInductionAgreed] = useState<boolean>(false);
    const [isInductionModalOpen, setIsInductionModalOpen] = useState<boolean>(false);
    const [selectedZoneForModal, setSelectedZoneForModal] = useState<InductionZoneKey>('merah');

    const handleOpenZoneModal = (zoneKey: InductionZoneKey) => {
        setSelectedZoneForModal(zoneKey);
        setIsInductionModalOpen(true);
    };

    // Real-time clock for check-in
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

    // Sync members array when visitor_count is updated
    const handleVisitorCountChange = (newCount: number) => {
        const count = Math.max(1, Math.min(50, newCount));
        const currentMembers = [...data.members];

        if (count > currentMembers.length) {
            // Add new empty member slots
            for (let i = currentMembers.length; i < count; i++) {
                currentMembers.push({ name: '', signature_base64: '' });
            }
        } else if (count < currentMembers.length) {
            // Trim slots
            currentMembers.splice(count);
        }

        setData((prev) => ({
            ...prev,
            visitor_count: count,
            members: currentMembers,
        }));
    };

    // Update single member name
    const handleMemberNameChange = (index: number, name: string) => {
        const updated = [...data.members];
        updated[index].name = name;

        setData((prev) => ({
            ...prev,
            members: updated,
            visitor_name: index === 0 ? name : prev.visitor_name,
        }));
    };

    // Update single member signature
    const handleMemberSignatureChange = (index: number, signatureBase64: string) => {
        const updated = [...data.members];
        updated[index].signature_base64 = signatureBase64;

        setData((prev) => ({
            ...prev,
            members: updated,
            signature_base64: index === 0 ? signatureBase64 : prev.signature_base64,
        }));

        if (signatureBase64) {
            setClientError(null);
        }
    };

    // Add another member
    const handleAddMember = () => {
        handleVisitorCountChange(data.visitor_count + 1);
    };

    // Remove specific member
    const handleRemoveMember = (indexToRemove: number) => {
        if (data.visitor_count <= 1) return;
        const updated = data.members.filter((_, idx) => idx !== indexToRemove);
        setData((prev) => ({
            ...prev,
            visitor_count: updated.length,
            members: updated,
            visitor_name: updated[0]?.name || '',
            signature_base64: updated[0]?.signature_base64 || '',
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setClientError(null);

        // Validate destination person if 'Lainnya' division is selected
        if (isCustomPerson && !data.destination_person.trim()) {
            setClientError('Mohon sebutkan nama orang atau pegawai yang ingin Anda temui!');
            const el = document.getElementById('destination-person-input');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Acceptance Criteria: Validate every member's name and direct signature
        for (let i = 0; i < data.members.length; i++) {
            const member = data.members[i];
            const memberLabel = i === 0
                ? 'Tamu #1 (Ketua Rombongan)'
                : `Tamu #${i + 1}`;

            if (!member.name.trim()) {
                setClientError(`Mohon isi nama lengkap untuk ${memberLabel}!`);
                const el = document.getElementById(`member-name-input-${i}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            if (!member.signature_base64 || member.signature_base64.trim().length < 50) {
                setClientError(`Harap bubuhkan tanda tangan digital milik ${member.name || memberLabel} pada kanvas yang disediakan!`);
                const el = document.getElementById(`member-signature-section-${i}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
        }

        // Validate Security Induction agreement
        if (setting.is_security_induction_active !== false && !inductionAgreed) {
            setClientError('Mohon baca dan centang persetujuan Security Induction PT PLN (Persero) UPT Manado terlebih dahulu sebelum mengirim pendaftaran!');
            const el = document.getElementById('security-induction-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        post(route('guest.check-in.store'), {
            onError: (err) => {
                const firstError = Object.values(err)[0];
                if (firstError) {
                    setClientError(firstError as string);
                }
            },
        });
    };

    return (
        <>
            <Head title={`Formulir Registrasi Tamu - PT PLN (Persero) UPT Manado`} />

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
                <div className="absolute top-0 right-1/4 w-[450px] h-[450px] rounded-full bg-sky-500/15 blur-[140px] pointer-events-none" />
                <div className="absolute bottom-1/4 left-10 w-[380px] h-[380px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

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

                {/* Form Main Container */}
                <main className="relative z-10 flex-1 py-8 sm:py-12 px-4 sm:px-6">
                    <div className="max-w-2xl mx-auto">

                        {/* Title Card */}
                        <div className="mb-6 text-center sm:text-left">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-400/30 text-xs font-semibold mb-2">
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                                <span>PT PLN (Persero) UPT Manado • Registrasi Kunjungan</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Formulir Registrasi Tamu
                            </h1>
                            <p className="text-xs sm:text-sm text-sky-200/70 mt-1">
                                Waktu masuk otomatis tercatat sesuai jam saat ini. Lengkapi identitas dan tanda tangan masing-masing orang.
                            </p>

                            {/* Realtime Timestamp Badge */}
                            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-950/70 border border-sky-800/60 text-xs font-medium text-sky-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-sky-300/80">Waktu Masuk Real-Time:</span>
                                <span className="font-mono font-bold text-white">{currentTime || '...'}</span>
                                <span className="text-sky-400/60 hidden sm:inline">• {todayFormatted}</span>
                            </div>
                        </div>

                        {/* Validation Alert */}
                        {clientError && (
                            <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-sm flex items-start gap-3 shadow-lg animate-shake">
                                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-rose-100">Perhatian:</h4>
                                    <p className="text-xs text-rose-300 mt-0.5">{clientError}</p>
                                </div>
                            </div>
                        )}

                        {/* Form Card */}
                        <form onSubmit={handleSubmit} className="bg-sky-950/40 border border-sky-900/50 rounded-3xl p-5 sm:p-8 backdrop-blur-xl shadow-2xl space-y-7">

                            {/* ========================================= */}
                            {/* SECTION 1: INSTANSI & TUJUAN KUNJUNGAN    */}
                            {/* ========================================= */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
                                    <Briefcase className="w-4 h-4 text-brand-400" />
                                    <span>1. Asal & Tujuan Kunjungan</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Instansi / Asal */}
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                            Asal / Instansi / Perusahaan <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={data.institution}
                                                onChange={(e) => setData('institution', e.target.value)}
                                                placeholder="Contoh: PT PLN / Dinas Kominfo"
                                                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-zinc-950/60 border border-zinc-700/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 text-white placeholder-zinc-500 text-base sm:text-sm transition-all"
                                            />
                                        </div>
                                        {errors.institution && (
                                            <p className="text-xs text-rose-400 mt-1">{errors.institution}</p>
                                        )}
                                    </div>

                                    {/* Nomor WhatsApp / HP */}
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                            Nomor WhatsApp / HP Penanggung Jawab <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                value={data.phone_number}
                                                onChange={(e) => setData('phone_number', e.target.value)}
                                                placeholder="Contoh: 081234567890"
                                                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-zinc-950/60 border border-zinc-700/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 text-white placeholder-zinc-500 text-base sm:text-sm transition-all"
                                            />
                                        </div>
                                        {errors.phone_number && (
                                            <p className="text-xs text-rose-400 mt-1">{errors.phone_number}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Divisi / Pihak Tujuan */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                            Divisi / Pejabat yang Dituju <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={data.division_id}
                                                onChange={(e) => setData('division_id', e.target.value)}
                                                className="w-full px-4 py-3 min-h-[48px] rounded-xl bg-zinc-950/60 border border-zinc-700/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 text-white text-base sm:text-sm transition-all"
                                            >
                                                {divisions.map((div) => (
                                                    <option key={div.id} value={div.id} className="bg-zinc-900 text-white">
                                                        {div.division_name} {div.room_location ? `(${div.room_location})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.division_id && (
                                            <p className="text-xs text-rose-400 mt-1">{errors.division_id}</p>
                                        )}
                                    </div>

                                    {/* Jumlah Tamu (Stepper / Counter) */}
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                            Jumlah Orang <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="flex items-center rounded-xl bg-zinc-950/60 border border-zinc-700/80 p-1">
                                            <button
                                                type="button"
                                                onClick={() => handleVisitorCountChange(data.visitor_count - 1)}
                                                disabled={data.visitor_count <= 1}
                                                className="w-10 h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-lg text-white"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max="50"
                                                required
                                                value={data.visitor_count}
                                                onChange={(e) => handleVisitorCountChange(parseInt(e.target.value) || 1)}
                                                className="w-full text-center py-2 bg-transparent border-0 text-white font-bold text-base focus:ring-0"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleVisitorCountChange(data.visitor_count + 1)}
                                                disabled={data.visitor_count >= 50}
                                                className="w-10 h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-lg text-white"
                                            >
                                                +
                                            </button>
                                        </div>
                                        {errors.visitor_count && (
                                            <p className="text-xs text-rose-400 mt-1">{errors.visitor_count}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Field Khusus: Jika Memilih 'Lainnya / Menemui Seseorang (Isi Sendiri)' */}
                                {isCustomPerson && (
                                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-bold text-amber-300">
                                                Nama Orang / Pegawai yang Ingin Ditemui <span className="text-rose-400">*</span>
                                            </label>
                                            <span className="text-[10px] text-amber-400/70 font-medium">
                                                Wajib Diisi (Isi Sendiri)
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400/80">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <input
                                                id="destination-person-input"
                                                type="text"
                                                required
                                                value={data.destination_person}
                                                onChange={(e) => setData('destination_person', e.target.value)}
                                                placeholder="Contoh: Bpk. Ricky Tangkuman / Staff Pemeliharaan Gardu"
                                                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-zinc-950/80 border border-amber-500/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-white placeholder-zinc-500 text-base sm:text-sm transition-all"
                                            />
                                        </div>
                                        <p className="text-[11px] text-amber-200/80">
                                            Kunjungan Anda akan dicatat khusus untuk menemui nama/pihak yang Anda tulis di atas.
                                        </p>
                                        {errors.destination_person && (
                                            <p className="text-xs text-rose-400 mt-1">{errors.destination_person}</p>
                                        )}
                                    </div>
                                )}

                                {/* Keperluan Kunjungan */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                        Keperluan / Agenda Kunjungan <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        required
                                        value={data.purpose}
                                        onChange={(e) => setData('purpose', e.target.value)}
                                        placeholder="Sebutkan maksud dan keperluan kunjungan Anda secara jelas"
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-950/60 border border-zinc-700/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 text-white placeholder-zinc-500 text-base sm:text-sm transition-all resize-none"
                                    />
                                    {errors.purpose && (
                                        <p className="text-xs text-rose-400 mt-1">{errors.purpose}</p>
                                    )}
                                </div>
                            </div>

                            {/* ========================================================================= */}
                            {/* SECTION 2: DAFTAR NAMA & TANDA TANGAN TIAP ORANG (INDIVIDU & ROMBONGAN)  */}
                            {/* ========================================================================= */}
                            <div className="space-y-6 pt-4 border-t border-zinc-800">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                                    <div>
                                        <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                                            <Users className="w-4 h-4 text-brand-400" />
                                            <span>2. Identitas & Tanda Tangan ({data.visitor_count} Orang)</span>
                                        </h3>
                                        <p className="text-[11px] text-zinc-400 mt-0.5">
                                            Tiap orang wajib menuliskan nama lengkap dan membubuhkan tanda tangan masing-masing di bawah namanya.
                                        </p>
                                    </div>

                                    {/* Add Member Button */}
                                    <button
                                        type="button"
                                        onClick={handleAddMember}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600/20 border border-brand-500/30 hover:bg-brand-600/30 text-xs font-semibold text-brand-300 transition-all self-start sm:self-auto"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        <span>+ Tambah Orang</span>
                                    </button>
                                </div>

                                {/* List of Members with Designated Signature Pads */}
                                <div className="space-y-6">
                                    {data.members.map((member, index) => {
                                        const isLeader = index === 0;
                                        const memberTitle = isLeader
                                            ? 'Tamu #1 — Ketua Rombongan / PIC'
                                            : `Tamu #${index + 1} — Anggota Rombongan`;

                                        return (
                                            <div
                                                key={index}
                                                id={`member-signature-section-${index}`}
                                                className="rounded-2xl p-4 sm:p-5 bg-zinc-950/70 border border-zinc-800/90 shadow-md space-y-4 relative"
                                            >
                                                {/* Member Card Header */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isLeader
                                                                ? 'bg-brand-600 text-white'
                                                                : 'bg-zinc-800 text-zinc-300'
                                                            }`}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs sm:text-sm font-bold text-white">
                                                                {memberTitle}
                                                            </h4>
                                                            <p className="text-[10px] text-zinc-400">
                                                                {isLeader ? 'Penanggung jawab utama rombongan' : 'Anggota rombongan'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Delete button (only for members > 0) */}
                                                    {!isLeader && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMember(index)}
                                                            className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
                                                            title="Hapus tamu ini dari rombongan"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span className="hidden sm:inline">Hapus</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Input Nama Tamu */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                                        Nama Lengkap Tamu #{index + 1} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <input
                                                            id={`member-name-input-${index}`}
                                                            type="text"
                                                            required
                                                            value={member.name}
                                                            onChange={(e) => handleMemberNameChange(index, e.target.value)}
                                                            placeholder={`Tulis nama lengkap Tamu #${index + 1}`}
                                                            className="w-full pl-10 pr-4 py-2.5 min-h-[46px] rounded-xl bg-zinc-900 border border-zinc-700/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 text-white placeholder-zinc-500 text-base sm:text-sm transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Designated Digital Signature Canvas with Clear Identity Label */}
                                                <div className="pt-2">
                                                    <div className="mb-1 flex items-center justify-between">
                                                        <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                                                            <PenTool className="w-3.5 h-3.5 text-brand-400" />
                                                            <span>Tanda Tangan Milik:</span>
                                                            <span className="text-brand-300 underline underline-offset-2">
                                                                {member.name.trim() || `(Tamu #${index + 1})`}
                                                            </span>
                                                        </span>
                                                        {member.signature_base64 ? (
                                                            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Tanda Tangan Sah
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-zinc-400">
                                                                Goreskan langsung di bawah
                                                            </span>
                                                        )}
                                                    </div>

                                                    <SignaturePad
                                                        hideTopLabel={true}
                                                        value={member.signature_base64}
                                                        onChange={(base64) => handleMemberSignatureChange(index, base64)}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ========================================================================= */}
                            {/* SECTION 3: SECURITY INDUCTION & KETENTUAN ZONASI PENGAMANAN PLN UPT MANADO */}
                            {/* ========================================================================= */}
                            {setting.is_security_induction_active !== false && (
                                <div
                                    id="security-induction-section"
                                    className="pt-6 border-t border-sky-900/60 space-y-4"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-900/60 pb-3">
                                        <div>
                                            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-amber-400" />
                                                <span>3. {setting.security_induction_title || 'Security Induction PT PLN (Persero) UPT Manado'}</span>
                                            </h3>
                                            <p className="text-[11px] text-sky-200/70 mt-0.5">
                                                Sistem Manajemen Pengamanan (SMP) • Penerapan Zonasi Keselamatan & Keamanan Kerja
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsInductionModalOpen(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-900/50 hover:bg-sky-800/60 border border-sky-700/60 text-xs font-semibold text-sky-200 hover:text-white transition-all self-start sm:self-auto cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-sky-400" />
                                            <span>Baca Rincian Dokumen</span>
                                        </button>
                                    </div>

                                    {/* 4 Zonasi Cards (Interactive Quick Access) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Zona Merah */}
                                        <button
                                            type="button"
                                            onClick={() => handleOpenZoneModal('merah')}
                                            className="p-3.5 rounded-2xl bg-gradient-to-br from-red-950/60 via-red-950/40 to-slate-950/70 border border-red-700/60 hover:border-red-500 hover:scale-[1.01] active:scale-[0.99] transition-all text-left group shadow-md cursor-pointer flex flex-col justify-between"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-3.5 h-3.5 rounded-full bg-red-500 mt-1 flex-shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.9)] group-hover:scale-110 transition-transform" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-xs font-bold text-red-300 group-hover:text-red-200">
                                                            1. Zona Tertutup (Merah)
                                                        </span>
                                                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                                                            Sangat Vital
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-red-200/80 mt-1 leading-relaxed">
                                                        Daerah/lokasi dinilai sangat vital berdasarkan penilaian risiko sangat tinggi dan ekstrem.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2.5 pt-2 border-t border-red-900/40 flex items-center justify-between text-[10px] font-bold text-red-400 group-hover:text-red-300">
                                                <span>Izin Pejabat Terkait / Penanggung Jawab Area</span>
                                                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                                                    Buka Aturan &rarr;
                                                </span>
                                            </div>
                                        </button>

                                        {/* Zona Kuning */}
                                        <button
                                            type="button"
                                            onClick={() => handleOpenZoneModal('kuning')}
                                            className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-amber-950/40 to-slate-950/70 border border-amber-700/60 hover:border-amber-500 hover:scale-[1.01] active:scale-[0.99] transition-all text-left group shadow-md cursor-pointer flex flex-col justify-between"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 mt-1 flex-shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.9)] group-hover:scale-110 transition-transform" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                                                            2. Zona Terlarang (Kuning)
                                                        </span>
                                                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                                            Lebih Vital
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-amber-200/80 mt-1 leading-relaxed">
                                                        Daerah/lokasi dinilai lebih vital berdasarkan penilaian risiko tinggi.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2.5 pt-2 border-t border-amber-900/40 flex items-center justify-between text-[10px] font-bold text-amber-400 group-hover:text-amber-300">
                                                <span>Izin Penanggung Jawab Area</span>
                                                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                                                    Buka Aturan &rarr;
                                                </span>
                                            </div>
                                        </button>

                                        {/* Zona Biru */}
                                        <button
                                            type="button"
                                            onClick={() => handleOpenZoneModal('biru')}
                                            className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-950/60 via-sky-950/40 to-slate-950/70 border border-sky-700/60 hover:border-sky-400 hover:scale-[1.01] active:scale-[0.99] transition-all text-left group shadow-md cursor-pointer flex flex-col justify-between"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-3.5 h-3.5 rounded-full bg-sky-400 mt-1 flex-shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.9)] group-hover:scale-110 transition-transform" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-xs font-bold text-sky-300 group-hover:text-sky-200">
                                                            3. Zona Terbatas (Biru)
                                                        </span>
                                                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                                            Tidak Terlalu Vital
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-sky-200/80 mt-1 leading-relaxed">
                                                        Daerah/lokasi dinilai tidak terlalu vital berdasarkan penilaian risiko moderat.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2.5 pt-2 border-t border-sky-900/40 flex items-center justify-between text-[10px] font-bold text-sky-400 group-hover:text-sky-300">
                                                <span>Akses Khusus / Izin Satuan Pengamanan</span>
                                                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                                                    Buka Aturan &rarr;
                                                </span>
                                            </div>
                                        </button>

                                        {/* Zona Hijau */}
                                        <button
                                            type="button"
                                            onClick={() => handleOpenZoneModal('hijau')}
                                            className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-emerald-950/40 to-slate-950/70 border border-emerald-700/60 hover:border-emerald-400 hover:scale-[1.01] active:scale-[0.99] transition-all text-left group shadow-md cursor-pointer flex flex-col justify-between"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.9)] group-hover:scale-110 transition-transform" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                                                            4. Zona Bebas Terbatas (Hijau)
                                                        </span>
                                                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                            Tidak Vital
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-emerald-200/80 mt-1 leading-relaxed">
                                                        Merupakan daerah/lokasi tertentu yang dinilai tidak vital berdasarkan penilaian risiko rendah.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2.5 pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300">
                                                <span>Akses Khusus / Izin Satuan Pengamanan</span>
                                                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                                                    Buka Aturan &rarr;
                                                </span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Persetujuan Checkbox */}
                                    <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-sky-950/80 border border-sky-700/60 cursor-pointer hover:bg-sky-900/50 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={inductionAgreed}
                                            onChange={(e) => {
                                                setInductionAgreed(e.target.checked);
                                                if (e.target.checked) setClientError(null);
                                            }}
                                            className="w-5 h-5 rounded-md border-sky-500 bg-sky-950 text-brand-500 focus:ring-brand-400 focus:ring-offset-0 mt-0.5 cursor-pointer flex-shrink-0"
                                        />
                                        <span className="text-xs text-sky-100 leading-snug">
                                            <span className="font-bold text-amber-300">Pernyataan Kepatuhan Tamu:</span> Saya telah membaca, memahami, dan bersedia mematuhi seluruh peraturan Security Induction PT PLN (Persero) UPT Manado serta aturan zonasi keamanan selama berada di lingkungan kantor/instalasi.
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full min-h-[52px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-base shadow-xl shadow-brand-500/20 ring-2 ring-brand-400/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                    <span>
                                        {processing
                                            ? 'Menyimpan & Menerbitkan E-Badge...'
                                            : `Kirim & Terbitkan E-Badge (${data.visitor_count} Tamu)`}
                                    </span>
                                </button>
                                <p className="text-center text-xs text-zinc-500 mt-2">
                                    Setiap nama dan goresan tanda tangan akan tertera pada E-Badge dan laporan resmi buku tamu.
                                </p>
                            </div>

                        </form>
                    </div>
                </main>
            </div>

            {/* Security Induction Interactive Modal Component */}
            <SecurityInductionModal
                isOpen={isInductionModalOpen}
                onClose={() => setIsInductionModalOpen(false)}
                onAgree={() => {
                    setInductionAgreed(true);
                    setClientError(null);
                }}
                initialZone={selectedZoneForModal}
                settingTitle={setting.security_induction_title}
                rawContent={setting.security_induction_content}
            />
        </>
    );
}
