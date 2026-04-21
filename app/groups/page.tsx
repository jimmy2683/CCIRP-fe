"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    FolderPlus,
    Loader2,
    Search,
    Sparkles,
    Target,
    Trash2,
    Upload,
    Users,
    Wand2,
} from "lucide-react";
import {
    api,
    DynamicGroupPreference,
    DynamicGroupResolvedAudience,
    GroupCsvImportResult,
    Recipient,
    StaticGroup,
} from "@/libs/api";
import {
    formatRecipientName,
    matchesSearchPattern,
    parseSearchPattern,
    REGEX_SEARCH_HINT,
} from "@/libs/search";
import { useQueryParamState } from "@/libs/useQueryParamState";

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

function dedupeStrings(values: string[]) {
    const seen = new Set<string>();
    const deduped: string[] = [];

    for (const value of values) {
        const cleanValue = String(value).trim();
        const key = cleanValue.toLowerCase();
        if (!cleanValue || seen.has(key)) {
            continue;
        }
        seen.add(key);
        deduped.push(cleanValue);
    }

    return deduped;
}

export default function GroupsPage() {
    const { value: searchTerm, setValue: setSearchTerm } = useQueryParamState("q");
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [groups, setGroups] = useState<StaticGroup[]>([]);
    const [dynamicPreferences, setDynamicPreferences] = useState<DynamicGroupPreference[]>([]);
    const [dynamicPreview, setDynamicPreview] = useState<DynamicGroupResolvedAudience | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingStaticGroup, setIsSavingStaticGroup] = useState(false);
    const [isDeletingGroupId, setIsDeletingGroupId] = useState<string | null>(null);
    const [isImportingCsv, setIsImportingCsv] = useState(false);
    const [isSavingDynamic, setIsSavingDynamic] = useState(false);
    const [isPreviewingDynamic, setIsPreviewingDynamic] = useState(false);
    const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
    const [selectedImportGroupIds, setSelectedImportGroupIds] = useState<string[]>([]);
    const [csvImportResult, setCsvImportResult] = useState<GroupCsvImportResult | null>(null);
    const [staticForm, setStaticForm] = useState({
        name: "",
        description: "",
    });
    const [dynamicForm, setDynamicForm] = useState({
        tag: "",
        top_k: "25",
        min_interactions: "1",
    });
    const csvInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [recipientList, groupList, preferenceList] = await Promise.all([
                api.recipients.list(),
                api.groups.list(),
                api.groups.listDynamicPreferences(),
            ]);
            setRecipients(recipientList?.items || []);
            setGroups(groupList?.items || []);
            setDynamicPreferences(preferenceList || []);
        } catch (error) {
            console.error("Failed to load groups page data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const searchPattern = parseSearchPattern(searchTerm);
    const recipientMap = useMemo(
        () => Object.fromEntries(recipients.map((recipient) => [recipient.id, recipient])),
        [recipients],
    );

    const filteredRecipients = useMemo(() => {
        return recipients.filter((recipient) => {
            const fullName = formatRecipientName(
                recipient.first_name,
                recipient.last_name,
                recipient.email,
            );
            return matchesSearchPattern(
                searchPattern,
                fullName,
                recipient.email,
                ...(recipient.tags || []),
            );
        });
    }, [recipients, searchPattern]);

    const filteredGroups = useMemo(() => {
        return groups.filter((group) => (
            matchesSearchPattern(
                searchPattern,
                group.name,
                group.description,
                ...(group.recipient_emails || []),
            )
        ));
    }, [groups, searchPattern]);

    const filteredDynamicPreferences = useMemo(() => {
        return dynamicPreferences.filter((preference) => (
            matchesSearchPattern(searchPattern, preference.tag, preference.tag_key)
        ));
    }, [dynamicPreferences, searchPattern]);

    const selectedRecipientEmails = useMemo(() => {
        const directEmails = selectedRecipientIds
            .map((recipientId) => recipientMap[recipientId]?.email || "")
            .filter(Boolean);
        const importedEmails = selectedImportGroupIds.flatMap((groupId) => (
            groups.find((group) => group.id === groupId)?.recipient_emails || []
        ));
        return dedupeStrings([...directEmails, ...importedEmails]);
    }, [groups, recipientMap, selectedImportGroupIds, selectedRecipientIds]);

    const selectedAudienceCount = selectedRecipientEmails.length;

    const handleToggleRecipient = (recipientId: string) => {
        setSelectedRecipientIds((current) => (
            current.includes(recipientId)
                ? current.filter((value) => value !== recipientId)
                : [...current, recipientId]
        ));
    };

    const handleToggleImportGroup = (groupId: string) => {
        setSelectedImportGroupIds((current) => (
            current.includes(groupId)
                ? current.filter((value) => value !== groupId)
                : [...current, groupId]
        ));
    };

    const handleSelectVisibleRecipients = () => {
        setSelectedRecipientIds((current) => dedupeStrings([
            ...current,
            ...filteredRecipients.map((recipient) => recipient.id),
        ]));
    };

    const resetStaticBuilder = () => {
        setStaticForm({ name: "", description: "" });
        setSelectedRecipientIds([]);
        setSelectedImportGroupIds([]);
        setCsvImportResult(null);
    };

    const handleCreateStaticGroup = async () => {
        if (!staticForm.name.trim()) {
            alert("Please enter a static group name.");
            return;
        }
        if (selectedAudienceCount === 0) {
            alert("Please add at least one recipient, imported group, or CSV match.");
            return;
        }

        setIsSavingStaticGroup(true);
        try {
            await api.groups.create({
                name: staticForm.name.trim(),
                description: staticForm.description.trim() || null,
                recipient_ids: selectedRecipientIds,
                import_group_ids: selectedImportGroupIds,
            });
            resetStaticBuilder();
            await fetchData();
        } catch (error) {
            alert(getErrorMessage(error, "Failed to create static group"));
        } finally {
            setIsSavingStaticGroup(false);
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm("Delete this static group?")) {
            return;
        }
        setIsDeletingGroupId(groupId);
        try {
            await api.groups.delete(groupId);
            setGroups((current) => current.filter((group) => group.id !== groupId));
            setSelectedImportGroupIds((current) => current.filter((value) => value !== groupId));
        } catch (error) {
            alert(getErrorMessage(error, "Failed to delete static group"));
        } finally {
            setIsDeletingGroupId(null);
        }
    };

    const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setIsImportingCsv(true);
        try {
            const result = await api.groups.importCSV(file);
            setCsvImportResult(result);
            setSelectedRecipientIds((current) => dedupeStrings([
                ...current,
                ...result.matched_recipient_ids,
            ]));
        } catch (error) {
            alert(getErrorMessage(error, "Failed to import CSV for static groups"));
        } finally {
            setIsImportingCsv(false);
            if (csvInputRef.current) {
                csvInputRef.current.value = "";
            }
        }
    };

    const handlePreviewDynamicGroup = async (override?: Partial<typeof dynamicForm>) => {
        const nextTag = (override?.tag ?? dynamicForm.tag).trim();
        const topKText = (override?.top_k ?? dynamicForm.top_k).trim();
        const minInteractionsText = (override?.min_interactions ?? dynamicForm.min_interactions).trim();

        if (!nextTag) {
            alert("Please enter a tag before previewing the dynamic group.");
            return;
        }
        if (!topKText) {
            alert("Please enter a group size for this tag.");
            return;
        }

        setIsPreviewingDynamic(true);
        try {
            const response = await api.groups.resolveDynamicGroups([
                {
                    tag: nextTag,
                    top_k: Number(topKText),
                    min_interactions: Number(minInteractionsText || "1"),
                },
            ]);
            setDynamicPreview(response.groups[0] || null);
        } catch (error) {
            alert(getErrorMessage(error, "Failed to preview dynamic group"));
        } finally {
            setIsPreviewingDynamic(false);
        }
    };

    const handleSaveDynamicPreference = async () => {
        const tag = dynamicForm.tag.trim();
        const topK = Number(dynamicForm.top_k);
        const minInteractions = Number(dynamicForm.min_interactions || "1");

        if (!tag) {
            alert("Please enter a tag.");
            return;
        }
        if (!Number.isFinite(topK) || topK <= 0) {
            alert("Please enter a valid group size.");
            return;
        }
        if (!Number.isFinite(minInteractions) || minInteractions <= 0) {
            alert("Please enter a valid minimum interaction count.");
            return;
        }

        setIsSavingDynamic(true);
        try {
            await api.groups.saveDynamicPreference({
                tag,
                top_k: topK,
                min_interactions: minInteractions,
            });
            await fetchData();
            await handlePreviewDynamicGroup();
        } catch (error) {
            alert(getErrorMessage(error, "Failed to save dynamic-group preference"));
        } finally {
            setIsSavingDynamic(false);
        }
    };

    const handleLoadDynamicPreference = (preference: DynamicGroupPreference) => {
        setDynamicForm({
            tag: preference.tag,
            top_k: String(preference.top_k),
            min_interactions: String(preference.min_interactions),
        });
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Groups</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Build static groups once, and resolve dynamic groups just-in-time from live engagement scores.
                        </p>
                    </div>
                    <div className="relative w-full lg:max-w-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder={`Search groups, recipients, and tags. ${REGEX_SEARCH_HINT}`}
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-primary/10 p-3 text-primary">
                                <FolderPlus className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Static Groups</p>
                                <p className="text-2xl font-bold text-foreground">{groups.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-sky-500/10 p-3 text-sky-400">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Dynamic Tags</p>
                                <p className="text-2xl font-bold text-foreground">{dynamicPreferences.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Recipients in Scope</p>
                                <p className="text-2xl font-bold text-foreground">{filteredRecipients.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {!searchPattern.isValid && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                        Regex search is invalid: {searchPattern.error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr,0.8fr]">
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Build Static Group</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Use regex or plain-text search on name and email, import recipients from CSV, and merge existing static groups.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-right">
                                    <div className="text-[11px] font-bold uppercase tracking-widest text-primary">Audience Ready</div>
                                    <div className="text-2xl font-black text-foreground">{selectedAudienceCount}</div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Group Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-xl border border-border bg-background p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. Alumni Recruiters"
                                        value={staticForm.name}
                                        onChange={(event) => setStaticForm((current) => ({ ...current, name: event.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Description</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-xl border border-border bg-background p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="Optional note for this static group"
                                        value={staticForm.description}
                                        onChange={(event) => setStaticForm((current) => ({ ...current, description: event.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                <input
                                    ref={csvInputRef}
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleCsvImport}
                                />
                                <button
                                    type="button"
                                    onClick={handleSelectVisibleRecipients}
                                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
                                >
                                    <Wand2 className="h-4 w-4" />
                                    Add All Visible Matches
                                </button>
                                <button
                                    type="button"
                                    onClick={() => csvInputRef.current?.click()}
                                    disabled={isImportingCsv}
                                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/50 disabled:opacity-60"
                                >
                                    {isImportingCsv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    Import CSV
                                </button>
                                <button
                                    type="button"
                                    onClick={resetStaticBuilder}
                                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                                >
                                    Reset Builder
                                </button>
                            </div>

                            {csvImportResult && (
                                <div className="mt-4 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-sky-100">
                                    <div className="font-semibold text-sky-200">
                                        CSV matched {csvImportResult.matched_count} recipients and skipped {csvImportResult.skipped_count}.
                                    </div>
                                    {csvImportResult.unmatched_rows.length > 0 && (
                                        <div className="mt-2 max-h-28 overflow-y-auto text-xs text-sky-100/90">
                                            {csvImportResult.unmatched_rows.slice(0, 8).map((row) => (
                                                <div key={row}>{row}</div>
                                            ))}
                                            {csvImportResult.unmatched_rows.length > 8 && (
                                                <div>...and {csvImportResult.unmatched_rows.length - 8} more rows.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Matching Recipients</h3>
                                        <span className="text-xs text-muted-foreground">{filteredRecipients.length} visible</span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto rounded-2xl border border-border">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center p-8">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            </div>
                                        ) : filteredRecipients.length === 0 ? (
                                            <div className="p-6 text-sm text-muted-foreground">No recipients matched the current search.</div>
                                        ) : (
                                            filteredRecipients.map((recipient) => {
                                                const selected = selectedRecipientIds.includes(recipient.id);
                                                const fullName = formatRecipientName(
                                                    recipient.first_name,
                                                    recipient.last_name,
                                                    recipient.email,
                                                );
                                                return (
                                                    <button
                                                        key={recipient.id}
                                                        type="button"
                                                        onClick={() => handleToggleRecipient(recipient.id)}
                                                        className={`flex w-full items-start justify-between border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 ${selected ? "bg-primary/10" : "hover:bg-accent/40"}`}
                                                    >
                                                        <div>
                                                            <div className="font-medium text-foreground">{fullName}</div>
                                                            <div className="text-xs text-muted-foreground">{recipient.email}</div>
                                                            {(recipient.tags || []).length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {recipient.tags.slice(0, 3).map((tag) => (
                                                                        <span
                                                                            key={`${recipient.id}-${tag}`}
                                                                            className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary"
                                                                        >
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                                            {selected ? "Added" : "Add"}
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Import Existing Static Groups</h3>
                                            <span className="text-xs text-muted-foreground">{selectedImportGroupIds.length} selected</span>
                                        </div>
                                        <div className="max-h-52 overflow-y-auto rounded-2xl border border-border">
                                            {groups.length === 0 ? (
                                                <div className="p-6 text-sm text-muted-foreground">Create your first static group here and it will appear for reuse.</div>
                                            ) : (
                                                groups.map((group) => (
                                                    <button
                                                        key={group.id}
                                                        type="button"
                                                        onClick={() => handleToggleImportGroup(group.id)}
                                                        className={`flex w-full items-center justify-between border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 ${selectedImportGroupIds.includes(group.id) ? "bg-primary/10" : "hover:bg-accent/40"}`}
                                                    >
                                                        <div>
                                                            <div className="font-medium text-foreground">{group.name}</div>
                                                            <div className="text-xs text-muted-foreground">{group.recipient_count} recipients</div>
                                                        </div>
                                                        <div className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${selectedImportGroupIds.includes(group.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                                            {selectedImportGroupIds.includes(group.id) ? "Using" : "Use"}
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Resolved Audience Preview</h3>
                                            <span className="text-xs text-muted-foreground">{selectedAudienceCount} recipients</span>
                                        </div>
                                        <div className="rounded-2xl border border-border bg-background p-4">
                                            {selectedRecipientEmails.length === 0 ? (
                                                <div className="text-sm text-muted-foreground">
                                                    Add recipients directly, import from CSV, or pull in an existing static group.
                                                </div>
                                            ) : (
                                                <div className="max-h-40 space-y-2 overflow-y-auto text-sm text-foreground">
                                                    {selectedRecipientEmails.slice(0, 20).map((email) => (
                                                        <div key={email}>{email}</div>
                                                    ))}
                                                    {selectedRecipientEmails.length > 20 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            ...and {selectedRecipientEmails.length - 20} more recipients.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleCreateStaticGroup}
                                    disabled={isSavingStaticGroup}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
                                >
                                    {isSavingStaticGroup ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
                                    Create Static Group
                                </button>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Saved Static Groups</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        These groups are persistent and can be reused in campaigns.
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">{filteredGroups.length} visible</div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {isLoading ? (
                                    <div className="col-span-full flex items-center justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : filteredGroups.length === 0 ? (
                                    <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                                        No static groups matched the current search.
                                    </div>
                                ) : (
                                    filteredGroups.map((group) => (
                                        <div key={group.id} className="rounded-2xl border border-border bg-background p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="font-semibold text-foreground">{group.name}</div>
                                                    <div className="mt-1 text-sm text-muted-foreground">
                                                        {group.description || "No description"}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteGroup(group.id)}
                                                    disabled={isDeletingGroupId === group.id}
                                                    className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-60"
                                                    aria-label={`Delete ${group.name}`}
                                                >
                                                    {isDeletingGroupId === group.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <div className="mt-4 text-xs font-bold uppercase tracking-widest text-primary">
                                                {group.recipient_count} recipients
                                            </div>
                                            {(group.recipient_emails || []).length > 0 && (
                                                <div className="mt-3 max-h-28 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                                                    {group.recipient_emails.slice(0, 5).map((email) => (
                                                        <div key={`${group.id}-${email}`}>{email}</div>
                                                    ))}
                                                    {group.recipient_emails.length > 5 && (
                                                        <div>...and {group.recipient_emails.length - 5} more.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Dynamic Group Builder</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Preview a live ranked audience for a tag, then save the default size you want to reuse in campaigns.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-right">
                                    <div className="text-[11px] font-bold uppercase tracking-widest text-sky-300">Threshold</div>
                                    <div className="text-lg font-black text-foreground">{dynamicForm.min_interactions || "1"}</div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
                                <p className="text-sm font-bold text-foreground">What counts as an interaction?</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    A successful tagged delivery counts as one interaction. Unique opens and unique clicks add stronger engagement signals on top of that.
                                </p>
                            </div>

                            {filteredDynamicPreferences.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Quick Load Saved Tags</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {filteredDynamicPreferences.slice(0, 6).map((preference) => (
                                            <button
                                                key={`quick-${preference.id}`}
                                                type="button"
                                                onClick={() => handleLoadDynamicPreference(preference)}
                                                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                                            >
                                                {preference.tag} • {preference.top_k}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Tag</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-xl border border-border bg-background p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. placements, alumni, internship"
                                        value={dynamicForm.tag}
                                        onChange={(event) => setDynamicForm((current) => ({ ...current, tag: event.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground">Default Group Size</label>
                                        <input
                                            type="number"
                                            min={1}
                                            className="mt-1 block w-full rounded-xl border border-border bg-background p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            value={dynamicForm.top_k}
                                            onChange={(event) => setDynamicForm((current) => ({ ...current, top_k: event.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground">Min Interactions</label>
                                        <input
                                            type="number"
                                            min={1}
                                            className="mt-1 block w-full rounded-xl border border-border bg-background p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            value={dynamicForm.min_interactions}
                                            onChange={(event) => setDynamicForm((current) => ({ ...current, min_interactions: event.target.value }))}
                                        />
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Successful deliveries, unique opens, and unique clicks all contribute here.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handlePreviewDynamicGroup()}
                                    disabled={isPreviewingDynamic}
                                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/50 disabled:opacity-60"
                                >
                                    {isPreviewingDynamic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                                    Preview Top K
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveDynamicPreference}
                                    disabled={isSavingDynamic}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                                >
                                    {isSavingDynamic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Save Preference
                                </button>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Saved Dynamic Tags</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Reuse one saved tag-size pair, or override the size later while creating a campaign.
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">{filteredDynamicPreferences.length} visible</div>
                            </div>

                            <div className="space-y-3">
                                {isLoading ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : filteredDynamicPreferences.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                                        No dynamic preferences matched the current search yet.
                                    </div>
                                ) : (
                                    filteredDynamicPreferences.map((preference) => (
                                        <div key={preference.id} className="rounded-2xl border border-border bg-background p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="font-semibold text-foreground">{preference.tag}</div>
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        top_k {preference.top_k} • min_interactions {preference.min_interactions}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLoadDynamicPreference(preference)}
                                                        className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent/50"
                                                    >
                                                        Load
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            handleLoadDynamicPreference(preference);
                                                            await handlePreviewDynamicGroup({
                                                                tag: preference.tag,
                                                                top_k: String(preference.top_k),
                                                                min_interactions: String(preference.min_interactions),
                                                            });
                                                        }}
                                                        className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent/50"
                                                    >
                                                        Preview
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Dynamic Preview</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        This is a live preview only. The campaign send path recalculates the audience again when the queue is prepared.
                                    </p>
                                </div>
                                {dynamicPreview && (
                                    <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-right">
                                        <div className="text-[11px] font-bold uppercase tracking-widest text-primary">{dynamicPreview.tag}</div>
                                        <div className="text-lg font-black text-foreground">{dynamicPreview.recipients.length}</div>
                                    </div>
                                )}
                            </div>

                            {!dynamicPreview ? (
                                <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                                    Preview a tag to inspect the current top-ranked recipients and see how deliveries, opens, and clicks contribute to eligibility.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-border bg-background p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Eligible</p>
                                            <p className="mt-2 text-2xl font-black text-foreground">{dynamicPreview.total_eligible}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border bg-background p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Group Size</p>
                                            <p className="mt-2 text-2xl font-black text-foreground">{dynamicPreview.top_k}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border bg-background p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Min Interactions</p>
                                            <p className="mt-2 text-2xl font-black text-foreground">{dynamicPreview.min_interactions}</p>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                                        A recipient is eligible once their interaction count reaches the threshold. Interaction count currently considers successful deliveries, unique opens, unique clicks, and any historical tag interaction totals already stored on the recipient.
                                    </div>
                                    <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-border">
                                        {dynamicPreview.recipients.length === 0 ? (
                                            <div className="p-6 text-sm text-muted-foreground">
                                                No recipients currently meet the threshold for this tag.
                                            </div>
                                        ) : (
                                            dynamicPreview.recipients.map((recipient, index) => (
                                                <div
                                                    key={`${dynamicPreview.tag_key}-${recipient.email}`}
                                                    className="grid grid-cols-[auto,1fr,auto] gap-3 border-b border-border px-4 py-3 last:border-b-0"
                                                >
                                                    <div className="rounded-xl bg-primary/10 px-2 py-1 text-xs font-black text-primary">
                                                        #{index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground">{recipient.name}</div>
                                                        <div className="text-xs text-muted-foreground">{recipient.email}</div>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                                                                Interactions {recipient.interaction_count}
                                                            </span>
                                                            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
                                                                Deliveries {recipient.delivery_count}
                                                            </span>
                                                            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
                                                                Opens {recipient.unique_open_count}
                                                            </span>
                                                            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
                                                                Clicks {recipient.unique_click_count}
                                                            </span>
                                                            {recipient.campaign_touchpoints > 0 && (
                                                                <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
                                                                    Touchpoints {recipient.campaign_touchpoints}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-black text-foreground">{recipient.dynamic_score}</div>
                                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">score</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
