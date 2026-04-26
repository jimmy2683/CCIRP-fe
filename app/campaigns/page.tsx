"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Search, Calendar, Users, Send, MoreVertical, Copy, RotateCcw, Loader2, BarChart3, ListFilter, X } from 'lucide-react';
import { api, Campaign } from '@/libs/api';
import { matchesSearchPattern, parseSearchPattern, REGEX_SEARCH_HINT } from '@/libs/search';
import { useQueryParamState } from '@/libs/useQueryParamState';

const STATUS_OPTIONS = ['draft', 'queued', 'scheduled', 'dispatching', 'sent', 'partially_sent', 'failed'] as const;

function formatStatus(status?: string) {
    return String(status || 'draft')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusBadgeClass(status?: string) {
    switch (String(status || '').toLowerCase()) {
        case 'sent':         return 'badge badge-success';
        case 'scheduled':   return 'badge badge-warning';
        case 'dispatching': return 'badge badge-info';
        case 'queued':      return 'badge bg-violet-500/10 text-violet-600 ring-1 ring-inset ring-violet-500/20 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide';
        case 'failed':      return 'badge badge-error';
        case 'partially_sent': return 'badge bg-orange-500/10 text-orange-600 ring-1 ring-inset ring-orange-500/20 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide';
        default:            return 'badge badge-neutral';
    }
}

export default function CampaignsPage() {
    const { value: searchTerm, setValue: setSearchTerm } = useQueryParamState('q');
    const [recipientSearch, setRecipientSearch] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const PAGE_SIZE = 20;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setIsLoading(true);
            try {
                const data = await api.campaigns.list();
                setCampaigns(data?.items || []);
            } catch (error) {
                console.error('Failed to fetch campaigns:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, recipientSearch, selectedStatuses]);

    const searchPattern = parseSearchPattern(searchTerm);
    const recipientPattern = parseSearchPattern(recipientSearch);

    const statusCounts = useMemo(() => {
        return campaigns.reduce<Record<string, number>>((counts, campaign) => {
            const key = String(campaign.status || 'draft').toLowerCase();
            counts[key] = (counts[key] || 0) + 1;
            return counts;
        }, {});
    }, [campaigns]);

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((campaign) => {
            const normalizedStatus = String(campaign.status || 'draft').toLowerCase();
            if (selectedStatuses.length > 0 && !selectedStatuses.includes(normalizedStatus)) return false;
            const matchesCampaign = matchesSearchPattern(searchPattern, campaign.name, campaign.subject, campaign.template_id, ...(campaign.tags || []), ...(campaign.group_ids || []));
            if (!matchesCampaign) return false;
            return matchesSearchPattern(recipientPattern, ...(campaign.recipients || []));
        });
    }, [campaigns, recipientPattern, searchPattern, selectedStatuses]);

    const totalRecipients = filteredCampaigns.reduce((sum: number, c) => sum + (c.recipients?.length || 0), 0);

    const totalCampaignPages = Math.ceil(filteredCampaigns.length / PAGE_SIZE);
    const pagedCampaigns = filteredCampaigns.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const campaignStartRecord = filteredCampaigns.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const campaignEndRecord = Math.min(currentPage * PAGE_SIZE, filteredCampaigns.length);
    const campaignPageNums: number[] = (() => {
        const tot = totalCampaignPages;
        const cur = currentPage;
        if (tot <= 5) return Array.from({ length: tot }, (_, i) => i + 1);
        if (cur <= 3) return [1, 2, 3, 4, 5];
        if (cur >= tot - 2) return [tot - 4, tot - 3, tot - 2, tot - 1, tot];
        return [cur - 2, cur - 1, cur, cur + 1, cur + 2];
    })();

    const toggleStatus = (status: string) => {
        setSelectedStatuses((current) => (
            current.includes(status)
                ? current.filter((s) => s !== status)
                : [...current, status]
        ));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setRecipientSearch('');
        setSelectedStatuses([]);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 animate-fade-up">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Communications</p>
                        <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-none">Campaigns</h1>
                        <p className="mt-2 text-[14px] text-muted-foreground">Create, schedule, and manage your communication workflows</p>
                    </div>
                    <Link
                        href="/campaigns/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 cursor-pointer flex-shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        New Campaign
                    </Link>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Send, label: 'Visible Campaigns', value: filteredCampaigns.length, color: 'bg-indigo-500/10 text-indigo-600' },
                        { icon: Calendar, label: 'Scheduled', value: filteredCampaigns.filter((c) => String(c.status).toLowerCase() === 'scheduled').length, color: 'bg-amber-500/10 text-amber-600' },
                        { icon: Users, label: 'Recipients', value: totalRecipients, color: 'bg-emerald-500/10 text-emerald-600' },
                    ].map((card) => (
                        <div key={card.label} className="bg-card rounded-2xl border border-border/60 px-5 py-4 flex items-center gap-4 shadow-sm">
                            <div className={`p-2.5 rounded-xl ${card.color} flex-shrink-0`}>
                                <card.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[12px] font-medium text-muted-foreground">{card.label}</p>
                                <p className="text-[22px] font-bold text-foreground leading-none mt-0.5">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                className="w-full bg-muted/60 border border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-150"
                                placeholder={`Search campaigns, subjects, tags… ${REGEX_SEARCH_HINT}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative flex-1">
                            <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                className="w-full bg-muted/60 border border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-150"
                                placeholder={`Filter by recipient email… ${REGEX_SEARCH_HINT}`}
                                value={recipientSearch}
                                onChange={(e) => setRecipientSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-150 cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    </div>

                    {/* Status filters */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedStatuses([])}
                            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer ${selectedStatuses.length === 0 ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60'}`}
                        >
                            All
                        </button>
                        {STATUS_OPTIONS.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => toggleStatus(status)}
                                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer ${selectedStatuses.includes(status) ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60'}`}
                            >
                                {formatStatus(status)}
                                {statusCounts[status] ? <span className="ml-1.5 opacity-70">({statusCounts[status]})</span> : null}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Regex errors */}
                {(!searchPattern.isValid || !recipientPattern.isValid) && (
                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-[13px] text-amber-600 font-medium">
                        {!searchPattern.isValid && <div>Campaign search regex is invalid: {searchPattern.error}</div>}
                        {!recipientPattern.isValid && <div>Recipient email regex is invalid: {recipientPattern.error}</div>}
                    </div>
                )}

                {/* Table */}
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-[13px] text-muted-foreground font-medium">Loading campaigns...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                        <table className="min-w-full divide-y divide-border/40">
                            <thead>
                                <tr className="bg-muted/30">
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Campaign</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recipients</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Scheduled</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filteredCampaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-14 text-center">
                                            <p className="text-[13px] font-medium text-muted-foreground">
                                                {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match the current filters'}
                                            </p>
                                            {campaigns.length === 0 && (
                                                <Link href="/campaigns/new" className="mt-2 inline-block text-[13px] text-primary font-semibold hover:underline">
                                                    Create your first campaign →
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    pagedCampaigns.map((campaign) => (
                                        <tr key={campaign.id} className="group hover:bg-muted/20 transition-colors duration-100">
                                            <td className="px-6 py-4">
                                                <p className="text-[14px] font-semibold text-foreground">{campaign.name}</p>
                                                <p className="mt-0.5 text-[12px] text-muted-foreground">{campaign.subject || 'No subject'}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={statusBadgeClass(campaign.status)}>
                                                    {formatStatus(campaign.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-[14px] font-medium text-foreground">{campaign.recipients?.length || 0}</p>
                                                {(campaign.recipients || []).length > 0 && (
                                                    <p className="mt-0.5 max-w-[160px] truncate text-[12px] text-muted-foreground">
                                                        {(campaign.recipients || []).slice(0, 2).join(', ')}
                                                        {(campaign.recipients || []).length > 2 ? '…' : ''}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-muted-foreground">
                                                {campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString() : 'Immediate'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-muted-foreground">
                                                {new Date(campaign.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1 text-muted-foreground">
                                                    <Link
                                                        href={`/dashboard/campaigns/${campaign._id || campaign.id}`}
                                                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-150 cursor-pointer"
                                                        title="View Analytics"
                                                    >
                                                        <BarChart3 className="w-4 h-4" />
                                                    </Link>
                                                    <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer" title="Retry">
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer" title="Duplicate">
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer" title="More">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {totalCampaignPages > 1 && (
                            <div className="bg-muted/20 border-t border-border/40 px-6 py-3.5 flex items-center justify-between">
                                <p className="text-[12px] text-muted-foreground">
                                    Showing <span className="font-semibold text-foreground">{campaignStartRecord}–{campaignEndRecord}</span> of <span className="font-semibold text-foreground">{filteredCampaigns.length}</span> campaigns
                                </p>
                                <nav className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        disabled={currentPage === 1}
                                        className="h-7 px-3 rounded-lg border border-border/60 bg-card text-[12px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Prev
                                    </button>
                                    {campaignPageNums.map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setCurrentPage(n)}
                                            className={`h-7 w-7 flex items-center justify-center rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer ${n === currentPage ? 'bg-primary text-primary-foreground' : 'border border-border/60 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        disabled={currentPage === totalCampaignPages}
                                        className="h-7 px-3 rounded-lg border border-border/60 bg-card text-[12px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
