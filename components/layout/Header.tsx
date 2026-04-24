"use client"
import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

const PAGE_META: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/campaigns': 'Campaigns',
    '/campaigns/new': 'New Campaign',
    '/campaigns/create': 'Create Campaign',
    '/templates': 'Templates',
    '/templates/new': 'New Template',
    '/recipients': 'Recipients',
    '/groups': 'Groups',
    '/ai': 'AI Assistant',
    '/settings': 'Settings',
};

export function Header() {
    const { logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const pageLabel = useMemo(() => {
        if (!pathname) return 'Dashboard';
        if (PAGE_META[pathname]) return PAGE_META[pathname];
        for (const [key, label] of Object.entries(PAGE_META)) {
            if (pathname.startsWith(key + '/')) return label;
        }
        return 'Overview';
    }, [pathname]);

    const initials = useMemo(() => {
        const name = user?.full_name;
        if (!name) return user?.email?.charAt(0)?.toUpperCase() ?? 'U';
        return name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }, [user]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!isMenuOpen) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-user-menu]')) setIsMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isMenuOpen]);

    return (
        <header className="bg-card/90 backdrop-blur-xl border-b border-border/60 sticky top-0 z-30 flex-shrink-0">
            <div className="flex h-[60px] items-center justify-between px-6">

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium text-muted-foreground">CCIRP</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                    <span className="text-[13px] font-semibold text-foreground">{pageLabel}</span>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">

                    {/* User menu */}
                    <div className="relative" data-user-menu>
                        <button
                            type="button"
                            className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg hover:bg-muted/60 transition-all duration-150 cursor-pointer"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-[10px] font-bold shadow-sm flex-shrink-0">
                                {initials}
                            </div>
                            <span className="hidden md:block text-[12px] font-medium text-foreground max-w-[110px] truncate">
                                {user?.full_name || user?.email || 'User'}
                            </span>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-52 origin-top-right rounded-xl bg-card border border-border shadow-xl shadow-black/8 overflow-hidden z-50 animate-scale-in">
                                <div className="px-4 py-3 border-b border-border/60 bg-muted/30">
                                    <p className="text-[13px] font-semibold text-foreground truncate">
                                        {user?.full_name || 'User'}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                        {user?.email}
                                    </p>
                                </div>
                                <div className="py-1.5">
                                    <button
                                        onClick={() => { setIsMenuOpen(false); logout(); }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors font-medium cursor-pointer"
                                    >
                                        <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
