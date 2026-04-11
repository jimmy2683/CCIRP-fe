"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
    ArrowLeft,
    Calendar,
    Check,
    ChevronRight,
    Clock3,
    Loader2,
    Mail,
    MessageSquare,
    Phone,
    Plus,
    Type,
    Users,
    X,
} from 'lucide-react';
import { api, CampaignChannel, Recipient, Template, UserProfileData } from '@/libs/api';

interface CampaignGroup {
    id: string;
    name: string;
    recipient_count: number;
    recipient_emails: string[];
}

const STEPS = [
    { id: 1, name: 'Setup', description: 'Campaign details' },
    { id: 2, name: 'Content', description: 'Select template' },
    { id: 3, name: 'Merge Fields', description: 'Fill in data' },
    { id: 4, name: 'Audience', description: 'Choose recipients' },
    { id: 5, name: 'Review', description: 'Confirm & schedule' },
];

const AUTO_FIELDS = new Set(['name', 'email', 'full_name', 'first_name', 'recipient_name', 'recipient_email']);

const CHANNEL_OPTIONS: Array<{
    value: CampaignChannel;
    label: string;
    description: string;
    icon: React.ElementType;
}> = [
    { value: 'email', label: 'Email', description: 'HTML message with tracking support', icon: Mail },
    { value: 'sms', label: 'SMS', description: 'Plain text message to phone numbers', icon: Phone },
    { value: 'whatsapp', label: 'WhatsApp', description: 'Plain text WhatsApp delivery', icon: MessageSquare },
];

function extractMergeFields(html: string): string[] {
    const matches = html.match(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g);
    if (!matches) return [];
    const unique = new Set(matches.map(match => match.replace(/[{}\s]/g, '')));
    return Array.from(unique);
}

