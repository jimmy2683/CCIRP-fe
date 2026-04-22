"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AlertCircle, RefreshCw, ChevronLeft, Send, CheckCircle, XCircle, MousePointerClick, Eye, Download, Activity } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '@/libs/api';

export default function CampaignDetailedView() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const fetchCampaignAnalytics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.analytics.getCampaignAnalytics(campaignId);
            setAnalytics(data);
        } catch (err: any) {
            setError(err.message || "Failed to load campaign analytics");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (campaignId) {
            fetchCampaignAnalytics();
        }
    }, [campaignId]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await api.analytics.exportCampaignAnalytics(campaignId, 'data');
        } catch (err: any) {
            alert(err.message || "Failed to export");
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-medium">Loading campaign analytics...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !analytics) {
        return (
            <DashboardLayout>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="rounded-full p-2.5 bg-card border border-border/60 hover:bg-muted text-muted-foreground transition-colors shadow-sm">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Campaign Details</h1>
                    </div>
                    <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-destructive flex items-center gap-3">
                        <AlertCircle className="h-6 w-6" />
                        <p>{error || "No data available."}</p>
                        <button onClick={fetchCampaignAnalytics} className="ml-auto underline decoration-destructive/50 hover:decoration-destructive underline-offset-4 font-semibold">Retry</button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const { metrics, timeline, recipients, supports_open_tracking } = analytics;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="rounded-full p-2.5 bg-card/50 border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground hover:shadow-md transition-all">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">Campaign Analytics</h1>
                            <p className="mt-1 text-sm text-muted-foreground font-medium">Detailed view of campaign performance and recipient engagement</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isExporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Export to CSV
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    <StatCard title="Total Sent" value={metrics.total_sent?.toLocaleString() || "0"} icon={Send} description="Total recipients" />
                    <StatCard title="Delivered" value={metrics.delivered?.toLocaleString() || "0"} icon={CheckCircle} description={`${metrics.delivery_rate || 0}% delivery rate`} />
                    {supports_open_tracking && (
                        <StatCard title="Opened" value={metrics.opened?.toLocaleString() || "0"} icon={Eye} description={`${metrics.open_rate || 0}% open rate`} />
                    )}
                    <StatCard title="Clicked" value={metrics.clicked?.toLocaleString() || "0"} icon={MousePointerClick} description={`${metrics.click_rate || 0}% click rate`} />
                    <StatCard title="Bounced" value={metrics.bounced?.toLocaleString() || "0"} icon={XCircle} description={`${metrics.bounce_rate || 0}% bounce rate`} />
                </div>

                {/* Timeline Chart */}
                <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl shadow-sm p-6 w-full h-[400px] flex flex-col mt-2 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">Engagement Over Time (Hours since send)</h3>
                    </div>
                    {timeline && timeline.length > 0 ? (
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <defs>
                                        <linearGradient id="opensGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                                        labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '8px', fontSize: '12px' }}
                                    />
                                    {supports_open_tracking && (
                                        <Area type="monotone" dataKey="opens" name="Opens" stroke="#10B981" strokeWidth={3} fill="url(#opensGradient)" activeDot={{ r: 6 }} />
                                    )}
                                    <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#6366F1" strokeWidth={3} fill="url(#clicksGradient)" activeDot={{ r: 6 }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <div className="p-4 rounded-full bg-muted/50">
                                <Activity className="w-8 h-8 opacity-50" />
                            </div>
                            <p className="text-sm font-medium">No timeline data available</p>
                        </div>
                    )}
                </div>

                {/* Per-user activity table */}
                <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl shadow-sm overflow-hidden mt-2">
                    <div className="px-6 py-5 border-b border-border/50 bg-card/30 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">Recipient Activity</h3>
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/50">
                            {recipients?.length || 0} Recipients
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left whitespace-nowrap divide-y divide-border/50">
                            <thead className="bg-muted/30">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Recipient</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                    {supports_open_tracking && <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Opened At</th>}
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Clicked At</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Delivery</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 bg-card/20">
                                {recipients && recipients.length > 0 ? (
                                    recipients.map((recipient: any, idx: number) => (
                                        <tr key={idx} className="group hover:bg-muted/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground">{recipient.name || "Unknown"}</span>
                                                    <span className="text-xs text-muted-foreground mt-0.5">{recipient.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide shadow-sm
                                                    ${recipient.status === 'Clicked' ? 'bg-indigo-500/10 text-indigo-500 ring-1 ring-inset ring-indigo-500/20' : 
                                                      recipient.status === 'Opened' ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-inset ring-emerald-500/20' : 
                                                      recipient.status === 'Failed' ? 'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20' : 
                                                      recipient.status === 'Delivered' ? 'bg-amber-500/10 text-amber-500 ring-1 ring-inset ring-amber-500/20' :
                                                      'bg-muted text-muted-foreground ring-1 ring-inset ring-border/50'}`}>
                                                    {recipient.status}
                                                </span>
                                            </td>
                                            {supports_open_tracking && (
                                                <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                                                    {recipient.opened_at ? new Date(recipient.opened_at).toLocaleString() : '-'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                                                {recipient.clicked_at ? new Date(recipient.clicked_at).toLocaleString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-semibold inline-flex items-center gap-1.5 capitalize ${
                                                    recipient.delivery_status === 'failed' ? 'text-destructive' : 
                                                    recipient.delivery_status === 'delivered' ? 'text-emerald-500' : 'text-foreground'}`}>
                                                    {recipient.delivery_status === 'delivered' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                                    {recipient.delivery_status === 'failed' && <div className="w-1.5 h-1.5 rounded-full bg-destructive" />}
                                                    {recipient.delivery_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={supports_open_tracking ? 5 : 4} className="px-6 py-12 text-center text-sm font-medium text-muted-foreground">
                                            No recipients found for this campaign
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
