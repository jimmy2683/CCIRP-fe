"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Mail, MessageSquare, Plus, Bell, Calendar, ShoppingBag, ArrowRight, Loader2, FileText } from 'lucide-react';
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Template Library</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your message templates or browse general system templates.
                        </p>
                    </div>
                    <Link
                        href="/templates/new"
                        className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Create Custom Template
                    </Link>
                </div>

                {/* Tabs */}
                <div className="border-b border-border">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {(['custom', 'general'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    cursor-pointer whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold capitalize transition-all
                                    ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                                    }
                                `}
                            >
                                {tab}
                                {templates.length > 0 && activeTab === tab && (
                                    <span className="ml-2 py-0.5 px-2 bg-primary/10 text-primary text-[10px] rounded-full">
                                        {templates.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[400px]">
                    {isLoading ? (
                        <div className="col-span-full flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="col-span-full border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted mt-4">
                            <div className="p-4 bg-accent/20 rounded-full mb-4">
                                <FileText className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">
                                {activeTab === 'custom' ? 'No custom templates yet' : 'No general templates available'}
                            </h3>
                            <p className="mt-2 text-sm max-w-xs">
                                {activeTab === 'custom'
                                    ? 'Create your first custom template using our drag-and-drop editor.'
                                    : 'Please check back later or contact an administrator.'}
                            </p>
                            {activeTab === 'custom' && (
                                <Link href="/templates/new" className="mt-4 text-primary font-semibold hover:underline">Get started &rarr;</Link>
                            )}
                        </div>
                    ) : (
                        templates.map((template) => (
                            <Link
                                key={template._id}
                                href={`/templates/${template._id}`}
                                className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all hover-lift cursor-pointer"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground line-clamp-1">{template.name}</h3>
                                <p className="mt-2 text-sm text-muted-foreground flex-1 line-clamp-2">{template.category} • {template.channel}</p>
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                                            v{template.version}
                                        </span>
                                        {template.is_common && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                                                General
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors">View Details &rarr;</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
