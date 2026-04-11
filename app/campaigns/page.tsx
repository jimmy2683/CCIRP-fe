"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Search, Calendar, Users, Send, MoreVertical, Copy, RotateCcw, Loader2, BarChart3 } from 'lucide-react';
import { api, Campaign } from '@/libs/api';

const STATUS_STYLES: Record<string, string> = {
    sent: 'bg-emerald-500/10 text-emerald-400',
    partially_sent: 'bg-amber-500/10 text-amber-400',
    scheduled: 'bg-primary/10 text-primary',
    queued: 'bg-sky-500/10 text-sky-400',
    dispatching: 'bg-orange-500/10 text-orange-400',
    failed: 'bg-rose-500/10 text-rose-400',
    draft: 'bg-muted text-muted-foreground',
};

function formatStatus(status: string) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

export default function CampaignsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setIsLoading(true);
            try {
                const data = await api.campaigns.list();
                setCampaigns(data || []);
            } catch (error) {
                console.error('Failed to fetch campaigns:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create, schedule, and manage your communication workflows.
                        </p>
                    </div>
                    <Link
                        href="/campaigns/new"
                        className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Create Campaign
                    </Link>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Send className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                            <p className="text-2xl font-bold text-foreground">{campaigns.length}</p>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl"><Calendar className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                            <p className="text-2xl font-bold text-foreground">{campaigns.filter((c) => c.status === 'scheduled').length}</p>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Users className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                            <p className="text-2xl font-bold text-foreground">{campaigns.reduce((sum, c) => sum + (c.recipients?.length || 0), 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            className="block w-full bg-muted rounded-xl border-border pl-10 focus:border-primary focus:ring-primary sm:text-sm border py-2 text-foreground placeholder:text-muted-foreground"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="cursor-pointer text-sm font-medium px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors">All</button>
                        <button className="cursor-pointer text-sm font-medium px-4 py-2 border border-border rounded-xl text-muted-foreground hover:bg-accent/50 transition-colors">Active</button>
                        <button className="cursor-pointer text-sm font-medium px-4 py-2 border border-border rounded-xl text-muted-foreground hover:bg-accent/50 transition-colors">Drafts</button>
                    </div>
                </div>

                {/* List */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-border/50">
                            <thead className="bg-accent/20">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Campaign Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Recipients</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Scheduled</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Created At</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-border/50 text-sm">
                                {filteredCampaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            No campaigns found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCampaigns.map((c) => (
                                        <tr key={c.id} className="hover:bg-accent/10 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">{c.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                                                    ${STATUS_STYLES[c.status] || 'bg-muted text-muted-foreground'}`
                                                }>
                                                    {formatStatus(c.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                <div className="flex flex-col gap-1">
                                                    <span>{c.recipients?.length || 0}</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(c.channels || ['email']).map((channel) => (
                                                            <span
                                                                key={channel}
                                                                className="inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                                                            >
                                                                {channel}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                {c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : 'Immediate'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                                    <Link href={`/campaigns/${c._id || c.id}/analytics`} className="hover:text-primary p-1" title="View Analytics">
                                                        <BarChart3 className="w-4 h-4" />
                                                    </Link>
                                                    <button className="cursor-pointer hover:text-primary p-1"><RotateCcw className="w-4 h-4" /></button>
                                                    <button className="cursor-pointer hover:text-primary p-1"><Copy className="w-4 h-4" /></button>
                                                    <button className="cursor-pointer hover:text-foreground p-1"><MoreVertical className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}
