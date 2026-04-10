"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api, Recipient, RecipientUpdate } from '@/libs/api';
import { ArrowLeft, Edit2, Mail, Phone, Clock, Tag, RefreshCw, BarChart2, CheckCircle2, XCircle } from 'lucide-react';

export default function RecipientProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [recipient, setRecipient] = useState<Recipient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Recipient>>({});

    const fetchRecipient = async () => {
        setIsLoading(true);
        try {
            const data = await api.recipients.get(id);
            setRecipient(data);
            setEditData(data);
        } catch (err: any) {
            console.error(err);
            alert(`Failed to load recipient: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchRecipient();
    }, [id]);

    const handleSave = async () => {
        if (!recipient) return;
        try {
            await api.recipients.update(id, editData as RecipientUpdate);
            setIsEditing(false);
            fetchRecipient();
        } catch (err: any) {
            alert(`Save failed: ${err.message}`);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!recipient) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <h2 className="text-xl font-bold text-foreground">Recipient Not Found</h2>
                    <button onClick={() => router.push('/recipients')} className="text-primary hover:underline">
                        Return to Directory
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const fullName = `${recipient.first_name} ${recipient.last_name || ''}`.trim();

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.push('/recipients')}
                            className="cursor-pointer p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-2xl font-black shadow-inner shadow-primary/10 border border-primary/20">
                            {fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground tracking-tight">{fullName}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-sm
                                    ${recipient.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                    recipient.status === 'inactive' ? 'bg-muted text-muted-foreground border border-border' : 
                                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                    {recipient.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    {recipient.status}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Added {new Date(recipient.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-foreground hover:bg-accent/80 hover:scale-[1.02] active:scale-95 transition-all hidden sm:flex"
                            >
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => { setIsEditing(false); setEditData(recipient); }} className="cursor-pointer rounded-xl bg-muted px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground">Cancel</button>
                                <button onClick={handleSave} className="cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20">Save</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Details & Consent */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-card rounded-2xl border border-border p-5 shadow-xl flex flex-col gap-4">
                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Contact Information</h3>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-accent rounded-lg text-muted-foreground shrink-0"><Mail className="w-4 h-4" /></div>
                                <div className="flex-1 w-full overflow-hidden">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</p>
                                    {isEditing ? (
                                        <input type="email" value={editData.email || ''} onChange={(e) => setEditData({...editData, email: e.target.value})} className="w-full mt-1 bg-muted border border-border rounded p-1 text-sm text-foreground" />
                                    ) : (
                                        <p className="font-medium text-sm truncate">{recipient.email}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-accent rounded-lg text-muted-foreground shrink-0"><Phone className="w-4 h-4" /></div>
                                <div className="flex-1 w-full">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone</p>
                                    {isEditing ? (
                                        <input type="text" value={editData.phone || ''} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="w-full mt-1 bg-muted border border-border rounded p-1 text-sm text-foreground" />
                                    ) : (
                                        <p className="font-medium text-sm">{recipient.phone || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                            {isEditing && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 w-full">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">First Name</p>
                                        <input type="text" value={editData.first_name || ''} onChange={(e) => setEditData({...editData, first_name: e.target.value})} className="w-full mt-1 bg-muted border border-border rounded p-1 text-sm text-foreground" />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last Name</p>
                                        <input type="text" value={editData.last_name || ''} onChange={(e) => setEditData({...editData, last_name: e.target.value})} className="w-full mt-1 bg-muted border border-border rounded p-1 text-sm text-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-card rounded-2xl border border-border p-5 shadow-xl">
                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Consent Flags</h3>
                            {isEditing ? (
                                <div className="flex flex-col gap-3">
                                    {['email', 'sms', 'whatsapp'].map((key) => (
                                        <label key={key} className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={editData.consent_flags?.[key as keyof typeof editData.consent_flags] || false}
                                                onChange={(e) => setEditData({...editData, consent_flags: {...(editData.consent_flags as any), [key]: e.target.checked}})}
                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                            />
                                            <span className="text-sm font-medium capitalize">{key} Messaging</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {Object.entries(recipient.consent_flags || {}).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center p-2 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-all">
                                            <span className="text-sm font-medium capitalize">{key}</span>
                                            <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full ${value ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                {value ? 'Opt-In' : 'Opt-Out'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-card rounded-2xl border border-border p-5 shadow-xl">
                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Archetypes & Segments</h3>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={editData.tags?.join(', ') || ''} 
                                    onChange={(e) => setEditData({...editData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} 
                                    placeholder="VIP, Segment A"
                                    className="w-full bg-muted border border-border rounded p-2 text-sm text-foreground" 
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {(recipient.tags || []).length > 0 ? recipient.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                            <Tag className="w-3 h-3 mr-1" /> {tag}
                                        </span>
                                    )) : (
                                        <span className="text-sm text-muted-foreground">No segments assigned</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Engagement Telemetry */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        <div className="bg-card rounded-2xl border border-border p-5 shadow-xl h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <BarChart2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground leading-none">Telemetry & Engagement</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Real-time interaction history</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-muted rounded-xl p-4 border border-border">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Opens</p>
                                    <p className="text-3xl font-black text-foreground">{recipient.engagement?.open_count_total || 0}</p>
                                </div>
                                <div className="bg-muted rounded-xl p-4 border border-border">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Clicks</p>
                                    <p className="text-3xl font-black text-foreground">{recipient.engagement?.click_count_total || 0}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                                <div>
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">Recent Activity</h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">Last Opened Email</p>
                                                <p className="text-xs text-muted-foreground">{recipient.engagement?.last_open_at ? new Date(recipient.engagement.last_open_at).toLocaleString() : 'Never'}</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">Last Clicked Link</p>
                                                <p className="text-xs text-muted-foreground">{recipient.engagement?.last_click_at ? new Date(recipient.engagement.last_click_at).toLocaleString() : 'Never'}</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">Engaged Campaigns</h4>
                                    {(recipient.engagement?.unique_open_campaigns || []).length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {recipient.engagement.unique_open_campaigns.map((camp: string, i: number) => (
                                                <span key={i} className="text-xs px-2.5 py-1 bg-accent rounded-md border border-border text-foreground font-medium">
                                                    {camp}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No campaigns engaged yet</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
