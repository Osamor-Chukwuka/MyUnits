'use client';

import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { Zap, Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabaseBrowser } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth-actions';

type NavItem = { label: string; href: string };

export default function AppNavbar({ brand = 'MyUnits', }: { brand?: string; }) {

    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const navItems: NavItem[] = useMemo(
        () => [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Appliance Cost', href: '/appliance-calculator' },
            { label: 'Profile', href: '/profile' },
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
        <header className="top-0 z-40 sticky bg-card border-border border-b">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
                <div className="flex justify-between items-center">
                    {/* Brand */}
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-md focus:outline-none"
                    >
                        <Zap className="w-7 h-7 text-primary" />
                        <span className="font-bold text-foreground text-xl sm:text-2xl">
                            {brand}
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={[
                                    'text-sm font-medium transition-colors',
                                    isActive(item.href)
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground',
                                ].join(' ')}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <button
                            onClick={handleLogout}
                            className="font-medium text-muted-foreground hover:text-foreground text-sm transition-colors cursor-pointer"
                        >
                            Logout
                        </button>
                    </nav>

                    {/* Mobile menu button */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={open}
                    >
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>

                {/* Mobile nav panel */}
                {open && (
                    <div className="md:hidden mt-4 pt-4 border-border border-t">
                        <nav className="flex flex-col gap-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={[
                                        'py-2 text-sm font-medium transition-colors',
                                        isActive(item.href)
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground',
                                    ].join(' ')}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <button
                                onClick={() => {
                                    setOpen(false);
                                    handleLogout();
                                }}
                                className="py-2 font-medium text-muted-foreground hover:text-foreground text-sm text-left transition-colors"
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
