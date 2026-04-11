"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Check, Plus, Search, Trash2, Upload, Users, Wand2, X } from 'lucide-react';
import { api, GroupCsvImportResult, Recipient } from '@/libs/api';
import { formatRecipientName, matchesSearchPattern, parseSearchPattern, REGEX_SEARCH_HINT } from '@/libs/search';
import { useQueryParamState } from '@/libs/useQueryParamState';

interface StaticGroup {
    id: string;
    name: string;
    description?: string | null;
    recipient_ids: string[];
    recipient_emails: string[];
    recipient_count: number;
}

function mergeRecipientIds(current: string[], incoming: string[]) {
    return Array.from(new Set([...current, ...incoming]));
}

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export default function GroupsPage() {
    const { value: searchTerm, setValue: setSearchTerm } = useQueryParamState('q');
    const [groups, setGroups] = useState<StaticGroup[]>([]);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImportingCsv, setIsImportingCsv] = useState(false);
    const [recipientSearch, setRecipientSearch] = useState('');
    const [csvSummary, setCsvSummary] = useState<GroupCsvImportResult | null>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);
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

    const recipientsById = useMemo(() => {
        return recipients.reduce<Record<string, Recipient>>((map, recipient) => {
            map[recipient.id] = recipient;
            return map;
        }, {});
    }, [recipients]);

    const groupSearchPattern = parseSearchPattern(searchTerm);
    const recipientSearchPattern = parseSearchPattern(recipientSearch);

    const filteredGroups = useMemo(() => {
<<<<<<< HEAD
        const q = searchTerm.toLowerCase();
        return groups.filter(group =>
            group.name?.toLowerCase().includes(q) ||
            group.description?.toLowerCase().includes(q) ||
            group.recipient_emails?.some((email) => email.toLowerCase().includes(q))
        );
    }, [groups, searchTerm]);
=======
        return groups.filter((group) => {
            const recipientNames = (group.recipient_ids || []).map((recipientId: string) => {
                const recipient = recipientsById[recipientId];
                return formatRecipientName(
                    recipient?.first_name,
                    recipient?.last_name,
                    recipient?.email,
                );
            });

            return matchesSearchPattern(
                groupSearchPattern,
                group.name,
                group.description,
                ...(group.recipient_emails || []),
                ...recipientNames,
            );
        });
    }, [groupSearchPattern, groups, recipientsById]);

    const filteredRecipients = useMemo(() => {
        return recipients.filter((recipient) => {
            const fullName = formatRecipientName(recipient.first_name, recipient.last_name, recipient.email);
            return matchesSearchPattern(recipientSearchPattern, fullName, recipient.email);
        });
    }, [recipientSearchPattern, recipients]);
