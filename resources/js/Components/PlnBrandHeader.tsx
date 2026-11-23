import React from 'react';

interface PlnBrandHeaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showTitle?: boolean;
    subtitle?: string;
    variant?: 'dark' | 'light';
    className?: string;
    direction?: 'row' | 'col';
}

export default function PlnBrandHeader({
    size = 'md',
    showTitle = true,
    subtitle = 'Unit Pelaksana Transmisi Manado',
    variant = 'dark',
    className = '',
    direction = 'row',
}: PlnBrandHeaderProps) {
    const isLight = variant === 'light';

    const logoSizes = {
        sm: { pln: 'h-7', upt: 'h-6' },
        md: { pln: 'h-9', upt: 'h-8' },
        lg: { pln: 'h-12', upt: 'h-11' },
        xl: { pln: 'h-16', upt: 'h-14' },
    };

    const textSizes = {
        sm: { title: 'text-xs', sub: 'text-[10px]' },
        md: { title: 'text-sm sm:text-base', sub: 'text-xs' },
        lg: { title: 'text-base sm:text-lg', sub: 'text-xs sm:text-sm' },
        xl: { title: 'text-xl sm:text-2xl', sub: 'text-sm sm:text-base' },
    };

    return (
        <div className={`flex ${direction === 'col' ? 'flex-col items-center text-center' : 'items-center'} gap-3 ${className}`}>
            {/* Logos side-by-side */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <img
                    src="/images/Logo_PLN.png"
                    alt="Logo PT PLN (Persero)"
                    className={`${logoSizes[size].pln} w-auto object-contain transition-transform duration-200 hover:scale-105`}
                />
                <div
                    className={`h-6 sm:h-7 w-[1.5px] ${
                        isLight ? 'bg-zinc-300' : 'bg-zinc-700/80'
                    }`}
                />
                <img
                    src="/images/Logo_UPT_Manado.png"
                    alt="Logo PLN UPT Manado"
                    className={`${logoSizes[size].upt} w-auto object-contain transition-transform duration-200 hover:scale-105`}
                />
            </div>

            {/* Optional Typography */}
            {showTitle && (
                <div className={direction === 'col' ? 'mt-1' : ''}>
                    <h2
                        className={`font-black tracking-tight leading-tight ${
                            textSizes[size].title
                        } ${isLight ? 'text-zinc-900' : 'text-white'}`}
                    >
                        PT PLN (Persero)
                    </h2>
                    <p
                        className={`font-semibold tracking-wide ${
                            textSizes[size].sub
                        } ${
                            isLight
                                ? 'text-sky-700'
                                : 'text-brand-400 font-medium'
                        }`}
                    >
                        {subtitle}
                    </p>
                </div>
            )}
        </div>
    );
}
