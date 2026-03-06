"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArrowLeft, Edit, Mail, Calendar, Eye, Send, History, Loader2, Code, Layout, CheckCircle2, Trash2 } from 'lucide-react';
import { TestSendModal } from '@/components/templates/TestSendModal';
import { api, Template } from '@/libs/api';

export default function TemplateDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [template, setTemplate] = useState<Template | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPreviewMode, setIsPreviewMode] = useState(true);
    const [isTestSendOpen, setIsTestSendOpen] = useState(false);
    const [renderedHtml, setRenderedHtml] = useState<string>('');
    const [renderedSubject, setRenderedSubject] = useState<string>('');
    const [isRendering, setIsRendering] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [isRollingBack, setIsRollingBack] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [sampleData, setSampleData] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const data = await api.templates.get(id);
                setTemplate(data);

                // Extract merge fields from both subject and body
                const combinedContent = `${data.subject || ''} ${data.body_html}`;
                const fields = extractMergeFields(combinedContent);
                const initialData: Record<string, string> = {};
                fields.forEach(field => {
                    initialData[field] = `[${field}]`;
                });
                setSampleData(initialData);
                handlePreview(data.body_html, initialData, data.subject);

                // Fetch history
                const historyData = await api.templates.getHistory(id);
                setHistory(historyData);
            } catch (error) {
                console.error('Failed to fetch template:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTemplate();
    }, [id]);

    const extractMergeFields = (content: string): string[] => {
        const regex = /{{(.*?)}}/g;
        const fields = new Set<string>();
        let match;
        while ((match = regex.exec(content)) !== null) {
            fields.add(match[1].trim());
        }
        return Array.from(fields);
    };

    const handlePreview = (bodyHtml: string, data: any, subject?: string) => {
        setIsRendering(true);
        // Simulate minor delay for "rendering" feel
        setTimeout(() => {
            let rendered = bodyHtml;
            let sub = subject || template?.subject || '';

            Object.keys(data).forEach((key) => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                rendered = rendered.replace(regex, data[key]);
                sub = sub.replace(regex, data[key]);
            });

            setRenderedHtml(rendered);
            setRenderedSubject(sub);
            setIsRendering(false);
        }, 50);
    };

    const handleRollback = async (version: number) => {
        if (!confirm(`Are you sure you want to rollback to version ${version}?`)) return;

        setIsRollingBack(true);
        try {
            const updated = await api.templates.rollback(id, version);
            setTemplate(updated);
            handlePreview(updated.body_html, sampleData, updated.subject);

            // Refresh history
            const historyData = await api.templates.getHistory(id);
            setHistory(historyData);

            alert(`Successfully rolled back to version ${version}. The current version is now ${updated.version}.`);
        } catch (error) {
            console.error('Rollback failed:', error);
            alert('Failed to rollback. Please try again.');
        } finally {
            setIsRollingBack(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            await api.templates.delete(id);
            router.push('/templates');
        } catch (error) {
            console.error('Deletion failed:', error);
            alert('Failed to delete template. Please try again.');
            setIsDeleting(false);
        }
    };

    const updateSampleData = (key: string, value: string) => {
        const nextData = { ...sampleData, [key]: value };
        setSampleData(nextData);
        if (template) {
            handlePreview(template.body_html, nextData, template.subject);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (!template) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <h1 className="text-2xl font-bold text-foreground">Template not found</h1>
                    <Link href="/templates" className="mt-4 text-primary font-semibold hover:underline">&larr; Back to Library</Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 animate-fade-up">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/templates"
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all hover-lift"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">{template.name}</h1>
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">v.{template.version}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-primary" /> {template.channel}</span>
                                <span className="text-border">•</span>
                                <span className="bg-muted border border-border px-2 py-0.5 rounded text-[10px] uppercase font-bold text-muted-foreground">{template.category}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting || template.is_common}
                            className="flex items-center gap-2 px-5 py-2.5 border border-rose-500/20 rounded-xl text-sm font-semibold text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 shadow-sm transition-all hover-lift cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title={template.is_common ? "General templates cannot be deleted" : ""}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                        </button>
                        <Link
                            href={`/templates/${id}/edit`}
                            className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground bg-card hover:bg-accent/50 shadow-sm transition-all hover-lift cursor-pointer"
                        >
                            <Edit className="w-4 h-4" /> Edit Template
                        </Link>
                        <button
                            onClick={() => setIsTestSendOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all hover-lift active:scale-95 cursor-pointer"
                        >
                            <Send className="w-4 h-4" /> Test Send
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-accent/20">
                                <div className="flex gap-1.5 p-1 bg-muted border border-border rounded-xl shadow-sm">
                                    <button
                                        onClick={() => setIsPreviewMode(true)}
                                        className={`cursor-pointer px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${isPreviewMode ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        <Layout className="w-3.5 h-3.5" /> Preview
                                    </button>
                                    <button
                                        onClick={() => setIsPreviewMode(false)}
                                        className={`cursor-pointer px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${!isPreviewMode ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        <Code className="w-3.5 h-3.5" /> Source
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isRendering && <span className="text-[10px] font-bold text-primary animate-pulse uppercase tracking-widest">Rendering...</span>}
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest border border-border px-2 py-1 rounded">Desktop View</div>
                                </div>
                            </div>

                            <div className="flex-1 min-h-[600px] p-8 bg-muted/50">
                                {isPreviewMode ? (
                                    <div className="max-w-3xl mx-auto border border-border rounded-2xl overflow-hidden shadow-2xl bg-card animate-fade-up">
                                        <div className="px-6 py-4 border-b border-border bg-accent/20 flex items-center gap-3">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40 shadow-inner"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40 shadow-inner"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 shadow-inner"></div>
                                            </div>
                                            <div className="flex-1 mx-4 h-8 bg-muted border border-border rounded-lg text-[11px] flex items-center px-4 text-foreground overflow-hidden truncate font-medium">
                                                <span className="text-muted-foreground mr-2">Subject:</span> {renderedSubject || '(No Subject)'}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            {isRendering && (
                                                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
                                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                </div>
                                            )}
                                            <div
                                                className="bg-white p-8 min-h-[400px]"
                                                dangerouslySetInnerHTML={{ __html: renderedHtml }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <pre className="p-8 bg-slate-900 text-slate-100 rounded-2xl overflow-x-auto text-sm font-mono leading-relaxed shadow-2xl animate-fade-up border border-slate-800">
                                        <code>{template.body_html}</code>
                                    </pre>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Sample Data Tool */}
                        <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 glass">
                            <h3 className="text-xs font-black text-foreground uppercase tracking-[2px] mb-6 flex items-center gap-2 decoration-primary underline-offset-4 decoration-2">
                                <Layout className="w-4 h-4 text-primary" /> Preview Data
                            </h3>
                            <div className="space-y-5">
                                {Object.keys(sampleData).length > 0 ? (
                                    Object.keys(sampleData).map((key) => (
                                        <div key={key}>
                                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">{key}</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2.5 text-sm border-border bg-muted rounded-xl focus:ring-2 focus:ring-primary focus:bg-card outline-none transition-all placeholder:text-muted-foreground/50 border font-medium text-foreground"
                                                value={(sampleData as any)[key]}
                                                onChange={(e) => updateSampleData(key, e.target.value)}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 border border-dashed border-border rounded-xl">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">No variables detected</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                                <p className="text-[10px] leading-relaxed text-primary/80 font-medium">
                                    Merge fields are rendered in real-time. Use `{"{{key}}"}` in your template to bind these variables.
                                </p>
                            </div>
                        </div>

                        {/* Version History */}
                        <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <h3 className="text-xs font-black text-foreground uppercase tracking-[2px] mb-6 flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" /> Version Stats
                            </h3>
                            <div className="space-y-4 relative">
                                <div className="p-4 rounded-xl bg-muted border border-border">
                                    <div className="text-2xl font-black text-foreground">v{template.version}</div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Current Version</div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Timeline</span>
                                    <div className="space-y-3">
                                        {history.length > 0 ? (
                                            history.map((item) => (
                                                <div key={item._id} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-accent/50 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-border"></div>
                                                        <div>
                                                            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Version {item.version}.0</span>
                                                            <p className="text-[9px] text-muted-foreground font-medium mt-0.5">
                                                                {new Date(item.updated_at).toLocaleDateString()}
                                                                {item.rollback_from && <span className="text-primary ml-1"> (Rollback)</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRollback(item.version)}
                                                        disabled={isRollingBack}
                                                        className="cursor-pointer text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest disabled:opacity-50"
                                                    >
                                                        {isRollingBack ? '...' : 'Rollback'}
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 border border-dashed border-border rounded-xl">
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">No previous versions</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TestSendModal
                isOpen={isTestSendOpen}
                onClose={() => setIsTestSendOpen(false)}
                templateId={id}
                sampleData={sampleData}
            />
        </DashboardLayout>
    );
}