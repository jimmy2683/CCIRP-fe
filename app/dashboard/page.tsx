"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { api } from '@/libs/api';
import {
    Send, Eye, MousePointerClick, AlertTriangle, TrendingUp, Users,
    Loader2, BarChart3, Activity, AlertCircle, RefreshCw, Download
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Link from 'next/link';

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [overview, setOverview] = useState<any>(null);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [campaignPerformance, setCampaignPerformance] = useState<any[]>([]);
    const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
    const [exportingId, setExportingId] = useState<string | null>(null);

    const fetchOverview = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.analytics.getOverview();
            if (data) {
                setOverview(data);
                if (data.trend_data) setTrendData(data.trend_data);
                if (data.campaign_performance) setCampaignPerformance(data.campaign_performance);
                if (data.recent_campaigns) setRecentCampaigns(data.recent_campaigns);
            }
        } catch (err: any) {
            setError(err.message || 'Analytics API unavailable.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    const handleExport = async (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault();
        setExportingId(id);
        try {
            await api.analytics.exportCampaignAnalytics(id, name);
        } catch (err: any) {
            alert(err.message || "Failed to export");
        } finally {
            setExportingId(null);
        }
    };

    const stats = {
        totalCampaigns: overview?.total_campaigns ?? 0,
        messagesSent: overview?.messages_sent ?? '0',
        avgOpenRate: overview?.avg_open_rate ?? '0%',
        avgClickRate: overview?.avg_click_rate ?? '0%',
        bounceRate: overview?.bounce_rate ?? '0%',
        unsubscribeRate: overview?.unsubscribe_rate ?? '0%',
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'sent': return 'badge badge-success';
            case 'active': return 'badge badge-info';
            case 'scheduled': return 'badge badge-warning';
            case 'draft': return 'badge badge-neutral';
            default: return 'badge badge-primary';
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="absolute -inset-4 rounded-full bg-primary/15 blur-xl animate-pulse" />
                            <Loader2 className="relative w-10 h-10 text-primary animate-spin" />
                        </div>
                        <p className="text-[13px] text-muted-foreground font-medium">Loading analytics...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error && !overview) {
        return (
            <DashboardLayout>
                <div className="flex flex-col gap-6">
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 flex items-center gap-4">
                        <div className="p-3 bg-destructive/10 rounded-xl flex-shrink-0">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-destructive text-[15px]">Connection Error</p>
                            <p className="text-[13px] text-muted-foreground mt-0.5">{error}</p>
                        </div>
                        <button
                            onClick={fetchOverview}
                            className="flex-shrink-0 px-4 py-2 bg-destructive/10 hover:bg-destructive/15 text-destructive font-semibold rounded-lg transition-colors text-[13px] cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-fade-up">

                {/* Page Header */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Overview</p>
                        <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-none">
                            Dashboard
                        </h1>
                        <p className="mt-2 text-[14px] text-muted-foreground">
                            Performance metrics across all campaigns
                        </p>
                    </div>
                    <Link
                        href="/campaigns/new"
                        className="mt-4 sm:mt-0 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 cursor-pointer"
                    >
                        <Send className="h-4 w-4" />
                        New Campaign
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Campaigns"
                        value={stats.totalCampaigns.toString()}
                        icon={Send}
                        description="Active and completed"
                        accentColor="indigo"
                    />
                    <StatCard
                        title="Messages Sent"
                        value={stats.messagesSent}
                        icon={TrendingUp}
                        description="Across all channels"
                        accentColor="sky"
                    />
                    <StatCard
                        title="Avg Open Rate"
                        value={stats.avgOpenRate}
                        icon={Eye}
                        description="Across campaigns"
                        accentColor="emerald"
                    />
                    <StatCard
                        title="Avg Click Rate"
                        value={stats.avgClickRate}
                        icon={MousePointerClick}
                        description="Across campaigns"
                        accentColor="amber"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Delivery Trend */}
                    <div className="lg:col-span-3 bg-card rounded-2xl border border-border/60 shadow-sm p-6 h-[400px] flex flex-col hover:shadow-md transition-shadow duration-200 group">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Activity className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-foreground leading-none">Delivery Trend</h3>
                                    <p className="text-[11px] text-muted-foreground mt-1">Last 30 days</p>
                                </div>
                            </div>
                        </div>
                        {trendData.length > 0 ? (
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                        <defs>
                                            <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="openedGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.5} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} dy={8} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', padding: '10px 14px', fontSize: '13px' }}
                                            itemStyle={{ fontWeight: 600 }}
                                            labelStyle={{ color: 'var(--muted-foreground)', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                        />
                                        <Area type="monotone" dataKey="sent" name="Sent" stroke="#6366F1" strokeWidth={2} fill="url(#sentGradient)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                                        <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#10B981" strokeWidth={2} fill="url(#deliveredGradient)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                                        <Area type="monotone" dataKey="opened" name="Opened" stroke="#F59E0B" strokeWidth={2} fill="url(#openedGradient)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                                        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} iconType="circle" iconSize={7} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <div className="p-4 rounded-xl bg-muted/50">
                                    <Activity className="w-8 h-8 opacity-25" />
                                </div>
                                <p className="text-[13px] font-medium">No trend data available</p>
                            </div>
                        )}
                    </div>

                    {/* Performance Bar Chart */}
                    <div className="lg:col-span-2 bg-card rounded-2xl border border-border/60 shadow-sm p-6 h-[400px] flex flex-col hover:shadow-md transition-shadow duration-200 group">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 bg-rose-500/10 rounded-xl">
                                <BarChart3 className="w-4 h-4 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-semibold text-foreground leading-none">Performance</h3>
                                <p className="text-[11px] text-muted-foreground mt-1">Open & click rates</p>
                            </div>
                        </div>
                        {campaignPerformance.length > 0 ? (
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={campaignPerformance} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barSize={14}>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.5} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} dy={8} tickFormatter={(v) => v.length > 8 ? `${v.slice(0, 8)}…` : v} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                                        <Tooltip
                                            cursor={{ fill: 'var(--foreground)', opacity: 0.03 }}
                                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', padding: '10px 14px', fontSize: '13px' }}
                                            itemStyle={{ fontWeight: 600 }}
                                            labelStyle={{ color: 'var(--muted-foreground)', fontSize: '11px', marginBottom: '6px' }}
                                        />
                                        <Bar dataKey="openRate" name="Open Rate %" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="clickRate" name="Click Rate %" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                                        <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} iconType="circle" iconSize={7} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <div className="p-4 rounded-xl bg-muted/50">
                                    <BarChart3 className="w-8 h-8 opacity-25" />
                                </div>
                                <p className="text-[13px] font-medium">No campaign data</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Health Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="bg-card rounded-2xl border border-destructive/20 p-6 flex items-center gap-5 hover:border-destructive/35 hover:shadow-sm transition-all duration-200 group">
                        <div className="p-4 bg-destructive/8 text-destructive rounded-xl flex-shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-destructive/70 uppercase tracking-widest">Bounce Rate</p>
                            <p className="text-[32px] font-bold text-foreground tracking-tight leading-none mt-1">{stats.bounceRate}</p>
                            <p className="text-[12px] text-muted-foreground mt-1 font-medium">Global average</p>
                        </div>
                    </div>
                    <div className="bg-card rounded-2xl border border-amber-500/20 p-6 flex items-center gap-5 hover:border-amber-500/35 hover:shadow-sm transition-all duration-200 group">
                        <div className="p-4 bg-amber-500/8 text-amber-500 rounded-xl flex-shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-amber-500/70 uppercase tracking-widest">Unsubscribe Rate</p>
                            <p className="text-[32px] font-bold text-foreground tracking-tight leading-none mt-1">{stats.unsubscribeRate}</p>
                            <p className="text-[12px] text-muted-foreground mt-1 font-medium">Global average</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                        <div>
                            <h3 className="text-[15px] font-semibold text-foreground">Recent Activity</h3>
                            <p className="text-[12px] text-muted-foreground mt-0.5">Latest {recentCampaigns.length} campaigns</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/40">
                            <thead>
                                <tr className="bg-muted/30">
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Campaign</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Sent</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Engagement</th>
                                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {recentCampaigns.length > 0 ? (
                                    recentCampaigns.map((c) => (
                                        <tr key={c.id} className="group hover:bg-muted/20 transition-colors duration-100">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-[14px] font-semibold text-foreground">{c.name}</p>
                                                <p className="text-[12px] text-muted-foreground mt-0.5">{c.date || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getStatusBadge(c.status)}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-muted-foreground">
                                                {c.sent?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-5">
                                                    <div>
                                                        <p className="text-[11px] text-muted-foreground font-medium">Open</p>
                                                        <p className="text-[14px] font-semibold text-foreground">{c.openRate}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] text-muted-foreground font-medium">Click</p>
                                                        <p className="text-[14px] font-semibold text-foreground">{c.clickRate}%</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                    <button
                                                        onClick={(e) => handleExport(e, c.id, c.name)}
                                                        disabled={exportingId === c.id}
                                                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-150 disabled:opacity-50 cursor-pointer"
                                                        title="Export CSV"
                                                    >
                                                        {exportingId === c.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <Link
                                                        href={`/dashboard/campaigns/${c.id}`}
                                                        className="h-7 px-3 flex items-center justify-center text-[12px] font-semibold bg-primary/8 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-all duration-150"
                                                    >
                                                        Details
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-14 text-center">
                                            <p className="text-[13px] font-medium text-muted-foreground">No campaigns yet</p>
                                            <Link href="/campaigns/new" className="mt-2 inline-block text-[13px] text-primary font-semibold hover:underline">
                                                Create your first campaign →
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
