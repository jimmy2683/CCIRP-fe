"use client";

import React, { useState } from 'react';
import { X, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { api } from '@/libs/api';

interface TestSendModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: string;
    sampleData?: Record<string, any>;
}

export function TestSendModal({ isOpen, onClose, templateId, sampleData }: TestSendModalProps) {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setError(null);

        try {
            await api.templates.testSend(templateId, email, sampleData);
            setIsSent(true);
            setTimeout(() => {
                setIsSent(false);
                onClose();
            }, 3000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to send test email');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with premium blur */}
            <div
                className="absolute inset-0 bg-background/40 backdrop-blur-xl animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="bg-card border border-border/50 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] w-full max-w-md overflow-hidden relative z-10 animate-scale-in glass transition-all">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full -ml-16 -mb-16 blur-3xl opacity-50"></div>

                <div className="flex items-center justify-between p-6 border-b border-border/40 relative">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Send className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Initiate Test</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all active:scale-95"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 relative">
                    {isSent ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-up">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">Transmission Successful</h3>
                            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto font-medium">
                                The test message has been dispatched to <span className="text-foreground">{email}</span>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="test-email" className="block text-[10px] font-black text-muted-foreground uppercase tracking-[1.5px] ml-1">
                                    Recipient Path
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        id="test-email"
                                        required
                                        placeholder="user@neural-sync.net"
                                        className="w-full px-5 py-3.5 bg-muted/30 border border-border/60 rounded-2xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-card outline-none transition-all placeholder:text-muted-foreground/30 font-medium group-hover:border-border"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {sampleData && Object.keys(sampleData).length > 0 && (
                                <div className="p-4 rounded-2xl bg-primary/[0.03] border border-primary/10 flex items-start gap-3">
                                    <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Preview Data Active</p>
                                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                                            Test will use the {Object.keys(sampleData).length} variables currently set in your preview.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="text-xs text-destructive font-bold bg-destructive/10 p-4 rounded-2xl border border-destructive/20 animate-shake flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                    {error}
                                </div>
                            )}

                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className={`relative flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[2px] text-primary-foreground shadow-2xl transition-all overflow-hidden cursor-pointer ${isSending
                                            ? 'bg-primary/50 !cursor-not-allowed'
                                            : 'bg-primary hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.98] hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Dispatching...
                                        </>
                                    ) : (
                                        <>
                                            Initiate Dispatch
                                            <Send className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full py-3.5 text-[10px] font-black text-muted-foreground hover:text-foreground rounded-2xl transition-all uppercase tracking-widest hover:bg-muted/50 cursor-pointer"
                                >
                                    Abort Operation
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}