>>>>>>> be28eb5 (FEAT: Implemented the frontend for advanced filtering)

    const selectedImportGroups = useMemo(
        () => groups.filter((group) => newGroup.importGroupIds.includes(group.id)),
        [groups, newGroup.importGroupIds],
    );

    const importedRecipientIds = useMemo(
        () => dedupeStrings(selectedImportGroups.flatMap((group) => group.recipient_ids || [])),
        [selectedImportGroups],
    );

    const effectiveRecipientIds = useMemo(
        () => dedupeStrings([...importedRecipientIds, ...newGroup.recipientIds]),
        [importedRecipientIds, newGroup.recipientIds],
    );

    const toggleRecipient = (recipientId: string) => {
<<<<<<< HEAD
        if (importedRecipientIds.includes(recipientId) && !newGroup.recipientIds.includes(recipientId)) {
            return;
        }
        setNewGroup(prev => ({
=======
        setNewGroup((prev) => ({
>>>>>>> be28eb5 (FEAT: Implemented the frontend for advanced filtering)
            ...prev,
            recipientIds: prev.recipientIds.includes(recipientId)
                ? prev.recipientIds.filter((id) => id !== recipientId)
                : [...prev.recipientIds, recipientId],
        }));
    };

<<<<<<< HEAD
    const toggleImportGroup = (groupId: string) => {
        setNewGroup((prev) => ({
            ...prev,
            importGroupIds: prev.importGroupIds.includes(groupId)
                ? prev.importGroupIds.filter((id) => id !== groupId)
                : [...prev.importGroupIds, groupId],
=======
    const selectFilteredRecipients = () => {
        setNewGroup((prev) => ({
            ...prev,
            recipientIds: mergeRecipientIds(
                prev.recipientIds,
                filteredRecipients.map((recipient) => recipient.id),
            ),
>>>>>>> be28eb5 (FEAT: Implemented the frontend for advanced filtering)
        }));
    };

    const resetModal = () => {
<<<<<<< HEAD
        setNewGroup({ name: '', description: '', recipientIds: [], importGroupIds: [] });
=======
        setNewGroup({ name: '', description: '', recipientIds: [] });
        setRecipientSearch('');
        setCsvSummary(null);
>>>>>>> be28eb5 (FEAT: Implemented the frontend for advanced filtering)
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
                import_group_ids: newGroup.importGroupIds,
            });
            resetModal();
            await fetchData();
        } catch (error: unknown) {
<<<<<<< HEAD
            alert(error instanceof Error ? error.message : 'Failed to create static group');
=======
            alert(getErrorMessage(error, 'Failed to create static group'));
>>>>>>> be28eb5 (FEAT: Implemented the frontend for advanced filtering)
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('Delete this static group? Campaigns already sent to it will keep their recipient snapshots.')) return;
        try {
            await api.groups.delete(groupId);
<<<<<<< HEAD
            setGroups(prev => prev.filter(group => group.id !== groupId));
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : 'Failed to delete static group');
=======
            setGroups((prev) => prev.filter((group) => group.id !== groupId));
        } catch (error: unknown) {
            alert(getErrorMessage(error, 'Failed to delete static group'));
        }
    };

    const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImportingCsv(true);
        try {
            const result = await api.groups.importCSV(file);
            setCsvSummary(result);
            setNewGroup((prev) => ({
                ...prev,
                recipientIds: mergeRecipientIds(prev.recipientIds, result.matched_recipient_ids),
            }));
        } catch (error: unknown) {
            alert(getErrorMessage(error, 'Failed to resolve CSV against recipients'));
        } finally {
            setIsImportingCsv(false);
            if (csvInputRef.current) {
                csvInputRef.current.value = '';
            }
>>>>>>> be28eb5 (FEAT: Implemented the frontend for advanced filtering)
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
                    <div className="relative max-w-2xl">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder={`Search groups, recipient emails, or recipient names. ${REGEX_SEARCH_HINT}`}
                            className="block w-full rounded-xl border border-border bg-muted py-2.5 pl-11 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {!groupSearchPattern.isValid && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                        Group search regex is invalid: {groupSearchPattern.error}
                    </div>
                )}

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
                        filteredGroups.map((group) => (
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
                                    {(group.recipient_emails || []).map((email) => (
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
                    <form onSubmit={handleCreateGroup} className="relative flex max-h-[88vh] w-full max-w-3xl flex-col rounded-3xl border border-border bg-card shadow-2xl">
                        <div className="flex items-start justify-between border-b border-border p-6">
                            <div>
                                <h2 className="text-xl font-black text-foreground">Create Static Group</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Pick recipients manually, with regex filtering, or from CSV. Membership stays fixed until edited.</p>
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
                                    onChange={(event) => setNewGroup((prev) => ({ ...prev, name: event.target.value }))}
                                    className="mt-2 block w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. Placement Volunteers"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                                <textarea
                                    value={newGroup.description}
                                    onChange={(event) => setNewGroup((prev) => ({ ...prev, description: event.target.value }))}
                                    className="mt-2 block h-20 w-full resize-none rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Optional context for this group"
                                />
                            </div>

                            <div className="rounded-2xl border border-border bg-muted/30 p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recipient Search</label>
                                        <p className="mt-1 text-xs text-muted-foreground">Search on email or name, including regex with `/pattern/i`.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={selectFilteredRecipients}
                                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20"
                                        >
                                            <Wand2 className="h-3.5 w-3.5" />
                                            Select Filtered
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewGroup((prev) => ({ ...prev, recipientIds: [] }))}
                                            className="rounded-xl border border-border px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-accent"
                                        >
                                            Clear Selection
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={recipientSearch}
                                            onChange={(event) => setRecipientSearch(event.target.value)}
                                            placeholder={`Filter recipients by email or name. ${REGEX_SEARCH_HINT}`}
                                            className="block w-full rounded-xl border border-border bg-background py-2.5 pl-11 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={csvInputRef}
                                            type="file"
                                            accept=".csv"
                                            className="hidden"
                                            onChange={handleCsvImport}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => csvInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-accent"
                                            disabled={isImportingCsv}
                                        >
                                            <Upload className="h-3.5 w-3.5" />
                                            {isImportingCsv ? 'Resolving CSV...' : 'Import CSV'}
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-3 text-xs text-muted-foreground">
                                    CSV columns supported: `email`, `full_name`, or `first_name` + `last_name`. Rows are matched against your existing recipients.
                                </p>
                                {!recipientSearchPattern.isValid && (
                                    <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
                                        Recipient regex is invalid: {recipientSearchPattern.error}
                                    </div>
                                )}
                                {csvSummary && (
                                    <div className="mt-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                                        <div className="font-semibold text-foreground">
                                            CSV matched {csvSummary.matched_count} recipients and skipped {csvSummary.skipped_count}.
                                        </div>
                                        {csvSummary.unmatched_rows.length > 0 && (
                                            <div className="mt-2 max-h-24 overflow-y-auto text-xs text-amber-300">
                                                {csvSummary.unmatched_rows.join(' | ')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Import Existing Static Groups</label>
                                    <span className="text-xs font-bold text-primary">{newGroup.importGroupIds.length} selected</span>
                                </div>
                                <div className="mt-3 max-h-52 overflow-y-auto rounded-2xl border border-border">
                                    {groups.length === 0 ? (
                                        <div className="p-6 text-center text-sm font-bold text-muted-foreground">Create a group first to reuse it here.</div>
                                    ) : (
                                        groups.map((group) => {
                                            const selected = newGroup.importGroupIds.includes(group.id);
                                            return (
                                                <button
                                                    key={group.id}
                                                    type="button"
                                                    onClick={() => toggleImportGroup(group.id)}
                                                    className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/40"
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{group.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {group.recipient_count} recipients
                                                            {group.description ? ` • ${group.description}` : ''}
                                                        </p>
                                                    </div>
                                                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted'}`}>
                                                        {selected && <Check className="h-3.5 w-3.5" />}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                                {selectedImportGroups.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedImportGroups.map((group) => (
                                            <span key={group.id} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">
                                                {group.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Audience Summary</p>
                                        <p className="mt-1 text-sm font-bold text-foreground">
                                            {effectiveRecipientIds.length} unique recipients will be saved in this static group
                                        </p>
                                    </div>
                                    <div className="text-right text-xs font-bold text-muted-foreground">
                                        <p>{newGroup.recipientIds.length} direct picks</p>
                                        <p>{importedRecipientIds.length} imported from groups</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recipients</label>
                                    <span className="text-xs font-bold text-primary">{effectiveRecipientIds.length} total included</span>
                                </div>
                                <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-border">
                                    {recipients.length === 0 ? (
                                        <div className="p-6 text-center text-sm font-bold text-muted-foreground">No recipients available yet.</div>
                                    ) : filteredRecipients.length === 0 ? (
                                        <div className="p-6 text-center text-sm font-bold text-muted-foreground">No recipients matched the current search.</div>
                                    ) : (
<<<<<<< HEAD
                                        recipients.map(recipient => {
                                            const selected = effectiveRecipientIds.includes(recipient.id);
                                            const imported = importedRecipientIds.includes(recipient.id);
                                            const direct = newGroup.recipientIds.includes(recipient.id);
                                            const fullName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || recipient.email;
=======
                                        filteredRecipients.map((recipient) => {
                                            const selected = newGroup.recipientIds.includes(recipient.id);
                                            const fullName = formatRecipientName(recipient.first_name, recipient.last_name, recipient.email);
>>>>>>> be28eb5 (FEAT: Implemented the frontend for advanced filtering)
                                            return (
                                                <button
                                                    key={recipient.id}
                                                    type="button"
                                                    onClick={() => toggleRecipient(recipient.id)}
                                                    disabled={imported && !direct}
                                                    className={`flex w-full items-center justify-between border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 ${
                                                        imported && !direct ? 'cursor-not-allowed bg-primary/5' : 'hover:bg-accent/40'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{fullName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {recipient.email}
                                                            {imported && !direct ? ' • Included via imported group' : direct ? ' • Added directly' : ''}
                                                        </p>
                                                    </div>
                                                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
                                                        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted'
                                                    }`}>
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
