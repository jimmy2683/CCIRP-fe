"use client"
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Security & Preferences</h1>
                    <p className="mt-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        System Configuration • Node v1.0.4
                    </p>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-card shadow-2xl p-12 h-96 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 border border-primary/20">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Configuration Workbench</h3>
                        <p className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-loose max-w-xs">
                            Individual preference modules and credential management tools are being synchronized.
                        </p>
                    </div>
                    <button className="cursor-not-allowed mt-4 px-6 py-2 bg-muted text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest border border-border opacity-50">
                        Module Locked
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
