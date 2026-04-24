"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Mail, Plus, Loader2, FileText, ArrowRight } from 'lucide-react';
import { api, Template } from '@/libs/api';

export default function TemplatesPage() {
    const [activeTab, setActiveTab] = useState<'custom' | 'general'>('custom');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoading(true);
            try {
                const data = await api.templates.list(activeTab);
                setTemplates(data?.items || []);
            } catch (error) {
                console.error('Failed to fetch templates:', error);
                setTemplates([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTemplates();
    }, [activeTab]);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 animate-fade-up">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Content</p>
                        <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-none">Template Library</h1>
                        <p className="mt-2 text-[14px] text-muted-foreground">
                            Design and manage reusable message templates
                        </p>
                    </div>
                    <Link
                        href="/templates/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 cursor-pointer flex-shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        Create Template
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-1 w-fit border border-border/60">
                    {(['custom', 'general'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-[13px] font-semibold capitalize transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                                activeTab === tab
                                    ? 'bg-card text-foreground shadow-sm border border-border/60'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab}
                            {templates.length > 0 && activeTab === tab && (
                                <span className="inline-flex items-center justify-center h-4.5 min-w-[18px] px-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                                    {templates.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[300px]">
                    {isLoading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-[13px] text-muted-foreground font-medium">Loading templates...</p>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-foreground">
                                {activeTab === 'custom' ? 'No custom templates' : 'No general templates'}
                            </h3>
                            <p className="mt-1.5 text-[13px] text-muted-foreground max-w-xs">
                                {activeTab === 'custom'
                                    ? 'Build your first template with the drag-and-drop editor.'
                                    : 'General templates will appear here when available.'}
                            </p>
                            {activeTab === 'custom' && (
                                <Link
                                    href="/templates/new"
                                    className="mt-5 inline-flex items-center gap-2 text-[13px] text-primary font-semibold hover:underline"
                                >
                                    Create your first template <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    ) : (
                        templates.map((template) => (
                            <Link
                                key={template._id}
                                href={`/templates/${template._id}`}
                                className="group flex flex-col bg-card rounded-2xl border border-border/60 p-5 shadow-sm hover:shadow-md hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                            >
                                {/* Icon */}
                                <div className="h-11 w-11 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:border-primary transition-all duration-200">
                                    <Mail className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-200" />
                                </div>

                                {/* Content */}
                                <h3 className="text-[14px] font-semibold text-foreground line-clamp-1 leading-snug">{template.name}</h3>
                                <p className="mt-1 text-[12px] text-muted-foreground line-clamp-1">
                                    {template.category} · {template.channel}
                                </p>

                                {/* Footer */}
                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/8 text-primary border border-primary/15">
                                            v{template.version}
                                        </span>
                                        {template.is_common && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                General
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[12px] text-muted-foreground/60 group-hover:text-primary font-medium transition-colors duration-150">
                                        Open →
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