export default function NewCampaignWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [templates, setTemplates] = useState<Template[]>([]);
    const [users, setUsers] = useState<UserProfileData[]>([]);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [groups, setGroups] = useState<CampaignGroup[]>([]);

    const [campaignData, setCampaignData] = useState({
        name: '',
        subject: '',
        channels: ['email'] as CampaignChannel[],
        tags: [] as string[],
        tagInput: '',
        templateId: null as string | null,
        recipients: [] as string[],
        groupIds: [] as string[],
        mergeData: {} as Record<string, string>,
        scheduledAt: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [templateList, userList, recipientList, groupList] = await Promise.all([
                    api.templates.list(),
                    api.users.list(),
                    api.recipients.list(),
                    api.groups.list(),
                ]);
                setTemplates(templateList || []);
                setUsers((userList || []).filter(user => !!user.phone));
                setRecipients(recipientList || []);
                setGroups(groupList || []);
            } catch (error) {
                console.error('Failed to fetch wizard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const selectedTemplate = useMemo(
        () => templates.find(template => template._id === campaignData.templateId),
        [templates, campaignData.templateId]
    );

    const mergeFields = useMemo(() => {
        if (!selectedTemplate) return [];
        return extractMergeFields(selectedTemplate.body_html).filter(field => !AUTO_FIELDS.has(field));
    }, [selectedTemplate]);

    const groupRecipients = useMemo(() => {
        const selectedGroupIds = new Set(campaignData.groupIds);
        return groups
            .filter(group => selectedGroupIds.has(group.id))
            .flatMap(group => group.recipient_emails || []);
    }, [campaignData.groupIds, groups]);

    const effectiveRecipients = useMemo(() => {
        const seen = new Set<string>();
        return [...campaignData.recipients, ...groupRecipients].filter(email => {
            const cleanEmail = String(email).trim();
            const key = cleanEmail.toLowerCase();
            if (!cleanEmail || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [campaignData.recipients, groupRecipients]);

    const recipientDirectory = useMemo(
        () => Object.fromEntries(recipients.map(recipient => [recipient.email, recipient])),
        [recipients]
    );
    const userDirectory = useMemo(
        () => Object.fromEntries(users.map(user => [user.email, user])),
        [users]
    );

    const channelReadiness = useMemo(() => {
        let emailReady = 0;
        let smsReady = 0;
        let whatsappReady = 0;

        for (const email of effectiveRecipients) {
            const user = userDirectory[email];
            const recipient = recipientDirectory[email];
            const phone = recipient?.phone || user?.phone || null;

            emailReady += 1;
            if (phone) {
                smsReady += 1;
                whatsappReady += 1;
            }
        }

        return { emailReady, smsReady, whatsappReady };
    }, [effectiveRecipients, recipientDirectory, userDirectory]);

    const allMergeFieldsFilled = mergeFields.length === 0 || mergeFields.every(field => (campaignData.mergeData[field] || '').trim() !== '');

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const addTag = () => {
        const cleanTag = campaignData.tagInput.trim();
        if (!cleanTag) return;
        if (campaignData.tags.some(tag => tag.toLowerCase() === cleanTag.toLowerCase())) {
            setCampaignData(prev => ({ ...prev, tagInput: '' }));
            return;
        }
        setCampaignData(prev => ({
            ...prev,
            tags: [...prev.tags, cleanTag],
            tagInput: '',
        }));
    };

    const removeTag = (tagToRemove: string) => {
        setCampaignData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove),
        }));
    };

    const toggleChannel = (channel: CampaignChannel) => {
        setCampaignData(prev => {
            const nextChannels = prev.channels.includes(channel)
                ? prev.channels.filter(value => value !== channel)
                : [...prev.channels, channel];

            return {
                ...prev,
                channels: nextChannels.length > 0 ? nextChannels : ['email'],
            };
        });
    };

    const toggleGroup = (groupId: string) => {
        setCampaignData(prev => ({
            ...prev,
            groupIds: prev.groupIds.includes(groupId)
                ? prev.groupIds.filter(id => id !== groupId)
                : [...prev.groupIds, groupId],
        }));
    };

    const toggleRecipient = (email: string) => {
        setCampaignData(prev => ({
            ...prev,
            recipients: prev.recipients.includes(email)
                ? prev.recipients.filter(value => value !== email)
                : [...prev.recipients, email],
        }));
    };

    const updateMergeField = (key: string, value: string) => {
        setCampaignData(prev => ({
            ...prev,
            mergeData: { ...prev.mergeData, [key]: value },
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.campaigns.create({
                name: campaignData.name,
                subject: campaignData.subject || 'No Subject',
                template_id: campaignData.templateId || '',
                channels: campaignData.channels,
                tags: campaignData.tags,
                group_ids: campaignData.groupIds,
                recipients: effectiveRecipients,
                merge_data: campaignData.mergeData,
                scheduled_at: campaignData.scheduledAt ? new Date(campaignData.scheduledAt).toISOString() : null,
            });
            router.push('/campaigns');
        } catch (error) {
            console.error('Failed to create campaign:', error);
            alert('Failed to create campaign. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-2rem)] gap-4 animate-fade-in overflow-hidden">
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <Link href="/campaigns" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Create New Campaign</h1>
                        <p className="text-sm text-muted-foreground">Configure channels, recipients, and delivery timing in one flow.</p>
                    </div>
                </div>

                <nav aria-label="Progress" className="px-2">
                    <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                        {STEPS.map(step => (
                            <li key={step.name} className="md:flex-1">
                                <div className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${currentStep > step.id ? 'border-primary' : currentStep === step.id ? 'border-primary' : 'border-border'}`}>
                                    <span className={`text-sm font-medium ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>
                                        Step {step.id}
                                    </span>
                                    <span className="text-sm font-medium text-foreground">{step.name}</span>
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className="flex-1 min-h-0 bg-card rounded-xl border border-border shadow-sm p-6 lg:p-10 mb-20 overflow-y-auto">
                    {currentStep === 1 && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            <h2 className="text-2xl font-bold text-foreground">Campaign Details</h2>
                            <p className="text-muted-foreground">Set the basic metadata, delivery channels, and dispatch time.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Campaign Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-xl border-border bg-background shadow-sm focus:border-primary focus:ring-primary border p-3 text-foreground"
                                        placeholder="e.g. Placement Drive Reminder"
                                        value={campaignData.name}
                                        onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Message Subject</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-xl border-border bg-background shadow-sm focus:border-primary focus:ring-primary border p-3 text-foreground"
                                        placeholder="Subject used for email delivery"
                                        value={campaignData.subject}
                                        onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-3">Delivery Channels</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {CHANNEL_OPTIONS.map(option => {
                                            const selected = campaignData.channels.includes(option.value);
                                            const Icon = option.icon;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => toggleChannel(option.value)}
                                                    className={`rounded-2xl border p-4 text-left transition-all ${selected ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="w-4 h-4 text-primary" />
                                                                <p className="text-sm font-black text-foreground">{option.label}</p>
                                                            </div>
                                                            <p className="mt-2 text-xs text-muted-foreground">{option.description}</p>
                                                        </div>
                                                        <span className={`flex h-6 w-6 items-center justify-center rounded-lg border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted'}`}>
                                                            {selected && <Check className="h-3.5 w-3.5" />}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Dispatch Time</label>
                                    <div className="mt-1 relative">
                                        <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="datetime-local"
                                            className="block w-full rounded-xl border-border bg-background pl-11 shadow-sm focus:border-primary focus:ring-primary border p-3 text-foreground"
                                            value={campaignData.scheduledAt}
                                            onChange={(e) => setCampaignData({ ...campaignData, scheduledAt: e.target.value })}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Leave this empty for immediate dispatch. Future times are queued by the backend scheduler.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Campaign Tags</label>
                                    <div className="mt-1 flex gap-2">
                                        <input
                                            type="text"
                                            className="block flex-1 rounded-xl border-border bg-background shadow-sm focus:border-primary focus:ring-primary border p-3 text-foreground"
                                            placeholder="Add one tag at a time"
                                            value={campaignData.tagInput}
                                            onChange={(e) => setCampaignData({ ...campaignData, tagInput: e.target.value })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                                            aria-label="Add tag"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {campaignData.tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {campaignData.tags.map(tag => (
                                                <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="rounded-full text-primary/80 hover:text-primary" aria-label={`Remove ${tag}`}>
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            <h2 className="text-2xl font-bold text-foreground">Select Template</h2>
                            <p className="text-muted-foreground">Choose the source template used to render email, SMS, and WhatsApp content.</p>
                            {isLoading ? (
                                <div className="flex justify-center p-12"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
                            ) : templates.length === 0 ? (
                                <div className="text-center p-12 text-muted-foreground">No templates found. <Link href="/templates/new" className="text-primary underline">Create one first.</Link></div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {templates.map(template => (
                                        <div
                                            key={template._id}
                                            onClick={() => setCampaignData({ ...campaignData, templateId: template._id, mergeData: {} })}
                                            className={`group relative border rounded-2xl p-4 h-36 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-xl ${campaignData.templateId === template._id ? 'border-primary ring-2 ring-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-card'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${campaignData.templateId === template._id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                <Mail className="w-6 h-6" />
                                            </div>
                                            <span className="font-bold text-sm text-foreground text-center line-clamp-1">{template.name}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">{template.channel} • v{template.version}</span>
                                            {campaignData.templateId === template._id && (
                                                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1"><Check className="w-3 h-3" /></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Fill in Merge Fields</h2>
                                <p className="text-muted-foreground">Recipient-specific fields are injected automatically during dispatch.</p>
                            </div>
                            {mergeFields.length === 0 ? (
                                <div className="text-center p-12 border border-dashed border-border rounded-2xl">
                                    <Type className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground font-medium">This template has no custom merge fields.</p>
                                    <p className="text-xs text-muted-foreground mt-1">Recipient name and email will be filled automatically. Click Continue.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {mergeFields.map(field => (
                                        <div key={field}>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                                {field.replace(/_/g, ' ').replace(/\b\w/g, value => value.toUpperCase())}
                                                <span className="text-xs text-primary ml-2 font-mono">{`{{${field}}}`}</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="block w-full rounded-xl border-border bg-background shadow-sm focus:border-primary focus:ring-primary border p-3 text-foreground"
                                                placeholder={`Enter value for ${field}`}
                                                value={campaignData.mergeData[field] || ''}
                                                onChange={(e) => updateMergeField(field, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">Select Audience</h2>
                                    <p className="text-muted-foreground">Only users with phone numbers are available for direct selection.</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest leading-none block mb-1">Total Selected</span>
                                    <span className="text-2xl font-black text-foreground">{effectiveRecipients.length}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Static Groups</h3>
                                    <span className="text-xs font-bold text-muted-foreground">{campaignData.groupIds.length} selected</span>
                                </div>
                                {groups.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                                        No static groups yet. Create one from the Groups page, or select individual users below.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {groups.map(group => {
                                            const selected = campaignData.groupIds.includes(group.id);
                                            return (
                                                <button
                                                    key={group.id}
                                                    type="button"
                                                    onClick={() => toggleGroup(group.id)}
                                                    className={`rounded-2xl border p-4 text-left transition-all ${selected ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-black text-foreground">{group.name}</p>
                                                            <p className="mt-1 text-xs text-muted-foreground">{group.recipient_count} recipients</p>
                                                        </div>
                                                        <span className={`flex h-6 w-6 items-center justify-center rounded-lg border ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted'}`}>
                                                            {selected && <Check className="h-3.5 w-3.5" />}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCampaignData(prev => ({ ...prev, recipients: users.map(user => user.email) }))}
                                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                                >
                                    Select All
                                </button>
                                <span className="text-muted-foreground">|</span>
                                <button
                                    type="button"
                                    onClick={() => setCampaignData(prev => ({ ...prev, recipients: [] }))}
                                    className="text-xs font-bold text-muted-foreground hover:underline cursor-pointer"
                                >
                                    Deselect All
                                </button>
                            </div>

                            {campaignData.channels.some(channel => channel !== 'email') && effectiveRecipients.length > 0 && (
                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
                                    <p className="font-bold text-amber-300">Phone-based delivery readiness</p>
                                    <p className="mt-1 text-xs text-amber-200/80">
                                        Email: {channelReadiness.emailReady} • SMS: {channelReadiness.smsReady} • WhatsApp: {channelReadiness.whatsappReady}
                                    </p>
                                    <p className="mt-1 text-xs text-amber-200/80">
                                        Group members without a phone number will be skipped for SMS and WhatsApp at dispatch time.
                                    </p>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="flex justify-center p-12"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
                            ) : users.length === 0 ? (
                                <div className="text-center p-12 text-muted-foreground">No phone-enabled users found in the database.</div>
                            ) : (
                                <div className="border border-border rounded-2xl overflow-hidden shadow-sm bg-card max-h-[400px] overflow-y-auto">
                                    {users.map(user => (
                                        <div
                                            key={user.email}
                                            onClick={() => toggleRecipient(user.email)}
                                            className="border-b border-border last:border-b-0 p-4 flex items-center justify-between hover:bg-accent/50 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${campaignData.recipients.includes(user.email) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                    {(user.full_name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground text-sm">{user.full_name || 'N/A'}</h4>
                                                    <p className="text-[11px] font-medium text-muted-foreground">{user.email}</p>
                                                    <p className="text-[10px] font-medium text-muted-foreground/80">{user.phone}</p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${campaignData.recipients.includes(user.email) ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-muted'}`}>
                                                {campaignData.recipients.includes(user.email) && <Check className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
                            <div className="text-center mb-10">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                    <Check className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Final Confirmation</h2>
                                <p className="text-muted-foreground mt-2 font-medium">Review the multichannel dispatch setup before launch.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-muted/50 border border-border shadow-inner">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">General</span>
                                    <div className="mt-2 space-y-1">
                                        <h4 className="text-lg font-bold text-foreground">{campaignData.name || 'Untitled'}</h4>
                                        <p className="text-sm text-primary font-medium">{campaignData.subject || 'No Subject'}</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {campaignData.channels.map(channel => (
                                                <span key={channel} className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-foreground">
                                                    {channel}
                                                </span>
                                            ))}
                                        </div>
                                        {campaignData.tags.length > 0 ? (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {campaignData.tags.map(tag => (
                                                    <span key={tag} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">No tags</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-muted/50 border border-border shadow-inner">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assets & Audience</span>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                            <Mail className="w-3.5 h-3.5 text-primary" />
                                            {selectedTemplate?.name || 'No Template'}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                            <Users className="w-3.5 h-3.5 text-primary" />
                                            {effectiveRecipients.length} Target Recipients
                                        </div>
                                        {campaignData.groupIds.length > 0 && (
                                            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                                <Users className="w-3.5 h-3.5 text-primary" />
                                                {campaignData.groupIds.length} Static Groups
                                            </div>
                                        )}
                                        {campaignData.channels.some(channel => channel !== 'email') && (
                                            <div className="text-xs text-muted-foreground pt-2">
                                                SMS ready: {channelReadiness.smsReady} • WhatsApp ready: {channelReadiness.whatsappReady}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {Object.keys(campaignData.mergeData).length > 0 && (
                                <div className="p-6 rounded-2xl bg-muted/50 border border-border shadow-inner">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Merge Field Values</span>
                                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                                        {Object.entries(campaignData.mergeData).map(([key, value]) => (
                                            <div key={key} className="flex justify-between text-xs">
                                                <span className="text-muted-foreground font-mono">{key}</span>
                                                <span className="font-bold text-foreground truncate ml-2">{value || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-bold text-primary">
                                        Scheduled: {campaignData.scheduledAt ? new Date(campaignData.scheduledAt).toLocaleString() : 'Immediate Dispatch'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="fixed bottom-0 right-0 left-64 bg-card border-t border-border p-4 flex justify-between items-center shadow-lg z-20">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1 || isSubmitting}
                        className="rounded-lg px-6 py-2.5 text-xs font-black uppercase tracking-widest text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-accent disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                        Backtrack
                    </button>
                    <button
                        type="button"
                        onClick={currentStep === 5 ? handleSubmit : nextStep}
                        disabled={
                            isSubmitting ||
                            (currentStep === 1 && (!campaignData.name || campaignData.channels.length === 0)) ||
                            (currentStep === 2 && !campaignData.templateId) ||
                            (currentStep === 3 && !allMergeFieldsFilled) ||
                            (currentStep === 4 && effectiveRecipients.length === 0)
                        }
                        className="inline-flex items-center rounded-xl bg-primary px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Processing...' : currentStep === 5 ? 'Initiate Dispatch' : 'Continue Path'}
                        {!isSubmitting && currentStep < 5 && <ChevronRight className="ml-2 w-4 h-4" />}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
