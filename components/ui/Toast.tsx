"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />,
    error: <XCircle className="w-4 h-4 shrink-0 text-rose-400" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />,
    info: <Info className="w-4 h-4 shrink-0 text-sky-400" />,
};

const STYLES: Record<ToastType, string> = {
    success: 'border-emerald-400/60 bg-emerald-800/95',
    error: 'border-rose-400/60 bg-rose-800/95',
    warning: 'border-amber-400/60 bg-amber-800/95',
    info: 'border-sky-400/60 bg-sky-800/95',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => onRemove(toast.id), 4500);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [toast.id, onRemove]);

    return (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-xl text-sm font-medium text-foreground max-w-sm w-full animate-slide-up ${STYLES[toast.type]}`}>
            {ICONS[toast.type]}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button onClick={() => onRemove(toast.id)} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const remove = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((type: ToastType, message: string) => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev.slice(-4), { id, type, message }]);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onRemove={remove} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx.toast;
}

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', destructive = false, onConfirm, onCancel }: ConfirmDialogProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-card border border-border/60 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
                <div className="mt-5 flex items-center justify-end gap-2">
                    <button onClick={onCancel} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
