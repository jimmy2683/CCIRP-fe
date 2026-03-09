"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Search, Filter, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';

// Mock recipient data
const INITIAL_RECIPIENTS = [
    { id: '1', name: 'Sarah Jenkins', email: 'sarah.j@example.com', status: 'Active', tags: ['VIP', 'Newsletter'], lastEngaged: '2 hours ago' },
    { id: '2', name: 'Michael Chen', email: 'mchen@techcorp.com', status: 'Active', tags: ['Enterprise', 'Product Updates'], lastEngaged: '1 day ago' },
    { id: '3', name: 'Emma Watson', email: 'emma@studio.design', status: 'Inactive', tags: ['Newsletter'], lastEngaged: '3 months ago' },
    { id: '4', name: 'David Miller', email: 'david.m@startup.co', status: 'Active', tags: ['Early Adopter'], lastEngaged: '5 days ago' },
    { id: '5', name: 'Lisa Roberts', email: 'lisa.r@enterprise.com', status: 'Pending', tags: ['Enterprise', 'VIP'], lastEngaged: 'Never' },
    { id: '6', name: 'James Wilson', email: 'jwilson@example.com', status: 'Active', tags: ['Newsletter'], lastEngaged: '1 week ago' },
    { id: '7', name: 'Anna Garcia', email: 'anna.g@creative.net', status: 'Active', tags: ['Product Updates'], lastEngaged: '2 days ago' },
    { id: '8', name: 'Robert Taylor', email: 'rtaylor@corp.com', status: 'Inactive', tags: ['Enterprise'], lastEngaged: '6 months ago' },
];

export default function RecipientsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [recipients, setRecipients] = useState(INITIAL_RECIPIENTS);

    // Filter based on search term
    const filteredRecipients = recipients.filter(
        (recipient) =>
            recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        setRecipients(recipients.filter(r => r.id !== id));
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
                    <button className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        <Plus className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                        Add Intelligence Record
                    </button>
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
                            placeholder="Search by identity or metadata..."
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
                                            No intelligence mapping found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecipients.map((recipient) => (
                                        <tr key={recipient.id} className="hover:bg-accent/10 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner shadow-primary/5">
                                                            {recipient.name.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{recipient.name}</div>
                                                        <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{recipient.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm
                          ${recipient.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                        recipient.status === 'Inactive' ? 'bg-muted text-muted-foreground border border-border' :
                                                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`
                                                }>
                                                    {recipient.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2 flex-wrap">
                                                    {recipient.tags.map((tag) => (
                                                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/10">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                {recipient.lastEngaged}
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
                                    ))
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
        </DashboardLayout>
    );
}
