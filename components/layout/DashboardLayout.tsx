"use client"
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="px-6 lg:px-8 py-7 max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
