"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Check, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { api } from '@/libs/api';

export default function GroupsPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [recipients, setRecipients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '', recipientIds: [] as string[] });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [groupData, recipientData] = await Promise.all([
                api.groups.list(),
                api.recipients.list(),
            ]);
            setGroups(groupData || []);
            setRecipients(recipientData || []);
        } catch (error) {
            console.error('Failed to load static groups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredGroups = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return groups.filter(group =>
            group.name?.toLowerCase().includes(q) ||
            group.description?.toLowerCase().includes(q) ||
            group.recipient_emails?.some((email: string) => email.toLowerCase().includes(q))
        );
    }, [groups, searchTerm]);

    const toggleRecipient = (recipientId: string) => {
        setNewGroup(prev => ({
            ...prev,
            recipientIds: prev.recipientIds.includes(recipientId)
                ? prev.recipientIds.filter(id => id !== recipientId)
                : [...prev.recipientIds, recipientId],
        }));
    };

    const resetModal = () => {
        setNewGroup({ name: '', description: '', recipientIds: [] });
        setIsModalOpen(false);
    };

    const handleCreateGroup = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            await api.groups.create({
                name: newGroup.name,
                description: newGroup.description || null,
                recipient_ids: newGroup.recipientIds,
            });
            resetModal();
            await fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to create static group');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('Delete this static group? Campaigns already sent to it will keep their recipient snapshots.')) return;
        try {
            await api.groups.delete(groupId);
            setGroups(prev => prev.filter(group => group.id !== groupId));
        } catch (error: any) {
            alert(error.message || 'Failed to delete static group');
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Static Groups</h1>
                        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Manually curated audiences • {groups.length} groups
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="-ml-1 mr-2 h-4 w-4" />
                        New Static Group
                    </button>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="relative max-w-md">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search groups or recipient emails..."
                            className="block w-full rounded-xl border border-border bg-muted py-2.5 pl-11 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {isLoading ? (
                        <div className="col-span-full rounded-2xl border border-border bg-card p-12 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            Loading groups...
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                            <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">No static groups found</p>
                        </div>
                    ) : (
                        filteredGroups.map(group => (
                            <div key={group.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-xl">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-black text-foreground">{group.name}</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">{group.description || 'No description'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteGroup(group.id)}
                                        className="rounded-xl p-2 text-muted-foreground transition-all hover:bg-rose-500/10 hover:text-rose-400"
                                        aria-label={`Delete ${group.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-5 flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-bold text-foreground">{group.recipient_count} recipients</span>
                                </div>
                                <div className="mt-4 flex max-h-24 flex-wrap gap-2 overflow-y-auto">
                                    {(group.recipient_emails || []).map((email: string) => (
                                        <span key={email} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">
                                            {email}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={resetModal}></div>
                    <form onSubmit={handleCreateGroup} className="relative flex max-h-[88vh] w-full max-w-2xl flex-col rounded-3xl border border-border bg-card shadow-2xl">
                        <div className="flex items-start justify-between border-b border-border p-6">
                            <div>
                                <h2 className="text-xl font-black text-foreground">Create Static Group</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Pick recipients manually. Membership stays fixed until edited.</p>
                            </div>
                            <button type="button" onClick={resetModal} className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto p-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Group Name</label>
                                <input
                                    required
                                    value={newGroup.name}
                                    onChange={(event) => setNewGroup(prev => ({ ...prev, name: event.target.value }))}
                                    className="mt-2 block w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. Placement Volunteers"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                                <textarea
                                    value={newGroup.description}
                                    onChange={(event) => setNewGroup(prev => ({ ...prev, description: event.target.value }))}
                                    className="mt-2 block h-20 w-full resize-none rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Optional context for this group"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recipients</label>
                                    <span className="text-xs font-bold text-primary">{newGroup.recipientIds.length} selected</span>
                                </div>
                                <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-border">
                                    {recipients.length === 0 ? (
                                        <div className="p-6 text-center text-sm font-bold text-muted-foreground">No recipients available yet.</div>
                                    ) : (
                                        recipients.map(recipient => {
                                            const selected = newGroup.recipientIds.includes(recipient.id);
                                            const fullName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || recipient.email;
                                            return (
                                                <button
                                                    key={recipient.id}
                                                    type="button"
                                                    onClick={() => toggleRecipient(recipient.id)}
                                                    className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/40"
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{fullName}</p>
                                                        <p className="text-xs text-muted-foreground">{recipient.email}</p>
                                                    </div>
                                                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted'}`}>
                                                        {selected && <Check className="h-3.5 w-3.5" />}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-border p-5">
                            <button type="button" onClick={resetModal} className="rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !newGroup.name.trim()}
                                className="rounded-xl bg-primary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Group'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}
