"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Send,
    Users,
    UserRoundCheck,
    Bot,
    Settings,
    Zap,
} from 'lucide-react';

const WORKSPACE_NAV = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/campaigns', icon: Send },
    { name: 'Templates', href: '/templates', icon: FileText },
];

const AUDIENCE_NAV = [
    { name: 'Recipients', href: '/recipients', icon: Users },
    { name: 'Groups', href: '/groups', icon: UserRoundCheck },
];

const SYSTEM_NAV = [
    { name: 'AI Assistant', href: '/ai', icon: Bot },
    { name: 'Settings', href: '/settings', icon: Settings },
];

type NavItem = { name: string; href: string; icon: React.ElementType };

export function Sidebar() {
    const pathname = usePathname();

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
            <Link
                href={item.href}
                className={`
                    group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium
                    transition-colors duration-150
                    ${isActive
                        ? 'text-white bg-white/[0.09]'
                        : 'text-white/45 hover:text-white/80 hover:bg-white/[0.05]'
                    }
                `}
            >
                {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[20px] bg-indigo-400 rounded-r-full" />
                )}
                <Icon
                    className={`flex-shrink-0 h-[17px] w-[17px] transition-colors duration-150
                        ${isActive ? 'text-indigo-400' : 'text-white/35 group-hover:text-white/70'}`}
                />
                {item.name}
            </Link>
        );
    };

    const NavSection = ({ label, items }: { label: string; items: NavItem[] }) => (
        <div className="space-y-0.5">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/20">
                {label}
            </p>
            {items.map((item) => <NavLink key={item.href} item={item} />)}
        </div>
    );

    return (
        <div className="flex h-full w-[232px] flex-col bg-[#07101E] border-r border-white/[0.07] flex-shrink-0">

            {/* Brand */}
            <div className="flex h-[60px] items-center flex-shrink-0 px-5 border-b border-white/[0.07]">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-900/60 flex-shrink-0">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="leading-none">
                        <p className="text-[15px] font-semibold text-white tracking-tight">CCIRP</p>
                        <p className="text-[10px] text-white/30 font-medium tracking-widest uppercase mt-0.5">Platform</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-1 flex-col overflow-y-auto scrollbar-none px-3 py-5 gap-6">
                <NavSection label="Workspace" items={WORKSPACE_NAV} />
                <NavSection label="Audience" items={AUDIENCE_NAV} />
                <NavSection label="System" items={SYSTEM_NAV} />
            </div>

            {/* Footer */}
            <div className="px-3 py-3 border-t border-white/[0.07]">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer group">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-md">
                        U
                    </div>
                    <p className="text-[12px] font-medium text-white/40 group-hover:text-white/70 transition-colors flex-1 min-w-0 truncate">My Account</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                </div>
            </div>
        </div>
    );
}
