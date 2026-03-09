"use client"
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AnalyticsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View detailed performance metrics.
                    </p>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-card shadow-sm p-6 h-96 flex items-center justify-center text-muted-foreground">
                    Analytics dashboard will be built here
                </div>
            </div>
        </DashboardLayout>
    );
}
