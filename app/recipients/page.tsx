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
    const PAGE_SIZE = 50;
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newRecipientData, setNewRecipientData] = useState({ first_name: '', last_name: '', email: '', phone: '', tags: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchRecipients = async (page = 1) => {
        setIsLoading(true);
        try {
            const data = await api.recipients.list((page - 1) * PAGE_SIZE, PAGE_SIZE);
            setRecipients(data?.items || []);
            setTotalCount(data?.total ?? 0);
            setCurrentPage(page);
        } catch (err) {
            console.error("Failed to load recipients", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchRecipients(1); }, []);

    const handleImportClick = () => { fileInputRef.current?.click(); };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        try {
            const response = await api.recipients.importCSV(file);
            alert(`Import successful: ${response.success} added, ${response.skipped} skipped.`);
            fetchRecipients(1);
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
            fetchRecipients(1);
        } catch (error: unknown) {
            alert(`Failed to add: ${getErrorMessage(error, 'Could not create recipient')}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const searchPattern = parseSearchPattern(searchTerm);
    const filteredRecipients = recipients.filter((recipient) => {
        const fullName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim();
        return matchesSearchPattern(searchPattern, fullName, recipient.first_name, recipient.last_name, recipient.email, ...(recipient.tags || []));
    });

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endRecord = Math.min(currentPage * PAGE_SIZE, totalCount);
    const pageNums: number[] = (() => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, 5];
        if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    })();

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this recipient?")) return;
        try {
            await api.recipients.delete(id);
            setRecipients(recipients.filter(r => r.id !== id));
        } catch (error: unknown) {
            alert(`Failed to delete: ${getErrorMessage(error, 'Could not delete recipient')}`);
        }
    };

    const inputClass = "w-full bg-card border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-150 shadow-sm";

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 animate-fade-up">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Audience</p>
                        <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-none">Recipients</h1>
                        <p className="mt-2 text-[14px] text-muted-foreground">
                            {totalCount} {totalCount === 1 ? 'record' : 'records'} in your audience database
                        </p>
                    </div>
                    <div className="flex gap-2.5 flex-shrink-0">
                        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        <button
                            onClick={handleImportClick}
                            disabled={isImporting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground hover:bg-muted/60 transition-all duration-150 disabled:opacity-50 shadow-sm cursor-pointer"
                        >
                            <Upload className="h-4 w-4 flex-shrink-0" />
                            {isImporting ? 'Importing...' : 'Import CSV'}
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:-translate-y-px transition-all duration-200 cursor-pointer"
                        >
                            <Plus className="h-4 w-4 flex-shrink-0" />
                            Add Recipient
                        </button>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            className="w-full bg-muted/60 border border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-150"
                            placeholder={`Search by name, email, tags… ${REGEX_SEARCH_HINT}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-[12px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer">
                            <Filter className="h-3.5 w-3.5" /> Status
                        </button>
                        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-[12px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer">
                            <Filter className="h-3.5 w-3.5" /> Segments
                        </button>
                    </div>
                </div>

                {!searchPattern.isValid && (
                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-[13px] text-amber-600 font-medium">
                        Invalid regex: {searchPattern.error}
                    </div>
                )}

                {/* Table */}
                <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/40">
                            <thead>
                                <tr className="bg-muted/30">
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Identity</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">State</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Archetypes</th>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Telemetry</th>
                                    <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-14 text-center">
                                            <p className="text-[13px] font-medium text-muted-foreground">Loading recipients...</p>
                                        </td>
                                    </tr>
                                ) : filteredRecipients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-14 text-center">
                                            <p className="text-[13px] font-medium text-muted-foreground">No recipients found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecipients.map((recipient) => {
                                        const fullName = `${recipient.first_name} ${recipient.last_name || ''}`.trim();
                                        const lastEngaged = recipient.engagement?.last_open_at || recipient.engagement?.last_click_at
                                            ? new Date((recipient.engagement.last_open_at || recipient.engagement.last_click_at) as string).toLocaleDateString()
                                            : 'Never';

                                        return (
                                            <tr
                                                key={recipient.id}
                                                onClick={(e) => {
                                                    if ((e.target as HTMLElement).closest('button')) return;
                                                    router.push(`/recipients/${recipient.id}`);
                                                }}
                                                className="group hover:bg-muted/20 transition-colors duration-100 cursor-pointer"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center text-primary text-[13px] font-bold flex-shrink-0">
                                                            {fullName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-[14px] font-semibold text-foreground group-hover:text-primary transition-colors duration-100">{fullName}</p>
                                                            <p className="text-[12px] text-muted-foreground mt-0.5">{recipient.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`badge ${
                                                        recipient.status === 'active' ? 'badge-success' :
                                                        recipient.status === 'inactive' ? 'badge-neutral' :
                                                        'badge-warning'}`}
                                                    >
                                                        {recipient.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {(recipient.tags || []).map((tag: string) => (
                                                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/8 text-primary border border-primary/15">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-[13px] text-muted-foreground font-medium">
                                                    {lastEngaged}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                                                        <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-150 cursor-pointer">
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(recipient.id)}
                                                            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-150 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer">
                                                            <MoreVertical className="w-3.5 h-3.5" />
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
                    <div className="bg-muted/20 border-t border-border/40 px-6 py-3.5 flex items-center justify-between">
                        <p className="text-[12px] text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{startRecord}–{endRecord}</span> of <span className="font-semibold text-foreground">{totalCount}</span> recipients
                        </p>
                        {totalPages > 1 && (
                            <nav className="flex items-center gap-1">
                                <button
                                    onClick={() => fetchRecipients(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-7 px-3 rounded-lg border border-border/60 bg-card text-[12px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Prev
                                </button>
                                {pageNums.map(n => (
                                    <button
                                        key={n}
                                        onClick={() => fetchRecipients(n)}
                                        className={`h-7 w-7 flex items-center justify-center rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer ${n === currentPage ? 'bg-primary text-primary-foreground' : 'border border-border/60 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button
                                    onClick={() => fetchRecipients(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-7 px-3 rounded-lg border border-border/60 bg-card text-[12px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </nav>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Recipient Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border/60 shadow-2xl shadow-black/10 p-6 animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[18px] font-bold text-foreground">Add Recipient</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">First Name</label>
                                    <input required type="text" className={inputClass} placeholder="Alex"
                                        value={newRecipientData.first_name} onChange={e => setNewRecipientData({ ...newRecipientData, first_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Last Name</label>
                                    <input type="text" className={inputClass} placeholder="Morgan"
                                        value={newRecipientData.last_name} onChange={e => setNewRecipientData({ ...newRecipientData, last_name: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Email Address</label>
                                <input required type="email" className={inputClass} placeholder="alex@company.com"
                                    value={newRecipientData.email} onChange={e => setNewRecipientData({ ...newRecipientData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Phone Number</label>
                                <input required type="text" className={inputClass} placeholder="+919999999999"
                                    value={newRecipientData.phone} onChange={e => setNewRecipientData({ ...newRecipientData, phone: e.target.value })} />
                                <p className="text-[11px] text-muted-foreground mt-1.5">Required for SMS and WhatsApp delivery.</p>
                            </div>
                            <div>
                                <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Segments</label>
                                <input type="text" className={inputClass} placeholder="VIP, Enterprise, Newsletter"
                                    value={newRecipientData.tags} onChange={e => setNewRecipientData({ ...newRecipientData, tags: e.target.value })} />
                                <p className="text-[11px] text-muted-foreground mt-1.5">Comma-separated segment tags.</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-150 cursor-pointer border border-border/60"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? 'Saving...' : 'Add Recipient'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
