import React, { useState, FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    LogIn, 
    Zap, 
    ShieldCheck, 
    ArrowLeft, 
    CheckCircle2, 
    Loader2
} from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk Dasbor Petugas & Admin - PT PLN (Persero) UPT Manado" />

            {/* Header Content */}
            <div className="mb-6 text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-[11px] font-bold text-sky-300">
                    <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Portal Masuk Resmi Petugas & Admin</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Masuk ke Sistem Buku Tamu
                </h1>
                <p className="text-xs text-sky-200/70">
                    Silakan masukkan email dan kata sandi Anda.
                </p>
            </div>

            {/* Status Alert */}
            {status && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{status}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4" autoComplete="off">
                {/* Email Input */}
                <div className="space-y-1.5">
                    <label 
                        htmlFor="email" 
                        className="block text-xs font-bold uppercase tracking-wider text-sky-200"
                    >
                        Email <span className="text-rose-400">*</span>
                    </label>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-400/80">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            autoComplete="off"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            style={{ colorScheme: 'dark' }}
                            className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-[#040e1a] border border-sky-800/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 text-white font-medium placeholder-sky-400/40 text-base sm:text-sm transition-all shadow-inner"
                        />
                    </div>

                    {errors.email && (
                        <p className="text-xs font-medium text-rose-400 mt-1 pl-1">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label 
                            htmlFor="password" 
                            className="block text-xs font-bold uppercase tracking-wider text-sky-200"
                        >
                            Kata Sandi <span className="text-rose-400">*</span>
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-sky-400 hover:text-sky-300 font-medium hover:underline transition-colors"
                            >
                                Lupa sandi?
                            </Link>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-400/80">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            style={{ colorScheme: 'dark' }}
                            className="w-full pl-10 pr-11 py-3 min-h-[48px] rounded-xl bg-[#040e1a] border border-sky-800/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 text-white font-medium placeholder-sky-400/40 text-base sm:text-sm transition-all shadow-inner"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sky-400/70 hover:text-white transition-colors"
                            title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="text-xs font-medium text-rose-400 mt-1 pl-1">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Remember Me */}
                <div className="pt-1 flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded border-sky-700 bg-[#040e1a] text-sky-500 focus:ring-sky-400/30 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-xs text-sky-200/90 font-medium">
                            Ingat sesi saya di perangkat ini
                        </span>
                    </label>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full min-h-[50px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0099D8] via-sky-500 to-[#002B49] hover:from-sky-400 hover:to-sky-600 text-white font-black text-sm tracking-wide shadow-xl shadow-sky-500/25 ring-2 ring-sky-400/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                <span>Memverifikasi Kredensial...</span>
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4 text-white" />
                                <span>Masuk ke Dasbor Sistem</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Quick Navigation Back to Welcome */}
                <div className="pt-3 border-t border-sky-900/40 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs text-sky-300/80 hover:text-white font-medium transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Kembali ke Halaman Registrasi Tamu</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
