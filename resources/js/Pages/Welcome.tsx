import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps, SiteSetting } from '@/types';
import { 
    PenTool, 
    ArrowRight, 
    LogIn, 
    LayoutDashboard,
    Zap,
    ShieldCheck
} from 'lucide-react';
import { GlassFold } from '@/components/ui/glass-fold';
import PlnBrandHeader from '@/Components/PlnBrandHeader';

interface WelcomeProps {
    setting: SiteSetting;
}

export default function Welcome({ auth, setting }: PageProps<WelcomeProps>) {
    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentDate, setCurrentDate] = useState<string>('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('id-ID', {
                timeZone: 'Asia/Makassar',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }) + ' WITA');
            setCurrentDate(now.toLocaleDateString('id-ID', {
                timeZone: 'Asia/Makassar',
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title={`Selamat Datang - PT PLN (Persero) UPT Manado`} />

            <div className="min-h-screen bg-[#061423] text-zinc-100 flex flex-col relative overflow-hidden selection:bg-brand-500 selection:text-white">
                {/* 21st.dev GlassFold WebGL animated gradient shader with PLN Corporate Colors */}
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                    <GlassFold 
                        className="w-full h-full"
                        speed={0.25}
                        scale={1.2}
                        color1="#0099D8" // PLN Electric Cyan
                        color2="#071526" // PLN Corporate Navy
                        color3="#FFD500" // PLN Energy Lightning Gold
                    />
                </div>

                {/* Modern Dot Grid Background Pattern */}
                <div 
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }}
                />

                {/* Soft ambient glowing electrical orbs */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-sky-500/15 blur-[160px] pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
                <div className="absolute top-10 left-10 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

                {/* Top Navigation Bar */}
                <header className="relative z-10 border-b border-sky-900/40 bg-[#061423]/80 backdrop-blur-md px-4 sm:px-8 lg:px-12 py-3.5">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        {/* Dual Logo (PLN & UPT Manado) with Organization Name */}
                        <PlnBrandHeader
                            size="md"
                            showTitle={true}
                            subtitle="Unit Pelaksana Transmisi Manado"
                            variant="dark"
                        />

                        {/* Live Clock & Action */}
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="hidden sm:flex flex-col items-end border-r border-sky-900/60 pr-5 text-right">
                                <span className="text-sm font-bold tracking-wider text-sky-200 tabular-nums font-mono flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    {currentTime || '00:00:00 WITA'}
                                </span>
                                <span className="text-[11px] text-zinc-400">
                                    {currentDate}
                                </span>
                            </div>

                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-950/80 hover:bg-sky-900/90 text-sky-200 border border-sky-700/60 transition-all hover:scale-[1.02] shadow-sm"
                                >
                                    <LayoutDashboard className="w-4 h-4 text-brand-400" />
                                    <span>Buka Dasbor</span>
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-sky-200 hover:text-white bg-sky-950/60 hover:bg-sky-900/70 border border-sky-800/60 transition-all"
                                >
                                    <LogIn className="w-4 h-4 text-brand-400" />
                                    <span>Masuk Petugas</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Hero Section: Focused, Clean & Authentic PLN UPT Manado Theme */}
                <main className="relative z-10 flex-1 flex items-center justify-center p-6 md:p-12">
                    <div className="max-w-2xl w-full text-center space-y-8 my-auto">
                        
                        {/* PLN Badge Callout */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-sm shadow-sm">
                            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span>PT PLN (Persero) • Unit Pelaksana Transmisi Manado</span>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-4">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                                {setting.welcome_title || 'Buku Tamu Digital PT PLN (Persero) UPT Manado'}
                            </h2>
                            <p className="text-base sm:text-lg text-sky-100/80 max-w-lg mx-auto leading-relaxed font-normal">
                                {setting.welcome_subtitle || 'Selamat datang di Kantor PT PLN (Persero) Unit Pelaksana Transmisi Manado. Silakan lakukan pencatatan kehadiran kunjungan Anda dengan menekan tombol di bawah ini.'}
                            </p>
                        </div>

                        {/* Prominent PLN Check-In CTA Button */}
                        <div className="pt-2 flex flex-col items-center justify-center">
                            <Link
                                href={route('guest.check-in')}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3.5 px-10 py-5 rounded-2xl bg-gradient-to-r from-sky-600 via-brand-500 to-sky-600 hover:from-sky-500 hover:to-cyan-400 text-white font-extrabold text-lg sm:text-xl shadow-2xl shadow-sky-500/30 ring-4 ring-sky-400/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                            >
                                <PenTool className="w-6 h-6 text-amber-300" />
                                <span>Isi Buku Tamu (Check-In)</span>
                                <ArrowRight className="w-6 h-6 text-white/80" />
                            </Link>
                        </div>

                        {/* Security & Integrity Note */}
                        <div className="flex items-center justify-center gap-2 text-xs text-sky-300/70 pt-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Pencatatan Tamu Resmi & Terverifikasi Tanda Tangan Digital</span>
                        </div>

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
