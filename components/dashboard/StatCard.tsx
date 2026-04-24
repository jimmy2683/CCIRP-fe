"use client"
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    description?: string;
    accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
}

const ACCENT_MAP = {
    indigo: {
        iconBg: 'bg-indigo-500/10',
        iconText: 'text-indigo-500',
        border: 'border-indigo-500/20',
    },
    emerald: {
        iconBg: 'bg-emerald-500/10',
        iconText: 'text-emerald-500',
        border: 'border-emerald-500/20',
    },
    amber: {
        iconBg: 'bg-amber-500/10',
        iconText: 'text-amber-500',
        border: 'border-amber-500/20',
    },
    rose: {
        iconBg: 'bg-rose-500/10',
        iconText: 'text-rose-500',
        border: 'border-rose-500/20',
    },
    sky: {
        iconBg: 'bg-sky-500/10',
        iconText: 'text-sky-500',
        border: 'border-sky-500/20',
    },
};

export function StatCard({ title, value, icon: Icon, trend, description, accentColor = 'indigo' }: StatCardProps) {
    const accent = ACCENT_MAP[accentColor];

    return (
        <div className="group relative bg-card rounded-2xl border border-border/60 p-6 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 cursor-default overflow-hidden">
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] ${accent.iconBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="flex items-start justify-between mb-4">
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">{title}</p>
                <div className={`p-2.5 rounded-xl ${accent.iconBg} ${accent.border} border`}>
                    <Icon className={`w-4 h-4 ${accent.iconText}`} />
                </div>
            </div>

            <div className="flex items-baseline gap-2.5">
                <p className="text-[28px] font-bold text-foreground leading-none tracking-tight">{value}</p>
                {trend && (
                    <span className={`flex items-center gap-0.5 text-[12px] font-semibold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend.isPositive
                            ? <TrendingUp className="w-3.5 h-3.5" />
                            : <TrendingDown className="w-3.5 h-3.5" />
                        }
                        {Math.abs(trend.value)}%
                    </span>
                )}
            </div>

            {description && (
                <p className="mt-2 text-[12px] text-muted-foreground font-medium">{description}</p>
            )}
        </div>
    );
}
