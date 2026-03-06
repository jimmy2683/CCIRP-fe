"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EditorCanvas } from '@/components/templates/EditorCanvas';
import { ArrowLeft, Save, Loader2, Sparkles, AlertCircle, Layout } from 'lucide-react';
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
        // If called from EditorCanvas directly, it provides blocks and html
        // If called from the "Deploy" button, it uses the state
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
            {/* Immersive Top Bar */}
            <header className="h-14 px-4 flex items-center justify-between bg-card/90 backdrop-blur-xl border-b border-border shadow-sm z-30">
                <div className="flex items-center gap-4">
                    <Link
                        href="/templates"
                        className="cursor-pointer p-2 hover:bg-accent/50 rounded-xl transition-all"
                        aria-label="Back to Library"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div className="h-6 w-px bg-border"></div>
                    <div className="flex items-center gap-3 group">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Layout className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-xs font-bold bg-transparent border-none p-0 focus:ring-0 w-48 truncate text-foreground hover:bg-accent/50 rounded px-1 transition-colors outline-none"
                                placeholder="Untitled Poster"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Draft Template</span>
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                            </div>
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
                        Deploy
                    </button>
                </div>
            </header>

            {/* Editor Workbench */}
            <main className="flex-1 overflow-hidden relative">
                <EditorCanvas
                    onSave={handleSave}
                    onChange={handleEditorChange}
                    isPreview={isPreview}
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