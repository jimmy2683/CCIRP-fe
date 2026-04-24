"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EditorCanvas } from '@/components/templates/EditorCanvas';
import { ArrowLeft, Save, Loader2, AlertCircle, Layout } from 'lucide-react';
import { api } from '@/libs/api';

export default function NewTemplatePage() {
    const router = useRouter();
    const [name, setName] = useState('Untitled Template');
    const [isSaving, setIsSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bodyHtml, setBodyHtml] = useState('');
    const [templateBlocks, setTemplateBlocks] = useState<any[]>([]);

    const handleEditorChange = (html: string, blocks: any[]) => {
        setBodyHtml(html);
        setTemplateBlocks(blocks);
    };

    const handleSave = async (blocks?: any[], html?: string) => {
        const finalName = name.trim();
        const finalHtml = html || bodyHtml;

        if (!finalName) {
            setError('Please provide a template name.');
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            await api.templates.create({
                name: finalName,
                category: 'General',
                channel: 'Email',
                subject: `Update: ${finalName}`,
                body_html: finalHtml,
                design_json: blocks || templateBlocks,
            });
            router.push('/templates');
        } catch (err) {
            console.error('Failed to create template:', err);
            setError('Failed to create template. Please try again.');
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden bg-background z-50">

            {/* Top Bar */}
            <header className="h-[56px] flex items-center justify-between bg-card/95 backdrop-blur-xl border-b border-border/60 px-4 z-30 flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link
                        href="/templates"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 cursor-pointer"
                        aria-label="Back to Templates"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="w-px h-5 bg-border/60" />
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-primary/8 rounded-lg border border-primary/15">
                            <Layout className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-[14px] font-semibold bg-transparent border-none p-0 focus:ring-0 w-44 truncate text-foreground hover:bg-muted/40 rounded px-1 transition-colors outline-none"
                                placeholder="Template name"
                            />
                            <div className="flex items-center gap-1.5 px-1">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Draft</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Edit/Preview toggle */}
                    <div className="flex items-center gap-0.5 bg-muted/60 border border-border/60 rounded-lg p-0.5">
                        {['Edit', 'Preview'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setIsPreview(mode === 'Preview')}
                                className={`px-4 py-1.5 text-[12px] font-semibold rounded-md transition-all duration-150 cursor-pointer ${
                                    (mode === 'Preview') === isPreview
                                        ? 'bg-card text-foreground shadow-sm border border-border/50'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-5 bg-border/60" />

                    <button
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-[13px] font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 hover:-translate-y-px transition-all duration-150 disabled:opacity-50 cursor-pointer"
                    >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Deploy
                    </button>
                </div>
            </header>

            {/* Editor */}
            <main className="flex-1 overflow-hidden relative">
                <EditorCanvas
                    onSave={handleSave}
                    onChange={handleEditorChange}
                    isPreview={isPreview}
                />
            </main>

            {/* Error toast */}
            {error && (
                <div className="fixed bottom-6 right-6 z-[100] bg-destructive text-white px-5 py-4 rounded-xl shadow-xl shadow-destructive/25 flex items-center gap-3 animate-slide-up">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[13px] font-semibold">{error}</span>
                    <button onClick={() => setError(null)} className="ml-3 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none">×</button>
                </div>
            )}
        </div>
    );
}
