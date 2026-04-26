"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { EditorCanvas } from '@/components/templates/EditorCanvas';
import { ArrowLeft, Save, History, Loader2, Sparkles, AlertCircle, Layout } from 'lucide-react';
import { api, Template } from '@/libs/api';

export default function TemplateEditPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [template, setTemplate] = useState<Template | null>(null);
    const [availableFields, setAvailableFields] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [templateData, fieldsData] = await Promise.all([
                    api.templates.get(id),
                    api.templates.getAvailableFields()
                ]);
                setTemplate(templateData);
                setName(templateData.name);
                setBodyHtml(templateData.body_html);
                setTemplateBlocks(templateData.design_json || []);
                setAvailableFields(fieldsData);
            } catch (err) {
                console.error('Failed to load data:', err);
                setError('Could not load workspace data.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    const [bodyHtml, setBodyHtml] = useState('');
    const [templateBlocks, setTemplateBlocks] = useState<any[]>([]);
    const [isPreview, setIsPreview] = useState(false);

    const handleEditorChange = (html: string, blocks: any[]) => {
        setBodyHtml(html);
        setTemplateBlocks(blocks);
    };

    const handleSave = async (blocks?: any[], html?: string) => {
        const finalHtml = html || bodyHtml;
        setIsSaving(true);
        setError(null);
        try {
            const updated = await api.templates.update(id, {
                name: name,
                body_html: finalHtml,
                design_json: blocks || templateBlocks,
            });
            // If the backend forked into a new custom template, navigate there
            const newId = updated?._id || updated?.id;
            if (newId && newId !== id) {
                router.replace(`/templates/${newId}`);
            } else {
                router.push(`/templates/${id}`);
            }
        } catch (err) {
            console.error('Save failed:', err);
            setError('Failed to save changes. Please try again.');
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background z-[100]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!template) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[100]">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h1 className="text-2xl font-bold text-foreground">{error || 'Template not found'}</h1>
                <Link href="/templates" className="mt-4 text-primary font-semibold hover:underline">&larr; Back to Library</Link>
            </div>
        );
    }


    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden bg-background z-50">
            {/* Immersive Top Bar */}
            <header className="h-14 px-4 flex items-center justify-between bg-card/90 backdrop-blur-xl border-b border-border shadow-sm z-30">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/templates/${id}`}
                        className="cursor-pointer p-2 hover:bg-accent/50 rounded-xl transition-all"
                        aria-label="Back to Details"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div className="h-6 w-px bg-border"></div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 group">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <Layout className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-xs font-bold bg-transparent border-none p-0 focus:ring-0 w-48 truncate text-foreground hover:bg-accent/50 rounded px-1 transition-colors outline-none"
                                placeholder="Template Name"
                            />
                            <Sparkles className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Editing Reality • {id}</span>
                            <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center p-1 bg-muted border border-border rounded-xl gap-1">
                        {['Edit', 'Preview'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setIsPreview(mode === 'Preview')}
                                className={`cursor-pointer px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${(mode === 'Preview') === isPreview
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <div className="h-6 w-px bg-border"></div>
                    <button
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        className="cursor-pointer bg-primary text-primary-foreground px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Publish Changes
                    </button>
                </div>
            </header>

            {/* Editor Workbench */}
            <main className="flex-1 overflow-hidden relative">
                <EditorCanvas
                    initialBlocks={template.design_json || []}
                    onSave={handleSave}
                    onChange={handleEditorChange}
                    isPreview={isPreview}
                    availableFields={availableFields}
                />
            </main>

            {error && (
                <div className="fixed bottom-6 right-6 z-[100] bg-destructive text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-xs font-bold">{error}</span>
                    <button onClick={() => setError(null)} className="ml-4 opacity-50 hover:opacity-100">&times;</button>
                </div>
            )}
        </div>
    );
}