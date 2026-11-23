import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { 
    Building2, 
    LayoutDashboard, 
    Layers, 
    Settings, 
    Monitor, 
    CheckCircle2, 
    AlertCircle, 
    Info 
} from 'lucide-react';
import { PageProps } from '@/types';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
            <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-zinc-900/95">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-8">
                            <div className="flex shrink-0 items-center">
                                <Link href={route('dashboard')} className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src="/images/Logo_PLN.png"
                                            alt="Logo PLN"
                                            className="h-8 w-auto object-contain"
                                        />
                                        <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700" />
                                        <img
                                            src="/images/Logo_UPT_Manado.png"
                                            alt="Logo UPT Manado"
                                            className="h-7 w-auto object-contain"
                                        />
                                    </div>
                                    <div className="hidden md:block">
                                        <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-white block leading-tight">
                                            PT PLN (Persero)
                                        </span>
                                        <span className="text-[10px] text-sky-600 dark:text-brand-400 font-bold block">
                                            UPT Manado • Buku Tamu Digital
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            <div className="hidden space-x-2 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
                                >
                                    <LayoutDashboard className="w-4 h-4 text-brand-500" />
                                    <span>Dasbor Pantauan</span>
                                </NavLink>

                                <NavLink
                                    href={route('admin.divisions.index')}
                                    active={route().current('admin.divisions.*')}
                                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
                                >
                                    <Layers className="w-4 h-4 text-emerald-500" />
                                    <span>Master Divisi</span>
                                </NavLink>

                                {user.role === 'admin' && (
                                    <NavLink
                                        href={route('admin.settings.index')}
                                        active={route().current('admin.settings.*')}
                                        className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
                                    >
                                        <Settings className="w-4 h-4 text-purple-500" />
                                        <span>CMS & Akun</span>
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* Right side controls */}
                        <div className="hidden sm:flex sm:items-center sm:gap-3">
                            <Link
                                href={route('guest.welcome')}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all"
                                title="Buka Tampilan Kiosk Lobi di Tab Baru"
                            >
                                <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Layar Kiosk Lobi</span>
                            </Link>

                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-brand-600/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xs">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="text-left">
                                                <span className="font-semibold block leading-tight">{user.name}</span>
                                                <span className="text-[10px] text-zinc-400 uppercase font-mono">{user.role}</span>
                                            </div>
                                            <svg
                                                className="h-3.5 w-3.5 text-zinc-400"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profil Saya
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Keluar (Logout)
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Hamburger for mobile */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile navigation */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden border-t border-zinc-200 dark:border-zinc-800'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2 px-4">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dasbor Pantauan
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('admin.divisions.index')}
                            active={route().current('admin.divisions.*')}
                        >
                            Master Divisi
                        </ResponsiveNavLink>
                        {user.role === 'admin' && (
                            <ResponsiveNavLink
                                href={route('admin.settings.index')}
                                active={route().current('admin.settings.*')}
                            >
                                CMS & Akun
                            </ResponsiveNavLink>
                        )}
                        <ResponsiveNavLink href={route('guest.welcome')}>
                            Layar Kiosk Lobi
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('profile.edit')}>
                            Profil Akun
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            method="post"
                            href={route('logout')}
                            as="button"
                        >
                            Keluar (Logout)
                        </ResponsiveNavLink>
                    </div>
                </div>
            </nav>

            {/* Flash Messages Alert */}
            {flash?.success && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-sm">
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                </div>
            )}
            {flash?.info && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-sm">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span>{flash.info}</span>
                    </div>
                </div>
            )}

            {header && (
                <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
