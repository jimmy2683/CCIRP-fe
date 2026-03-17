"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArrowLeft, Check, ChevronRight, Mail, Users, Calendar, Loader2, Type } from 'lucide-react';
import { api, Template, UserProfileData } from '@/libs/api';

const STEPS = [
    { id: 1, name: 'Setup', description: 'Campaign details' },
    { id: 2, name: 'Content', description: 'Select template' },
    { id: 3, name: 'Merge Fields', description: 'Fill in data' },
    { id: 4, name: 'Audience', description: 'Choose recipients' },
    { id: 5, name: 'Review', description: 'Confirm & schedule' },
];

// Per-recipient fields that are auto-filled — skip in the form
const AUTO_FIELDS = new Set(['name', 'email', 'full_name', 'first_name', 'recipient_name', 'recipient_email']);

function extractMergeFields(html: string): string[] {
    const matches = html.match(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g);
    if (!matches) return [];
    const unique = new Set(matches.map(m => m.replace(/[{}\s]/g, '')));
    return Array.from(unique);
}

export default function NewCampaignWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [templates, setTemplates] = useState<Template[]>([]);
    const [users, setUsers] = useState<UserProfileData[]>([]);

    const [campaignData, setCampaignData] = useState({
        name: '',
        subject: '',
        templateId: null as string | null,
        recipients: [] as string[],
        mergeData: {} as Record<string, string>,
        scheduled_at: null as string | null,
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [tpls, usrList] = await Promise.all([
                    api.templates.list(),
                    api.users.list()
                ]);
                setTemplates(tpls);
                setUsers(usrList);
            } catch (error) {
                console.error('Failed to fetch wizard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Extract merge fields from the selected template, excluding auto-filled ones
    const selectedTemplate = useMemo(() => templates.find(t => t._id === campaignData.templateId), [templates, campaignData.templateId]);
    const mergeFields = useMemo(() => {
        if (!selectedTemplate) return [];
        return extractMergeFields(selectedTemplate.body_html).filter(f => !AUTO_FIELDS.has(f));
    }, [selectedTemplate]);

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.campaigns.create({
                name: campaignData.name,
                subject: campaignData.subject || "No Subject",
                template_id: campaignData.templateId || "",
                recipients: campaignData.recipients,
                merge_data: campaignData.mergeData,
                scheduled_at: campaignData.scheduled_at || null
            });
            router.push('/campaigns');
        } catch (error) {
            console.error('Failed to create campaign:', error);
            alert('Failed to create campaign. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleRecipient = (email: string) => {
        setCampaignData(prev => ({
            ...prev,
            recipients: prev.recipients.includes(email)
                ? prev.recipients.filter(e => e !== email)
                : [...prev.recipients, email]
        }));
    };

    const updateMergeField = (key: string, value: string) => {
        setCampaignData(prev => ({
            ...prev,
            mergeData: { ...prev.mergeData, [key]: value }
        }));
    };

    const allMergeFieldsFilled = mergeFields.length === 0 || mergeFields.every(f => (campaignData.mergeData[f] || '').trim() !== '');

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-2rem)] gap-4 animate-fade-in overflow-hidden">

                {/* Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <Link href="/campaigns" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Create New Campaign</h1>
                        <p className="text-sm text-muted-foreground">Follow the steps to configure and schedule your broadcast</p>
                    </div>
                </div>

                {/* Progress Stepper */}
                <nav aria-label="Progress" className="px-2">
                    <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                        {STEPS.map((step) => (
                            <li key={step.name} className="md:flex-1">
                                <div className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 
                                    ${currentStep > step.id ? 'border-primary' : currentStep === step.id ? 'border-primary' : 'border-border'}`}>
                                    <span className={`text-sm font-medium ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>
                                        Step {step.id}
                                    </span>
                                    <span className="text-sm font-medium text-foreground">{step.name}</span>
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Main Content Area */}
                <div className="flex-1 min-h-0 bg-card rounded-xl border border-border shadow-sm p-6 lg:p-10 mb-20 overflow-y-auto">

                    {/* Step 1: Setup */}
                    {currentStep === 1 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h2 className="text-2xl font-bold text-foreground">Campaign Details</h2>
                            <p className="text-muted-foreground">Provide the basic information for your new campaign.</p>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Campaign Name</label>
                                    <input type="text" className="mt-1 block w-full rounded-xl border-border bg-background shadow-sm focus:border-primary focus:ring-primary border p-3 text-foreground" placeholder="e.g. Q3 Product Newsletter" value={campaignData.name} onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Message Subject</label>
                                    <input type="text" className="mt-1 block w-full rounded-xl border-border bg-background shadow-sm focus:border-primary focus:ring-primary border p-3 text-foreground" placeholder="Subject seen by recipients" value={campaignData.subject} onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Content */}
                    {currentStep === 2 && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            <h2 className="text-2xl font-bold text-foreground">Select Template</h2>
                            <p className="text-muted-foreground">Choose a template from your library to use for this campaign.</p>
                            {isLoading ? (
                                <div className="flex justify-center p-12"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
                            ) : templates.length === 0 ? (
                                <div className="text-center p-12 text-muted-foreground">No templates found. <Link href="/templates/new" className="text-primary underline">Create one first.</Link></div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {templates.map(tpl => (
                                        <div key={tpl._id} onClick={() => setCampaignData({ ...campaignData, templateId: tpl._id, mergeData: {} })}
                                            className={`group relative border rounded-2xl p-4 h-36 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-xl
                                                ${campaignData.templateId === tpl._id ? 'border-primary ring-2 ring-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-card'}`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${campaignData.templateId === tpl._id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                <Mail className="w-6 h-6" />
                                            </div>
                                            <span className="font-bold text-sm text-foreground text-center line-clamp-1">{tpl.name}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">{tpl.channel} • v{tpl.version}</span>
                                            {campaignData.templateId === tpl._id && (
                                                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1"><Check className="w-3 h-3" /></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Merge Fields */}
                    {currentStep === 3 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Fill in Merge Fields</h2>
                                <p className="text-muted-foreground">Provide values for the template's dynamic placeholders. Recipient-specific fields (name, email) are filled automatically.</p>
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
                                                {field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
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

                    {/* Step 4: Audience */}
                    {currentStep === 4 && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">Select Audience</h2>
                                    <p className="text-muted-foreground">Choose the recipients for this campaign.</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest leading-none block mb-1">Total Selected</span>
                                    <span className="text-2xl font-black text-foreground">{campaignData.recipients.length}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
    <button type="button"
        onClick={() => setCampaignData(prev => ({ ...prev, recipients: users.map(u => u.email) }))}
        className="text-xs font-bold text-primary hover:underline cursor-pointer">
        Select All
    </button>
    <span className="text-muted-foreground">|</span>
    <button type="button"
        onClick={() => setCampaignData(prev => ({ ...prev, recipients: [] }))}
        className="text-xs font-bold text-muted-foreground hover:underline cursor-pointer">
        Deselect All
    </button>
</div>
                            {isLoading ? (
                                <div className="flex justify-center p-12"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
                            ) : users.length === 0 ? (
                                <div className="text-center p-12 text-muted-foreground">No users found in database.</div>
                            ) : (
                                <div className="border border-border rounded-2xl overflow-hidden shadow-sm bg-card max-h-[400px] overflow-y-auto">
                                    {users.map((user) => (
                                        <div key={user.email} onClick={() => toggleRecipient(user.email)}
                                            className="border-b border-border last:border-b-0 p-4 flex items-center justify-between hover:bg-accent/50 cursor-pointer transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${campaignData.recipients.includes(user.email) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                    {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground text-sm">{user.full_name || 'N/A'}</h4>
                                                    <p className="text-[11px] font-medium text-muted-foreground">{user.email}</p>
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

                    {/* Step 5: Review */}
                    {currentStep === 5 && (
                        <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
                            <div className="text-center mb-10">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                    <Check className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Final Confirmation</h2>
                                <p className="text-muted-foreground mt-2 font-medium">Please review your configuration before launching.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-muted/50 border border-border shadow-inner">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">General</span>
                                    <div className="mt-2 space-y-1">
                                        <h4 className="text-lg font-bold text-foreground">{campaignData.name || 'Untitled'}</h4>
                                        <p className="text-sm text-primary font-medium">{campaignData.subject || 'No Subject'}</p>
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
                                            {campaignData.recipients.length} Target Recipients
                                        </div>
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
                                    <span className="text-sm font-bold text-primary">Scheduled: Immediate Dispatch</span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="fixed bottom-0 right-0 left-64 bg-card border-t border-border p-4 flex justify-between items-center shadow-lg z-20">
                    <button type="button" onClick={prevStep} disabled={currentStep === 1 || isSubmitting}
                        className="rounded-lg px-6 py-2.5 text-xs font-black uppercase tracking-widest text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-accent disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed">
                        Backtrack
                    </button>
                    <button type="button"
                        onClick={currentStep === 5 ? handleSubmit : nextStep}
                        disabled={
                            isSubmitting ||
                            (currentStep === 1 && !campaignData.name) ||
                            (currentStep === 2 && !campaignData.templateId) ||
                            (currentStep === 3 && !allMergeFieldsFilled) ||
                            (currentStep === 4 && campaignData.recipients.length === 0)
                        }
                        className="inline-flex items-center rounded-xl bg-primary px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Processing...' : currentStep === 5 ? 'Initiate Dispatch' : 'Continue Path'}
                        {!isSubmitting && currentStep < 5 && <ChevronRight className="ml-2 w-4 h-4" />}
                    </button>
                </div>

            </div>
        </DashboardLayout>
    );
}

