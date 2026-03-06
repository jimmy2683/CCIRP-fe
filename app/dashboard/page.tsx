"use client";

import React from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { FileText, Navigation, Send, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

const messageData = [
    { name: 'Mon', sent: 4000, opened: 2400 },
    { name: 'Tue', sent: 3000, opened: 1398 },
    { name: 'Wed', sent: 2000, opened: 9800 },
    { name: 'Thu', sent: 2780, opened: 3908 },
    { name: 'Fri', sent: 1890, opened: 4800 },
    { name: 'Sat', sent: 2390, opened: 3800 },
    { name: 'Sun', sent: 3490, opened: 4300 },
];

const campaignTypeData = [
    { name: 'Newsletters', openRate: 24, clickRate: 12 },
    { name: 'Promotions', openRate: 18, clickRate: 8 },
    { name: 'Announcements', openRate: 35, clickRate: 15 },
    { name: 'Reminders', openRate: 45, clickRate: 22 },
];

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Welcome back. Here is what is happening with your campaigns today.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Campaigns"
                        value="124"
                        icon={Send}
                        trend={{ value: 12, isPositive: true }}
                        description="Active and completed"
                    />
                    <StatCard
                        title="Messages Sent"
                        value="45.2K"
                        icon={Navigation}
                        trend={{ value: 8, isPositive: true }}
                        description="Across all channels"
                    />
                    <StatCard
                        title="Open Rate"
                        value="24.8%"
                        icon={Users}
                        trend={{ value: 2, isPositive: false }}
                        description="Average open rate"
                    />
                    <StatCard
                        title="Active Templates"
                        value="18"
                        icon={FileText}
                        description="Ready to use"
                    />
                </div>

                {/* Charts Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">

                    {/* Messages Volume Chart */}
                    <div className="rounded-2xl border border-border bg-card backdrop-blur-md shadow-xl p-6 w-full h-[400px] flex flex-col">
                        <h3 className="text-lg font-semibold text-foreground mb-6">Message Volume (Last 7 Days)</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={messageData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="sent" name="Sent" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5' }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="opened" name="Opened" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Performance by Type Chart */}
                    <div className="rounded-2xl border border-border bg-card backdrop-blur-md shadow-xl p-6 w-full h-[400px] flex flex-col">
                        <h3 className="text-lg font-semibold text-foreground mb-6">Performance by Campaign Type (%)</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={campaignTypeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
                                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="openRate" name="Open Rate" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="clickRate" name="Click Rate" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
