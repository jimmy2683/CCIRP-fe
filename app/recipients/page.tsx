"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Search, Filter, Plus, MoreVertical, Edit2, Trash2, Upload, X } from 'lucide-react';
import { api, Recipient } from '@/libs/api';
import { matchesSearchPattern, parseSearchPattern, REGEX_SEARCH_HINT } from '@/libs/search';
import { useQueryParamState } from '@/libs/useQueryParamState';

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export default function RecipientsPage() {
    const router = useRouter();
    const { value: searchTerm, setValue: setSearchTerm } = useQueryParamState('q');
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newRecipientData, setNewRecipientData] = useState({ first_name: '', last_name: '', email: '', phone: '', tags: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchRecipients = async () => {
        setIsLoading(true);
        try {
            const data = await api.recipients.list();
            setRecipients(data?.items || []);
        } catch (err) {
            console.error("Failed to load recipients", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipients();
    }, []);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const response = await api.recipients.importCSV(file);
            alert(`Import successful: ${response.success} added, ${response.skipped} skipped.`);
            fetchRecipients();
        } catch (error: unknown) {
            alert(`Import failed: ${getErrorMessage(error, 'Could not import CSV')}`);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...newRecipientData,
                tags: newRecipientData.tags.split(',').map(t => t.trim()).filter(t => t)
            };
            await api.recipients.create(payload);
            setNewRecipientData({ first_name: '', last_name: '', email: '', phone: '', tags: '' });
            setIsAddModalOpen(false);
            fetchRecipients();
        } catch (error: unknown) {
            alert(`Failed to add: ${getErrorMessage(error, 'Could not create recipient')}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter based on search term
    const searchPattern = parseSearchPattern(searchTerm);
    const filteredRecipients = recipients.filter((recipient) => {
        const fullName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim();
        return matchesSearchPattern(
            searchPattern,
            fullName,
            recipient.first_name,
            recipient.last_name,
            recipient.email,
            ...(recipient.tags || []),
        );
    });

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this recipient?")) return;
        try {
            await api.recipients.delete(id);
            setRecipients(recipients.filter(r => r.id !== id));
        } catch (error: unknown) {
            alert(`Failed to delete: ${getErrorMessage(error, 'Could not delete recipient')}`);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">

                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground leading-none">Audience Management</h1>
                        <p className="mt-2.5 text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
                            Unified Database • {recipients.length} Records
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={handleImportClick}
                            disabled={isImporting}
                            className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-accent px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-accent/80 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Upload className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                            {isImporting ? 'Importing...' : 'Import CSV'}
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            <Plus className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                            Add Recipient
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-card p-4 rounded-2xl border border-border shadow-2xl flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative flex-1 max-w-md w-full">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-xl bg-muted border-border pl-11 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-xs border py-2.5 text-foreground placeholder:text-muted-foreground font-medium"
                            placeholder={`Search by identity or metadata. ${REGEX_SEARCH_HINT}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="cursor-pointer flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-border bg-muted px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all">
                            <Filter className="-ml-1 mr-2 h-4 w-4" />
                            Status
                        </button>
                        <button className="cursor-pointer flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-border bg-muted px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all">
                            <Filter className="-ml-1 mr-2 h-4 w-4" />
                            Segments
                        </button>
                    </div>
                </div>

                {!searchPattern.isValid && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                        Regex search is invalid: {searchPattern.error}
                    </div>
                )}

                {/* Data Table */}
                <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/50">
                            <thead className="bg-accent/20">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        Identity
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        State
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        Archetypes
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        Telemetry
                                    </th>
                                    <th scope="col" className="relative px-6 py-4">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 text-[13px]">
                                {filteredRecipients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                            {isLoading ? "Loading mapping..." : "No intelligence mapping found"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecipients.map((recipient) => {
                                        const fullName = `${recipient.first_name} ${recipient.last_name || ''}`.trim();
                                        const lastEngaged = recipient.engagement?.last_open_at || recipient.engagement?.last_click_at
                                            ? new Date((recipient.engagement.last_open_at || recipient.engagement.last_click_at) as string).toLocaleDateString()
                                            : 'Never';

                                        return (
                                            <tr key={recipient.id} onClick={(e) => {
                                                // Prevent navigation if clicking actions
                                                if ((e.target as HTMLElement).closest('button')) return;
                                                router.push(`/recipients/${recipient.id}`);
                                            }} className="hover:bg-accent/10 transition-colors group cursor-pointer">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner shadow-primary/5">
                                                                {fullName.charAt(0).toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-bold text-foreground group-hover:text-primary transition-colors hover:underline">{fullName}</div>
                                                            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{recipient.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm
                          ${recipient.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                            recipient.status === 'inactive' ? 'bg-muted text-muted-foreground border border-border' :
                                                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`
                                                    }>
                                                        {recipient.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {(recipient.tags || []).map((tag: string) => (
                                                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/10">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    {lastEngaged}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button className="cursor-pointer text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-all">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(recipient.id)}
                                                            className="cursor-pointer text-muted-foreground hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <button className="cursor-pointer text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-accent hover:text-foreground transition-all">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-accent/20 px-4 py-4 border-t border-border sm:px-6 flex items-center justify-between">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    Mapping <span className="text-foreground">1</span> to <span className="text-foreground">{filteredRecipients.length}</span> of <span className="text-foreground">{recipients.length}</span> Clusters
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-xl shadow-lg -space-x-px" aria-label="Pagination">
                                    <button className="cursor-pointer relative inline-flex items-center px-4 py-2 rounded-l-xl border border-border bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                                        Prev
                                    </button>
                                    <button className="cursor-pointer relative inline-flex items-center px-4 py-2 border border-primary/20 bg-primary text-[10px] font-black uppercase tracking-widest text-primary-foreground">
                                        1
                                    </button>
                                    <button className="cursor-pointer relative inline-flex items-center px-4 py-2 border border-border bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                                        2
                                    </button>
                                    <button className="cursor-pointer relative inline-flex items-center px-4 py-2 border border-border bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                                        3
                                    </button>
                                    <button className="cursor-pointer relative inline-flex items-center px-4 py-2 rounded-r-xl border border-border bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                    >Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border">
                        <button onClick={() => setIsAddModalOpen(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-foreground mb-6">Add Intelligence Record</h2>
                        <form onSubmit={handleAddSubmit} className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</label>
                                    <input required type="text" className="rounded-xl bg-muted border-border border py-2.5 px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        value={newRecipientData.first_name} onChange={e => setNewRecipientData({ ...newRecipientData, first_name: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</label>
                                    <input type="text" className="rounded-xl bg-muted border-border border py-2.5 px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        value={newRecipientData.last_name} onChange={e => setNewRecipientData({ ...newRecipientData, last_name: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                                <input required type="email" className="rounded-xl bg-muted border-border border py-2.5 px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={newRecipientData.email} onChange={e => setNewRecipientData({ ...newRecipientData, email: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                                <input required type="text" className="rounded-xl bg-muted border-border border py-2.5 px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={newRecipientData.phone} onChange={e => setNewRecipientData({ ...newRecipientData, phone: e.target.value })} />
                                <p className="text-[11px] text-muted-foreground">Recipients without phone numbers are not accepted.</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Segments (comma separated)</label>
                                <input type="text" className="rounded-xl bg-muted border-border border py-2.5 px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="VIP, Enterprise, Newsletter"
                                    value={newRecipientData.tags} onChange={e => setNewRecipientData({ ...newRecipientData, tags: e.target.value })} />
                            </div>
                            <div className="mt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="cursor-pointer rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="cursor-pointer rounded-xl bg-primary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Processing...' : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
