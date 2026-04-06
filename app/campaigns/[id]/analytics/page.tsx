"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/libs/api';
import {
    ArrowLeft, Send, CheckCircle2, Eye, MousePointerClick,
    AlertTriangle, Loader2, Calendar, Mail, Clock
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

// Fallback data
const fallbackCampaign = {
    name: 'Campaign',
    status: 'Sent',
    created_at: new Date().toISOString(),
    subject: 'Campaign Subject',
    template_name: 'Template',
};

const fallbackMetrics = {
    total_sent: 1250,
    delivered: 1220,
    opened: 565,
    clicked: 152,
    bounced: 30,
    delivery_rate: 97.6,
    open_rate: 46.3,
    click_rate: 12.5,
    bounce_rate: 2.4,
};

const fallbackTimeline = [
    { time: '0h', opens: 0, clicks: 0 },
    { time: '1h', opens: 120, clicks: 15 },
    { time: '2h', opens: 210, clicks: 42 },
    { time: '4h', opens: 310, clicks: 68 },
    { time: '8h', opens: 420, clicks: 95 },
    { time: '12h', opens: 485, clicks: 118 },
    { time: '24h', opens: 530, clicks: 138 },
    { time: '48h', opens: 558, clicks: 148 },
    { time: '72h', opens: 565, clicks: 152 },
];

const fallbackRecipients = [
    { email: 'alice@example.com', name: 'Alice Johnson', status: 'Clicked', opened_at: '2026-03-01T10:15:00Z', clicked_at: '2026-03-01T10:22:00Z' },
    { email: 'bob@example.com', name: 'Bob Smith', status: 'Opened', opened_at: '2026-03-01T11:30:00Z', clicked_at: null },
    { email: 'carol@example.com', name: 'Carol Davis', status: 'Delivered', opened_at: null, clicked_at: null },
    { email: 'dan@example.com', name: 'Dan Wilson', status: 'Bounced', opened_at: null, clicked_at: null },
    { email: 'eve@example.com', name: 'Eve Brown', status: 'Clicked', opened_at: '2026-03-01T14:05:00Z', clicked_at: '2026-03-01T14:12:00Z' },
];

const FUNNEL_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#EF4444'];

export default function CampaignAnalyticsPage() {
    const params = useParams();
    const campaignId = params?.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [campaign, setCampaign] = useState<any>(fallbackCampaign);
    const [metrics, setMetrics] = useState(fallbackMetrics);
    const [timeline, setTimeline] = useState(fallbackTimeline);
    const [recipients, setRecipients] = useState(fallbackRecipients);

    useEffect(() => {
        if (!campaignId) return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [campaignData, analyticsData] = await Promise.all([
                    api.campaigns.get(campaignId),
                    api.campaigns.getAnalytics(campaignId),
                ]);
                if (campaignData) setCampaign(campaignData);
                if (analyticsData) {
                    if (analyticsData.metrics) setMetrics(analyticsData.metrics);
                    if (analyticsData.timeline) setTimeline(analyticsData.timeline);
                    if (analyticsData.recipients) setRecipients(analyticsData.recipients);
                }
            } catch (error) {
                console.error('Failed to fetch campaign analytics, using fallback:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [campaignId]);

    const funnelData = [
        { name: 'Sent', value: metrics.total_sent },
        { name: 'Delivered', value: metrics.delivered },
        { name: 'Opened', value: metrics.opened },
        { name: 'Clicked', value: metrics.clicked },
        { name: 'Bounced', value: metrics.bounced },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'clicked': return 'bg-emerald-500/10 text-emerald-400';
            case 'opened': return 'bg-blue-500/10 text-blue-400';
            case 'delivered': return 'bg-amber-500/10 text-amber-400';
            case 'bounced': return 'bg-rose-500/10 text-rose-400';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'sent': return 'bg-emerald-500/10 text-emerald-400';
            case 'active': return 'bg-blue-500/10 text-blue-400';
            case 'scheduled': return 'bg-amber-500/10 text-amber-400';
            case 'draft': return 'bg-muted text-muted-foreground';
            default: return 'bg-primary/10 text-primary';
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground font-medium">Loading campaign analytics...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 animate-fade-up">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href="/campaigns" className="mt-1 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(campaign.status)}`}>
                                {campaign.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
                            {campaign.subject && (
                                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{campaign.subject}</span>
                            )}
                            {campaign.template_name && (
                                <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>{campaign.template_name}</span>
                            )}
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(campaign.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Total Sent', value: metrics.total_sent.toLocaleString(), icon: Send, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                        { label: 'Delivered', value: `${metrics.delivery_rate}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { label: 'Opened', value: `${metrics.open_rate}%`, icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'Clicked', value: `${metrics.click_rate}%`, icon: MousePointerClick, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        { label: 'Bounced', value: `${metrics.bounce_rate}%`, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                    ].map((m) => {
                        const Icon = m.icon;
                        return (
                            <div key={m.label} className="rounded-2xl border border-border bg-card shadow-sm p-4 flex flex-col items-center text-center gap-2">
                                <div className={`p-2.5 rounded-xl ${m.bg} ${m.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-bold text-foreground">{m.value}</p>
                                <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Delivery Funnel */}
                    <div className="rounded-2xl border border-border bg-card shadow-xl p-6 w-full h-[380px] flex flex-col">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Delivery Funnel</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                                        {funnelData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Engagement Timeline */}
                    <div className="rounded-2xl border border-border bg-card shadow-xl p-6 w-full h-[380px] flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Engagement Timeline</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="opens" name="Opens" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, fill: '#6366F1' }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="clicks" name="Clicks" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4, fill: '#F43F5E' }} activeDot={{ r: 6 }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recipients Table */}
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border/50">
                        <h3 className="text-lg font-semibold text-foreground">Recipient Activity</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Individual recipient engagement for this campaign.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/50">
                            <thead className="bg-accent/20">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Recipient</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Opened At</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Clicked At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {recipients.map((r) => (
                                    <tr key={r.email} className="hover:bg-accent/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                                    {r.name?.charAt(0)?.toUpperCase() || r.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                                                    <p className="text-xs text-muted-foreground">{r.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(r.status)}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {r.opened_at ? new Date(r.opened_at).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {r.clicked_at ? new Date(r.clicked_at).toLocaleString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
