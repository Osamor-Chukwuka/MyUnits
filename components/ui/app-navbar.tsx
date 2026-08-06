'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Menu, X, ChevronDown, History, UserRound, Gauge } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logoutAction } from '@/app/actions/auth-actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type NavItem = { label: string; href: string };

export default function AppNavbar({ brand = 'myUnits', userFirstName}: { brand?: string; userFirstName?: string }) {

    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const navItems: NavItem[] = useMemo(
        () => [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Appliance Cost', href: '/appliance-calculator' },
            { label: 'History', href: '/history' },
        ],
        []
    );

    //handle logout
    const handleLogout = async () => {
        console.log('Logging out...');

        //call logout action
        const result = await logoutAction();

        if (!result.ok) {
            toast.error(result.message || 'Logout failed. Please try again.');
            return;
        }

        toast.success('Logged out successfully');
        router.replace('/auth/login');
        router.refresh();
    }

    const isActive = (href: string) =>
        pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

    return (
        <header className="sticky top-0 z-40 overflow-visible px-3 pt-3 sm:px-5">
            <div className="mx-auto max-w-7xl rounded-[1.4rem] border border-white/55 bg-[#fff9ef]/72 px-3 py-3 shadow-[0_18px_60px_rgba(16,42,42,0.12)] backdrop-blur-2xl sm:px-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Brand */}
                    <Link
                        href="/dashboard"
                        className="flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                    >
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-accent shadow-[0_16px_34px_rgba(16,42,42,0.18)]">
                            <Zap className="size-5" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-lg font-bold leading-none text-foreground sm:text-xl">
                                {brand}
                            </span>
                            <span className="mt-1 hidden text-xs font-medium text-muted-foreground sm:block">
                                Power you can trace
                            </span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden items-center gap-2 rounded-2xl border border-primary/10 bg-white/40 p-1 md:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={[
                                    'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                                    isActive(item.href)
                                        ? 'bg-primary text-primary-foreground shadow-[0_10px_26px_rgba(16,42,42,0.16)]'
                                        : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
                                ].join(' ')}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* profile icon and name with dropdown */}
                    <div className="relative hidden items-center md:flex">
                        <button
                            type="button"
                            onClick={() => setProfileOpen((v) => !v)}
                            className="flex min-h-11 items-center gap-2 rounded-2xl border border-primary/10 bg-white/45 px-2 py-1 shadow-sm transition hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer"
                            aria-expanded={profileOpen}
                        >
                            <Avatar className="size-9">
                                <AvatarFallback className="bg-accent text-primary font-bold">
                                    {userFirstName ? userFirstName.charAt(0).toUpperCase() : ''}
                                </AvatarFallback>
                            </Avatar>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 top-full z-50 mt-3 w-48 rounded-2xl border border-primary/10 bg-[#fff9ef]/95 p-2 shadow-[0_22px_70px_rgba(16,42,42,0.15)] backdrop-blur-2xl">
                                <Link
                                    href="/history"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                                >
                                    <History className="size-4" />
                                    History
                                </Link>
                                <Link
                                    href="/profile"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                                >
                                    <UserRound className="size-4" />
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        setProfileOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-muted-foreground hover:bg-secondary/70 hover:text-foreground cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="md:hidden bg-white/45"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={open}
                    >
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>

                {/* Mobile nav panel */}
                {open && (
                    <div className="mt-3 rounded-2xl border border-primary/10 bg-white/45 p-4 shadow-inner md:hidden">
                        {/* mobile profile preview */}
                        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-secondary/55 p-3">
                            <Avatar className="size-10">
                                <AvatarFallback className="bg-accent text-primary font-bold">
                                    {userFirstName ? userFirstName.charAt(0).toUpperCase() : ''}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{userFirstName || 'myUnits user'}</p>
                                <p className="text-xs text-muted-foreground">Meters, payments, history</p>
                            </div>
                        </div>
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={[
                                        'flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition-colors',
                                        isActive(item.href)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                                    ].join(' ')}
                                >
                                    <Gauge className="mr-2 size-4" />
                                    {item.label}
                                </Link>
                            ))}

                            <Link
                                href="/profile"
                                onClick={() => setOpen(false)}
                                className={[
                                    'flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition-colors',
                                    isActive('/profile')
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                                ].join(' ')}
                            >
                                <UserRound className="mr-2 size-4" />
                                Profile
                            </Link>

                            <button
                                onClick={() => {
                                    setOpen(false);
                                    handleLogout();
                                }}
                                className="flex min-h-11 items-center rounded-xl px-3 text-left text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                            >
                                Logout
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
