"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { api } from '@/libs/api';
import {
    Send, Eye, MousePointerClick, AlertTriangle, TrendingUp, Users,
    Loader2, BarChart3, Activity
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Fallback mock data when backend is unavailable
const fallbackTrendData = [
    { date: 'Mar 01', sent: 1200, delivered: 1180, opened: 530 },
    { date: 'Mar 05', sent: 980, delivered: 960, opened: 420 },
    { date: 'Mar 10', sent: 1500, delivered: 1470, opened: 735 },
    { date: 'Mar 15', sent: 2100, delivered: 2060, opened: 924 },
    { date: 'Mar 20', sent: 1800, delivered: 1760, opened: 810 },
    { date: 'Mar 25', sent: 2400, delivered: 2350, opened: 1128 },
    { date: 'Mar 30', sent: 1950, delivered: 1910, opened: 880 },
];

const fallbackCampaignPerformance = [
    { name: 'Q1 Newsletter', openRate: 45, clickRate: 12 },
    { name: 'Webinar Invite', openRate: 62, clickRate: 28 },
    { name: 'Welcome Series', openRate: 68, clickRate: 34 },
    { name: 'Re-engagement', openRate: 22, clickRate: 8 },
    { name: 'Holiday Promo', openRate: 38, clickRate: 15 },
];

const fallbackRecentCampaigns = [
    { id: '1', name: 'Q1 Product Update', status: 'Sent', sent: 1250, openRate: 45.2, clickRate: 12.1, date: '2026-03-01' },
    { id: '2', name: 'Enterprise Webinar', status: 'Sent', sent: 850, openRate: 62.0, clickRate: 28.3, date: '2026-03-10' },
    { id: '3', name: 'Welcome Series', status: 'Active', sent: 342, openRate: 68.5, clickRate: 34.0, date: '2026-03-15' },
    { id: '4', name: 'Re-engagement', status: 'Sent', sent: 4500, openRate: 22.0, clickRate: 8.4, date: '2026-03-20' },
    { id: '5', name: 'Holiday Promotion', status: 'Sent', sent: 3200, openRate: 38.0, clickRate: 15.2, date: '2026-03-25' },
];

export default function AnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [overview, setOverview] = useState<any>(null);
    const [trendData, setTrendData] = useState(fallbackTrendData);
    const [campaignPerformance, setCampaignPerformance] = useState(fallbackCampaignPerformance);
    const [recentCampaigns, setRecentCampaigns] = useState(fallbackRecentCampaigns);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const data = await api.analytics.getOverview();
                if (data) {
                    setOverview(data);
                    if (data.trend_data) setTrendData(data.trend_data);
                    if (data.campaign_performance) setCampaignPerformance(data.campaign_performance);
                    if (data.recent_campaigns) setRecentCampaigns(data.recent_campaigns);
                }
            } catch (error) {
                console.error('Analytics API unavailable, using fallback data:', error);
                // Fallback data is already set
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const stats = {
        totalCampaigns: overview?.total_campaigns ?? 124,
        messagesSent: overview?.messages_sent ?? '45.2K',
        avgOpenRate: overview?.avg_open_rate ?? '42.3%',
        avgClickRate: overview?.avg_click_rate ?? '18.7%',
        bounceRate: overview?.bounce_rate ?? '2.1%',
        unsubscribeRate: overview?.unsubscribe_rate ?? '0.8%',
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'sent': return 'bg-emerald-500/10 text-emerald-400';
            case 'active': return 'bg-blue-500/10 text-blue-400';
            case 'scheduled': return 'bg-amber-500/10 text-amber-400';
            case 'draft': return 'bg-muted text-muted-foreground';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground font-medium">Loading analytics data...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 animate-fade-up">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Comprehensive performance metrics across all your campaigns.
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Campaigns"
                        value={stats.totalCampaigns}
                        icon={Send}
                        trend={{ value: 12, isPositive: true }}
                        description="All time"
                    />
                    <StatCard
                        title="Messages Sent"
                        value={stats.messagesSent}
                        icon={TrendingUp}
                        trend={{ value: 8, isPositive: true }}
                        description="Last 30 days"
                    />
                    <StatCard
                        title="Avg Open Rate"
                        value={stats.avgOpenRate}
                        icon={Eye}
                        trend={{ value: 3.2, isPositive: true }}
                        description="Across campaigns"
                    />
                    <StatCard
                        title="Avg Click Rate"
                        value={stats.avgClickRate}
                        icon={MousePointerClick}
                        trend={{ value: 1.5, isPositive: true }}
                        description="Across campaigns"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Delivery Trend Area Chart */}
                    <div className="rounded-2xl border border-border bg-card shadow-xl p-6 w-full h-[400px] flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Delivery Trend (Last 30 Days)</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <defs>
                                        <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="openedGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="sent" name="Sent" stroke="#6366F1" strokeWidth={2} fill="url(#sentGradient)" />
                                    <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#10B981" strokeWidth={2} fill="url(#deliveredGradient)" />
                                    <Area type="monotone" dataKey="opened" name="Opened" stroke="#F59E0B" strokeWidth={2} fill="url(#openedGradient)" />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Campaign Performance Bar Chart */}
                    <div className="rounded-2xl border border-border bg-card shadow-xl p-6 w-full h-[400px] flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Campaign Performance (%)</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={campaignPerformance} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
                                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="openRate" name="Open Rate" fill="#6366F1" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="clickRate" name="Click Rate" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex items-center gap-4">
                        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                            <p className="text-2xl font-bold text-foreground">{stats.bounceRate}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Across all campaigns</p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Unsubscribe Rate</p>
                            <p className="text-2xl font-bold text-foreground">{stats.unsubscribeRate}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Across all campaigns</p>
                        </div>
                    </div>
                </div>

                {/* Recent Campaigns Table */}
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border/50">
                        <h3 className="text-lg font-semibold text-foreground">Recent Campaign Performance</h3>
                    </div>
                    <table className="min-w-full divide-y divide-border/50">
                        <thead className="bg-accent/20">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Campaign</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Sent</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Open Rate</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Click Rate</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {recentCampaigns.map((c) => (
                                <tr key={c.id} className="hover:bg-accent/10 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{c.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(c.status)}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{c.sent.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{c.openRate}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{c.clickRate}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{c.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
