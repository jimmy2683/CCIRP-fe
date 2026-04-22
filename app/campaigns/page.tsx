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
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusBadgeClass(status?: string) {
    switch (String(status || '').toLowerCase()) {
        case 'sent':
            return 'bg-emerald-500/10 text-emerald-400';
        case 'scheduled':
            return 'bg-amber-500/10 text-amber-400';
        case 'dispatching':
            return 'bg-sky-500/10 text-sky-400';
        case 'queued':
            return 'bg-violet-500/10 text-violet-400';
        case 'failed':
            return 'bg-rose-500/10 text-rose-400';
        case 'partially_sent':
            return 'bg-orange-500/10 text-orange-400';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

export default function CampaignsPage() {
    const { value: searchTerm, setValue: setSearchTerm } = useQueryParamState('q');
    const [recipientSearch, setRecipientSearch] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
            if (selectedStatuses.length > 0 && !selectedStatuses.includes(normalizedStatus)) {
                return false;
            }

            const matchesCampaign = matchesSearchPattern(
                searchPattern,
                campaign.name,
                campaign.subject,
                campaign.template_id,
                ...(campaign.tags || []),
                ...(campaign.group_ids || []),
            );
            if (!matchesCampaign) {
                return false;
            }

            return matchesSearchPattern(recipientPattern, ...(campaign.recipients || []));
        });
    }, [campaigns, recipientPattern, searchPattern, selectedStatuses]);

    const totalRecipients = filteredCampaigns.reduce((sum: number, campaign) => sum + (campaign.recipients?.length || 0), 0);

    const toggleStatus = (status: string) => {
        setSelectedStatuses((current) => (
            current.includes(status)
                ? current.filter((item) => item !== status)
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
            <div className="flex flex-col gap-6">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Send className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Visible Campaigns</p>
                            <p className="text-2xl font-bold text-foreground">{filteredCampaigns.length}</p>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl"><Calendar className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                            <p className="text-2xl font-bold text-foreground">{filteredCampaigns.filter((campaign) => String(campaign.status).toLowerCase() === 'scheduled').length}</p>
                        </div>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Users className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Visible Recipients</p>
                            <p className="text-2xl font-bold text-foreground">{totalRecipients}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="text"
                                className="block w-full bg-muted rounded-xl border-border pl-10 focus:border-primary focus:ring-primary sm:text-sm border py-2 text-foreground placeholder:text-muted-foreground"
                                placeholder={`Search by campaign name, subject, tags, or IDs. ${REGEX_SEARCH_HINT}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <ListFilter className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="text"
                                className="block w-full bg-muted rounded-xl border-border pl-10 focus:border-primary focus:ring-primary sm:text-sm border py-2 text-foreground placeholder:text-muted-foreground"
                                placeholder={`Filter by recipient email in the send list. ${REGEX_SEARCH_HINT}`}
                                value={recipientSearch}
                                onChange={(e) => setRecipientSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                            Clear
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedStatuses([])}
                            className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-colors ${selectedStatuses.length === 0 ? 'bg-primary/10 text-primary' : 'border border-border text-muted-foreground hover:bg-accent/50'}`}
                        >
                            All
                        </button>
                        {STATUS_OPTIONS.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => toggleStatus(status)}
                                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-colors ${selectedStatuses.includes(status) ? 'bg-primary/10 text-primary' : 'border border-border text-muted-foreground hover:bg-accent/50'}`}
                            >
                                {formatStatus(status)} ({statusCounts[status] || 0})
                            </button>
                        ))}
                    </div>
                </div>

                {(!searchPattern.isValid || !recipientPattern.isValid) && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                        {!searchPattern.isValid && <div>Campaign search regex is invalid: {searchPattern.error}</div>}
                        {!recipientPattern.isValid && <div>Recipient email regex is invalid: {recipientPattern.error}</div>}
                    </div>
                )}

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
                                            No campaigns matched the current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCampaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-accent/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{campaign.name}</div>
                                                <div className="mt-1 text-xs text-muted-foreground">{campaign.subject || 'No subject'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusBadgeClass(campaign.status)}`}>
                                                    {formatStatus(campaign.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                <div>{campaign.recipients?.length || 0}</div>
                                                {(campaign.recipients || []).length > 0 && (
                                                    <div className="mt-1 max-w-xs truncate text-xs">
                                                        {(campaign.recipients || []).slice(0, 2).join(', ')}
                                                        {(campaign.recipients || []).length > 2 ? '…' : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                {campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString() : 'Immediate'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                {new Date(campaign.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                                    <Link href={`/dashboard/campaigns/${campaign._id || campaign.id}`} className="hover:text-primary p-1" title="View Analytics">
                                                        <BarChart3 className="w-4 h-4" />
                                                    </Link>
                                                    <button className="cursor-pointer hover:text-primary p-1" title="Retry campaign">
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button className="cursor-pointer hover:text-primary p-1" title="Duplicate campaign">
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button className="cursor-pointer hover:text-foreground p-1" title="More actions">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
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
