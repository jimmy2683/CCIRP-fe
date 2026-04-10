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
    BarChart3,
    Bot,
    Settings
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Campaigns', href: '/campaigns', icon: Send },
    { name: 'Recipients', href: '/recipients', icon: Users },
    { name: 'Groups', href: '/groups', icon: UserRoundCheck },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Assistant', href: '/ai', icon: Bot },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r border-border">
            <div className="flex h-16 items-center flex-shrink-0 px-6 border-b border-border">
                <div className="flex items-center gap-2 text-primary">
                    <Send className="h-6 w-6" />
                    <span className="text-xl font-bold tracking-tight">CCIRP</span>
                </div>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
                <nav className="flex-1 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all
                  ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                                    }
                `}
                            >
                                <item.icon
                                    className={`flex-shrink-0 mr-3 h-5 w-5 transition-colors
                    ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                  `}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
