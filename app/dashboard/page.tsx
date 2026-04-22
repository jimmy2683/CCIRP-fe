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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'sent': return 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/30';
            case 'active': return 'bg-blue-500/10 text-blue-500 ring-blue-500/30';
            case 'scheduled': return 'bg-amber-500/10 text-amber-500 ring-amber-500/30';
            case 'draft': return 'bg-muted text-muted-foreground ring-border/50';
            default: return 'bg-primary/10 text-primary ring-primary/30';
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh] animate-in fade-in zoom-in duration-500">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
                            <RefreshCw className="relative w-12 h-12 text-primary animate-spin" />
                        </div>
                        <p className="text-sm text-primary font-semibold tracking-wide">Loading your command center...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error && !overview) {
        return (
            <DashboardLayout>
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard Overview</h1>
                    <div className="rounded-2xl border border-destructive/40 bg-destructive/5 backdrop-blur-md p-6 text-destructive flex items-center gap-4 shadow-lg shadow-destructive/10">
                        <div className="p-3 bg-destructive/10 rounded-xl">
                            <AlertCircle className="h-7 w-7" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">Connection Error</span>
                            <span className="text-sm opacity-90">{error || "No data available."}</span>
                        </div>
                        <button onClick={fetchOverview} className="ml-auto px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold rounded-lg transition-colors">Retry Connection</button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 pb-10">
                {/* Page Header */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end justify-between animate-in slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-500 tracking-tight pb-1">
                            Dashboard Overview
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-muted-foreground font-medium">
                            Comprehensive performance metrics across all your campaigns.
                        </p>
                    </div>
                    <Link 
                        href="/campaigns/new" 
                        className="mt-4 sm:mt-0 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 transition-all"
                    >
                        <Send className="h-4 w-4" />
                        New Campaign
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-bottom-4 duration-500 delay-75 fill-mode-both">
                    <StatCard
                        title="Total Campaigns"
                        value={stats.totalCampaigns.toString()}
                        icon={Send}
                        description="Active and completed"
                    />
                    <StatCard
                        title="Messages Sent"
                        value={stats.messagesSent}
                        icon={TrendingUp}
                        description="Across all channels"
                    />
                    <StatCard
                        title="Avg Open Rate"
                        value={stats.avgOpenRate}
                        icon={Eye}
                        description="Across campaigns"
                    />
                    <StatCard
                        title="Avg Click Rate"
                        value={stats.avgClickRate}
                        icon={MousePointerClick}
                        description="Across campaigns"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
                    {/* Delivery Trend Area Chart */}
                    <div className="lg:col-span-3 rounded-3xl border border-border/40 bg-card/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 w-full h-[450px] flex flex-col transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-border/80 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <Activity className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Delivery Trend</h3>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">Last 30 Days</span>
                        </div>
                        {trendData.length > 0 ? (
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                        <defs>
                                            <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="openedGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                                            itemStyle={{ fontSize: '13px', fontWeight: 600, padding: '4px 0' }}
                                            labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '8px', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                        />
                                        <Area type="monotone" dataKey="sent" name="Sent" stroke="#6366F1" strokeWidth={3} fill="url(#sentGradient)" activeDot={{ r: 6, strokeWidth: 0, fill: '#6366F1' }} />
                                        <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#10B981" strokeWidth={3} fill="url(#deliveredGradient)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
                                        <Area type="monotone" dataKey="opened" name="Opened" stroke="#F59E0B" strokeWidth={3} fill="url(#openedGradient)" activeDot={{ r: 6, strokeWidth: 0, fill: '#F59E0B' }} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" iconSize={8} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                                <div className="p-5 rounded-full bg-muted/40 shadow-inner">
                                    <Activity className="w-10 h-10 opacity-30" />
                                </div>
                                <p className="text-sm font-semibold tracking-wide">No trend data available for this period</p>
                            </div>
                        )}
                    </div>

                    {/* Campaign Performance Bar Chart */}
                    <div className="lg:col-span-2 rounded-3xl border border-border/40 bg-card/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 w-full h-[450px] flex flex-col transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-border/80 group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-5 h-5 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground tracking-tight">Performance Hit Rate</h3>
                        </div>
                        {campaignPerformance.length > 0 ? (
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={campaignPerformance} margin={{ top: 10, right: 10, bottom: 0, left: -20 }} barSize={16}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }} dy={10} tickFormatter={(value) => value.length > 8 ? `${value.substring(0, 8)}.` : value} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }} />
                                        <Tooltip
                                            cursor={{ fill: 'var(--foreground)', opacity: 0.04 }}
                                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                                            itemStyle={{ fontSize: '13px', fontWeight: 600, padding: '4px 0' }}
                                            labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '8px', fontSize: '12px', fontWeight: 500 }}
                                        />
                                        <Bar dataKey="openRate" name="Open Rate %" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="clickRate" name="Click Rate %" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" iconSize={8} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                                <div className="p-5 rounded-full bg-muted/40 shadow-inner">
                                    <BarChart3 className="w-10 h-10 opacity-30" />
                                </div>
                                <p className="text-sm font-semibold tracking-wide">No recent campaigns available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
                    <div className="group rounded-3xl border border-destructive/20 bg-gradient-to-r from-destructive/10 to-transparent backdrop-blur-xl shadow-sm p-6 sm:p-8 flex items-center gap-6 transition-all duration-300 hover:shadow-md hover:border-destructive/40">
                        <div className="p-5 bg-destructive/10 text-destructive rounded-2xl shadow-inner transition-transform duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-destructive/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <AlertTriangle className="w-7 h-7 relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-bold text-destructive/80 uppercase tracking-widest">Global Bounce Rate</p>
                            <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-1">{stats.bounceRate}</p>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">Across all campaigns</p>
                        </div>
                    </div>
                    <div className="group rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent backdrop-blur-xl shadow-sm p-6 sm:p-8 flex items-center gap-6 transition-all duration-300 hover:shadow-md hover:border-amber-500/40">
                        <div className="p-5 bg-amber-500/10 text-amber-500 rounded-2xl shadow-inner transition-transform duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Users className="w-7 h-7 relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-bold text-amber-500/80 uppercase tracking-widest">Unsubscribe Rate</p>
                            <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-1">{stats.unsubscribeRate}</p>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">Across all campaigns</p>
                        </div>
                    </div>
                </div>

                {/* Recent Campaigns Table */}
                <div className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-2xl shadow-xl shadow-black/5 overflow-hidden animate-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
                    <div className="px-6 py-5 border-b border-border/40 bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-xl font-bold text-foreground tracking-tight">Recent Activity Log</h3>
                        <div className="text-xs font-semibold text-muted-foreground bg-background px-3 py-1.5 rounded-lg shadow-sm border border-border/50">
                            Showing latest {recentCampaigns.length} campaigns
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/40">
                            <thead className="bg-muted/10">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Campaign</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Sent</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Engagement</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 bg-transparent">
                                {recentCampaigns.length > 0 ? (
                                    recentCampaigns.map((c) => (
                                        <tr key={c.id} className="group hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground">{c.name}</span>
                                                    <span className="text-xs font-medium text-muted-foreground mt-1">{c.date || "—"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide ring-1 ring-inset ${getStatusColor(c.status)}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-muted-foreground">{c.sent?.toLocaleString()}</td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground font-semibold">Open</span>
                                                        <span className="text-sm font-bold text-foreground">{c.openRate}%</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground font-semibold">Click</span>
                                                        <span className="text-sm font-bold text-foreground">{c.clickRate}%</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => handleExport(e, c.id, c.name)}
                                                        disabled={exportingId === c.id}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                                                        title="Export CSV"
                                                    >
                                                        {exportingId === c.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                    </button>
                                                    <Link 
                                                        href={`/dashboard/campaigns/${c.id}`} 
                                                        className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                                                    >
                                                        Details
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm font-semibold text-muted-foreground">
                                            No recent campaigns to display. Let's create one!
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
