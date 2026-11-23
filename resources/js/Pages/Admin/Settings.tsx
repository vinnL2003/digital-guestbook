import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecurityInductionModal, { InductionZoneKey } from '@/Components/SecurityInductionModal';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps, SiteSetting, User } from '@/types';
import {
    Sliders,
    Users,
    Save,
    UserPlus,
    ShieldCheck,
    Trash2,
    Sparkles,
    Building2,
    Lock,
    Mail,
    CheckCircle2,
    RotateCcw,
    FileText,
    AlertTriangle,
    Eye,
    Shield
} from 'lucide-react';

interface SettingsProps {
    setting: SiteSetting;
    users: User[];
}

export default function Settings({ auth, setting, users }: PageProps<SettingsProps>) {
    const [activeTab, setActiveTab] = useState<'cms' | 'induction' | 'users'>('cms');
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewZone, setPreviewZone] = useState<InductionZoneKey>('merah');

    // CMS Form
    const cmsForm = useForm({
        organization_name: setting.organization_name,
        welcome_title: setting.welcome_title,
        welcome_subtitle: setting.welcome_subtitle || '',
        announcement_text: setting.announcement_text || '',
    });

    const handleCmsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        cmsForm.post(route('admin.settings.update'), {
            preserveScroll: true,
        });
    };

    // Induction Form
    const inductionForm = useForm({
        security_induction_title: setting.security_induction_title || 'Security Induction PT PLN (Persero) UPT Manado',
        security_induction_content: setting.security_induction_content || '',
        is_security_induction_active: setting.is_security_induction_active ?? true,
    });

    // Sync induction form when setting props update (e.g. after reset)
    useEffect(() => {
        inductionForm.setData({
            security_induction_title: setting.security_induction_title || 'Security Induction PT PLN (Persero) UPT Manado',
            security_induction_content: setting.security_induction_content || '',
            is_security_induction_active: setting.is_security_induction_active ?? true,
        });
    }, [setting.security_induction_title, setting.security_induction_content, setting.is_security_induction_active]);

    const handleInductionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        inductionForm.post(route('admin.settings.update'), {
            preserveScroll: true,
        });
    };

    const handleResetInduction = () => {
        if (confirm('Kembalikan isi teks Security Induction ke standar resmi PT PLN (Persero) UPT Manado (Sistem Manajemen Pengamanan)?')) {
            router.post(route('admin.settings.reset-induction'), {}, {
                preserveScroll: true,
            });
        }
    };

    // New User Form
    const userForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'operator' as 'operator' | 'admin',
    });

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        userForm.post(route('admin.users.store'), {
            onSuccess: () => userForm.reset(),
            preserveScroll: true,
        });
    };

    const handleToggleUser = (user: User) => {
        router.patch(route('admin.users.toggle', user.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDeleteUser = (user: User) => {
        if (confirm(`Hapus akun petugas ${user.name}?`)) {
            router.delete(route('admin.users.destroy', user.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                        Pengaturan Tampilan Publik (CMS) & Akun Petugas
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Kelola branding instansi, pengumuman lobi, dan hak akses pengguna.
                    </p>
                </div>
            }
        >
            <Head title="Pengaturan CMS & Akun - Buku Tamu Digital" />

            <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={() => setActiveTab('cms')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${activeTab === 'cms'
                                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                            }`}
                    >
                        <Sliders className="w-4 h-4" />
                        <span>Pengaturan Tampilan Depan & Lobi</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('induction')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${activeTab === 'induction'
                                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                            }`}
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Security Induction (K3 & Zonasi PLN)</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('users')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${activeTab === 'users'
                                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Kelola Akun Operator & Admin ({users.length})</span>
                    </button>
                </div>

                {/* Tab 1: CMS Settings */}
                {activeTab === 'cms' && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <form onSubmit={handleCmsSubmit} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                                    Nama Instansi / Kantor Pemerintahan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={cmsForm.data.organization_name}
                                    onChange={(e) => cmsForm.setData('organization_name', e.target.value)}
                                    placeholder="Contoh: Dinas Penanaman Modal & PTSP"
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                                    Judul Sambutan Halaman Depan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={cmsForm.data.welcome_title}
                                    onChange={(e) => cmsForm.setData('welcome_title', e.target.value)}
                                    placeholder="Contoh: Selamat Datang di Buku Tamu Digital"
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                                    Sub-Judul / Petunjuk Tamu Baru
                                </label>
                                <textarea
                                    rows={3}
                                    value={cmsForm.data.welcome_subtitle}
                                    onChange={(e) => cmsForm.setData('welcome_subtitle', e.target.value)}
                                    placeholder="Teks petunjuk singkat yang muncul di bawah judul utama."
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                                    Teks Pengumuman Lobi (Announcement Banner)
                                </label>
                                <input
                                    type="text"
                                    value={cmsForm.data.announcement_text}
                                    onChange={(e) => cmsForm.setData('announcement_text', e.target.value)}
                                    placeholder="Contoh: Jam pelayanan kunjungan tatap muka: 08.00 - 15.30 WIB"
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                />
                                <span className="text-[11px] text-zinc-400 mt-1 block">
                                    *Kosongkan bila tidak ingin menampilkan pita pengumuman di halaman depan.
                                </span>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={cmsForm.processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition-all"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Perubahan Tampilan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tab 2: Security Induction Settings */}
                {activeTab === 'induction' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                                        <span>Sistem Manajemen Pengamanan (SMP) • PT PLN (Persero) UPT Manado</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                        Pengaturan Teks & Ketentuan Security Induction
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Kelola teks pengamanan, 4 zonasi (Merah, Kuning, Biru, Hijau), dan kewajiban persetujuan tamu.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleResetInduction}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-all self-start sm:self-auto"
                                    title="Kembalikan ke template default Sistem Manajemen Pengamanan PLN UPT Manado"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reset ke Standar Asli PLN</span>
                                </button>
                            </div>

                            <form onSubmit={handleInductionSubmit} className="space-y-6 pt-6">
                                {/* Toggle Active / Inactive */}
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-start sm:items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <label htmlFor="induction-active-toggle" className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white cursor-pointer">
                                            Wajibkan Security Induction di Formulir Registrasi Tamu
                                        </label>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Jika diaktifkan, tamu wajib mencentang persetujuan Security Induction sebelum mengirim formulir registrasi.
                                        </p>
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                        <input
                                            id="induction-active-toggle"
                                            type="checkbox"
                                            checked={inductionForm.data.is_security_induction_active}
                                            onChange={(e) => inductionForm.setData('is_security_induction_active', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                    </label>
                                </div>

                                {/* Title Input */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                                        Judul Dokumen Security Induction <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={inductionForm.data.security_induction_title}
                                        onChange={(e) => inductionForm.setData('security_induction_title', e.target.value)}
                                        placeholder="Contoh: Security Induction PT PLN (Persero) UPT Manado"
                                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>

                                {/* Content Textarea */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                            Isi & Ketentuan Lengkap Security Induction <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[11px] text-zinc-400">
                                            Mendukung baris baru & penomoran teks
                                        </span>
                                    </div>
                                    <textarea
                                        rows={14}
                                        required
                                        value={inductionForm.data.security_induction_content}
                                        onChange={(e) => inductionForm.setData('security_induction_content', e.target.value)}
                                        placeholder="Tuliskan peraturan dan ketentuan zonasi pengamanan di sini..."
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-brand-500 leading-relaxed"
                                    />
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                                        *Teks ini akan ditampilkan secara lengkap kepada tamu di formulir registrasi dan jendela rincian Security Induction.
                                    </p>
                                </div>

                                <div className="pt-2 flex items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={inductionForm.processing}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Perubahan Security Induction</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Live Preview Card */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-brand-500" />
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                                        Pratinjau Zonasi Security Induction (Tampilan Tamu)
                                    </h4>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewZone('merah');
                                        setIsPreviewModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-600/10 hover:bg-brand-600/20 text-brand-600 dark:text-brand-400 border border-brand-500/30 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Tes Buka Pop-up Interaktif Tamu</span>
                                </button>
                            </div>

                            {/* 4 Zonasi Cards (Clickable) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Zona Merah */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewZone('merah');
                                        setIsPreviewModalOpen(true);
                                    }}
                                    className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 hover:border-rose-500 flex items-start gap-3 text-left transition-all group cursor-pointer"
                                >
                                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)] group-hover:scale-110 transition-transform" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                                                1. Zona Tertutup (Merah)
                                            </span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300">
                                                Sangat Vital
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-0.5 leading-relaxed">
                                            Risiko Sangat Tinggi dan Ekstrem. Wajib Working Permit resmi pimpinan & izin khusus pejabat terkait / penanggung jawab area.
                                        </p>
                                    </div>
                                </button>

                                {/* Zona Kuning */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewZone('kuning');
                                        setIsPreviewModalOpen(true);
                                    }}
                                    className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 hover:border-amber-500 flex items-start gap-3 text-left transition-all group cursor-pointer"
                                >
                                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-transform" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                                                2. Zona Terlarang (Kuning)
                                            </span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                                Lebih Vital
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-relaxed">
                                            Risiko Tinggi. Masuk zona wajib memperoleh izin dari penanggung jawab area.
                                        </p>
                                    </div>
                                </button>

                                {/* Zona Biru */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewZone('biru');
                                        setIsPreviewModalOpen(true);
                                    }}
                                    className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 hover:border-sky-500 flex items-start gap-3 text-left transition-all group cursor-pointer"
                                >
                                    <div className="w-3.5 h-3.5 rounded-full bg-sky-500 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(14,165,233,0.6)] group-hover:scale-110 transition-transform" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-sky-800 dark:text-sky-300">
                                                3. Zona Terbatas (Biru)
                                            </span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-700 dark:text-sky-300">
                                                Tidak Terlalu Vital
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-sky-700/80 dark:text-sky-400/80 mt-0.5 leading-relaxed">
                                            Risiko Moderat. Masuk zona wajib memperoleh akses khusus atau izin dari Satuan Pengamanan.
                                        </p>
                                    </div>
                                </button>

                                {/* Zona Hijau */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewZone('hijau');
                                        setIsPreviewModalOpen(true);
                                    }}
                                    className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-500 flex items-start gap-3 text-left transition-all group cursor-pointer"
                                >
                                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-transform" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                                4. Zona Bebas Terbatas (Hijau)
                                            </span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                                Tidak Vital
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 leading-relaxed">
                                            Risiko Rendah. Masuk zona wajib memperoleh akses khusus atau izin dari Satuan Pengamanan.
                                        </p>
                                    </div>
                                </button>
                            </div>

                            {/* Text preview */}
                            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-line max-h-60 overflow-y-auto font-sans leading-relaxed">
                                <div className="font-bold text-zinc-900 dark:text-white mb-2">
                                    {inductionForm.data.security_induction_title}
                                </div>
                                {inductionForm.data.security_induction_content}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 3: User Accounts */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        {/* Add User Card */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-brand-500" />
                                <span>Tambah Akun Petugas Baru</span>
                            </h3>

                            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                        Nama Lengkap <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={userForm.data.name}
                                        onChange={(e) => userForm.setData('name', e.target.value)}
                                        placeholder="Nama petugas"
                                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                        Email Login <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={userForm.data.email}
                                        onChange={(e) => userForm.setData('email', e.target.value)}
                                        placeholder="petugas@kantor.com"
                                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                        Kata Sandi <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={userForm.data.password}
                                        onChange={(e) => userForm.setData('password', e.target.value)}
                                        placeholder="Min. 8 karakter"
                                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                                        Peran (Role) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={userForm.data.role}
                                            onChange={(e) => userForm.setData('role', e.target.value as any)}
                                            className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white"
                                        >
                                            <option value="operator">Operator (Resepsionis)</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                        <button
                                            type="submit"
                                            disabled={userForm.processing}
                                            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex-shrink-0"
                                        >
                                            Tambah
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* User List Table */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-[11px] uppercase font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Nama Petugas</th>
                                        <th className="py-3 px-4">Email Login</th>
                                        <th className="py-3 px-4">Peran (Role)</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                            <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">
                                                {u.name} {u.id === auth.user.id && <span className="text-[10px] text-brand-600 font-bold ml-1">(Anda)</span>}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                                                {u.email}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${u.is_active ? 'text-emerald-600' : 'text-zinc-400'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                                                    {u.is_active ? 'Aktif' : 'Non-Aktif'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-2">
                                                {u.id !== auth.user.id && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleUser(u)}
                                                            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                                        >
                                                            {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(u)}
                                                            className="text-xs text-rose-500 hover:text-rose-700"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* Admin Live Preview Modal */}
            <SecurityInductionModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                initialZone={previewZone}
                settingTitle={inductionForm.data.security_induction_title}
                rawContent={inductionForm.data.security_induction_content}
            />
        </AuthenticatedLayout>
    );
}
