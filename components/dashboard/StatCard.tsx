"use client"
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    description?: string;
}

export function StatCard({ title, value, icon: Icon, trend, description }: StatCardProps) {
    return (
        <div className="bg-card backdrop-blur-md rounded-xl border border-border p-6 shadow-xl flex flex-col hover:bg-accent/50 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <p className="text-3xl font-semibold text-foreground">{value}</p>
                {trend && (
                    <span className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                    </span>
                )}
            </div>
            {description && (
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
}
