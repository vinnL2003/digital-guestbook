import PlnBrandHeader from '@/Components/PlnBrandHeader';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#061423] py-10 selection:bg-brand-500 selection:text-white px-4 relative overflow-hidden">
            {/* Dot Pattern Background */}
            <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Ambient Lighting Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-sky-500/15 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-6 text-center">
                    <Link href="/" className="inline-block hover:scale-[1.02] transition-transform">
                        <PlnBrandHeader
                            size="lg"
                            showTitle={true}
                            subtitle="Unit Pelaksana Transmisi Manado"
                            variant="dark"
                            direction="col"
                        />
                    </Link>
                </div>

                <div className="w-full bg-[#07192d]/80 border border-sky-500/30 p-6 sm:p-8 shadow-2xl shadow-sky-950/70 rounded-3xl backdrop-blur-xl text-zinc-100">
                    {children}
                </div>

                <p className="mt-6 text-center text-xs text-sky-400/60">
                    © {new Date().getFullYear()} PT PLN (Persero) UPT Manado • Portal Internal
                </p>
            </div>
        </div>
    );
}
