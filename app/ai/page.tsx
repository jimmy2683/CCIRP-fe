"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    Bot,
    Loader2,
    MessageSquarePlus,
    PanelLeftClose,
    PanelLeftOpen,
    Send,
    Sparkles,
    Trash2,
    User,
} from "lucide-react";
import { AIConversationMeta, SSEEvent, api } from "@/libs/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── Types ────────────────────────────────────────────────────────────────────

interface DisplayMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    isStreaming?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function reconstructMessages(geminiMessages: Record<string, unknown>[]): DisplayMessage[] {
    const out: DisplayMessage[] = [];
    for (let i = 0; i < geminiMessages.length; i++) {
        const msg = geminiMessages[i] as { role: string; parts: Record<string, unknown>[] };
        if (msg.role === "user") {
            const textParts = (msg.parts || []).filter((p) => p.text);
            if (!textParts.length) continue;
            out.push({ id: `h-${i}`, role: "user", text: textParts.map((p) => p.text as string).join("") });
        } else if (msg.role === "model") {
            const textParts = (msg.parts || []).filter((p) => p.text);
            if (!textParts.length) continue;
            out.push({ id: `h-${i}`, role: "assistant", text: textParts.map((p) => p.text as string).join("") });
        }
    }
    return out.filter((m) => m.text);
}

const SUGGESTIONS = [
    "Show my campaign performance overview",
    "Who are my most engaged recipients?",
    "Preview top 25 recipients for tag: alumni",
    "List my saved static groups",
];

// ── Markdown component map ────────────────────────────────────────────────────

const MD_COMPONENTS = {
    p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className="mb-2 last:mb-0 leading-[1.7]">{children}</p>
    ),
    h1: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1 className="text-[16px] font-bold mt-4 mb-1.5 first:mt-0">{children}</h1>
    ),
    h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="text-[15px] font-bold mt-3 mb-1 first:mt-0">{children}</h2>
    ),
    h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="text-[14px] font-semibold mt-3 mb-1 first:mt-0">{children}</h3>
    ),
    ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
        <ul className="list-disc pl-5 mb-2 space-y-0.5">{children}</ul>
    ),
    ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => (
        <ol className="list-decimal pl-5 mb-2 space-y-0.5">{children}</ol>
    ),
    li: ({ children }: React.HTMLAttributes<HTMLLIElement>) => (
        <li className="leading-[1.6]">{children}</li>
    ),
    strong: ({ children }: React.HTMLAttributes<HTMLElement>) => (
        <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }: React.HTMLAttributes<HTMLElement>) => (
        <em className="italic opacity-90">{children}</em>
    ),
    code: ({ children, className }: React.HTMLAttributes<HTMLElement>) => {
        const isBlock = className?.includes("language-");
        if (isBlock) {
            return (
                <code className="block bg-background/70 border border-border rounded-lg px-3 py-2 my-2 text-[12px] font-mono text-foreground whitespace-pre overflow-x-auto">
                    {children}
                </code>
            );
        }
        return (
            <code className="bg-background/70 border border-border rounded px-1.5 py-0.5 text-[12px] font-mono text-foreground">
                {children}
            </code>
        );
    },
    pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => (
        <pre className="my-2">{children}</pre>
    ),
    blockquote: ({ children }: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-muted-foreground italic">{children}</blockquote>
    ),
    hr: () => <hr className="border-border/50 my-3" />,
    a: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity">{children}</a>
    ),
    table: ({ children }: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="overflow-x-auto my-2">
            <table className="w-full text-[13px] border-collapse">{children}</table>
        </div>
    ),
    thead: ({ children }: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <thead className="border-b border-border">{children}</thead>
    ),
    th: ({ children }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
        <th className="text-left font-semibold px-2 py-1.5 text-foreground">{children}</th>
    ),
    td: ({ children }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
        <td className="px-2 py-1.5 border-b border-border/40 text-foreground/80">{children}</td>
    ),
};

// ── MessageBubble ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: DisplayMessage }) {
    const isUser = msg.role === "user";
    return (
        <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                </div>
            )}
            <div className={`max-w-[78%] ${isUser ? "" : "flex-1 min-w-0"}`}>
                <div
                    className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                        isUser
                            ? "bg-primary text-primary-foreground rounded-tr-sm shadow-sm shadow-primary/20"
                            : "bg-muted/60 text-foreground rounded-tl-sm border border-border/50"
                    }`}
                >
                    {msg.text && isUser && (
                        <p className="whitespace-pre-wrap m-0">{msg.text}</p>
                    )}
                    {msg.text && !isUser && (
                        <div className="prose-ai">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={MD_COMPONENTS}
                            >
                                {msg.text}
                            </ReactMarkdown>
                            {msg.isStreaming && (
                                <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse align-middle" />
                            )}
                        </div>
                    )}
                    {!msg.text && msg.isStreaming && (
                        <span className="inline-block w-0.5 h-3.5 bg-current animate-pulse align-middle" />
                    )}
                </div>
            </div>
            {isUser && (
                <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AIPage() {
    const [conversations, setConversations] = useState<AIConversationMeta[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    const loadConversations = useCallback(async () => {
        try {
            const data = await api.ai.listConversations();
            setConversations(data.items);
        } catch { /* silent */ }
    }, []);

    useEffect(() => { loadConversations(); }, [loadConversations]);

    const loadConversation = useCallback(async (id: string) => {
        try {
            const data = await api.ai.getConversation(id);
            setActiveConversationId(id);
            setMessages(reconstructMessages(data.messages));
        } catch (e) {
            console.error("Failed to load conversation", e);
        }
    }, []);

    const handleNewChat = useCallback(() => {
        setActiveConversationId(null);
        setMessages([]);
        setInputValue("");
    }, []);

    const handleDeleteConversation = useCallback(async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeletingId(id);
        try {
            await api.ai.deleteConversation(id);
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (activeConversationId === id) {
                setActiveConversationId(null);
                setMessages([]);
            }
        } catch { /* silent */ } finally {
            setIsDeletingId(null);
        }
    }, [activeConversationId]);

    const handleSend = useCallback(async (overrideText?: string) => {
        const text = (overrideText ?? inputValue).trim();
        if (!text || isStreaming) return;
        setInputValue("");
        setIsStreaming(true);

        const userMsgId = `u-${Date.now()}`;
        const assistantMsgId = `a-${Date.now()}`;

        setMessages((prev) => [
            ...prev,
            { id: userMsgId, role: "user", text },
            { id: assistantMsgId, role: "assistant", text: "", isStreaming: true },
        ]);

        try {
            for await (const event of api.ai.streamChat(activeConversationId, text)) {
                handleSSEEvent(event, assistantMsgId);
            }
        } catch {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantMsgId
                        ? { ...m, text: m.text || "An unexpected error occurred.", isStreaming: false }
                        : m
                )
            );
        } finally {
            setIsStreaming(false);
        }
    }, [inputValue, isStreaming, activeConversationId]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleSSEEvent(event: SSEEvent, assistantMsgId: string) {
        if (event.type === "text_delta") {
            setMessages((prev) =>
                prev.map((m) => m.id === assistantMsgId ? { ...m, text: m.text + event.text } : m)
            );
        } else if (event.type === "done") {
            setActiveConversationId(event.conversation_id);
            setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? { ...m, isStreaming: false } : m));
            loadConversations();
        } else if (event.type === "error") {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantMsgId
                        ? { ...m, text: m.text || `Error: ${event.message}`, isStreaming: false }
                        : m
                )
            );
        }
    }

    const isEmpty = messages.length === 0;

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-5.5rem)] gap-0 -mx-6 -mt-6 overflow-hidden rounded-2xl border border-border/60 shadow-sm">

                {/* ── Sidebar ─────────────────────────────────────── */}
                {sidebarOpen && (
                    <div className="w-60 flex-shrink-0 flex flex-col bg-card border-r border-border/60">
                        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60">
                            <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">History</span>
                            <button
                                type="button"
                                onClick={handleNewChat}
                                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-accent/50 transition-colors"
                            >
                                <MessageSquarePlus className="h-3 w-3" />
                                New
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-2">
                            {conversations.length === 0 ? (
                                <p className="px-4 py-6 text-[12px] text-muted-foreground text-center">No conversations yet</p>
                            ) : (
                                conversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        type="button"
                                        onClick={() => loadConversation(conv.id)}
                                        className={`group flex w-full items-start justify-between gap-2 px-4 py-2.5 text-left transition-colors ${
                                            activeConversationId === conv.id
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-accent/40 text-foreground"
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-[12px] font-medium leading-snug">{conv.title}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{relativeTime(conv.updated_at)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                                            disabled={isDeletingId === conv.id}
                                            className="flex-shrink-0 mt-0.5 p-1 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50"
                                        >
                                            {isDeletingId === conv.id
                                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                                : <Trash2 className="h-3 w-3" />}
                                        </button>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ── Main chat area ───────────────────────────────── */}
                <div className="flex flex-col flex-1 min-w-0 bg-card">

                    {/* Header */}
                    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/60 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen((v) => !v)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                        </button>

                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 flex-shrink-0">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-[16px] font-bold text-foreground leading-none">CCIRP Assistant</h1>
                        </div>
                        {!sidebarOpen && (
                            <button
                                type="button"
                                onClick={handleNewChat}
                                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[12px] font-semibold text-foreground hover:bg-accent/50 transition-colors flex-shrink-0"
                            >
                                <MessageSquarePlus className="h-3.5 w-3.5" />
                                New chat
                            </button>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                        {isEmpty ? (
                            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-[20px] font-bold text-foreground">What can I help with?</h2>
                                    <p className="mt-1.5 text-[13px] text-muted-foreground max-w-xs">
                                        Ask about your campaigns, recipients, groups, or analytics. I have live access to your platform data.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <MessageBubble key={msg.id} msg={msg} />
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {isEmpty && (
                        <div className="px-5 pb-3">
                            <div className="flex gap-2 overflow-x-auto scrollbar-none">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => handleSend(s)}
                                        disabled={isStreaming}
                                        className="whitespace-nowrap px-3.5 py-1.5 bg-background border border-border/60 rounded-full text-[12px] font-semibold text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-150 flex-shrink-0 disabled:opacity-50"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-4 pb-4 flex-shrink-0 border-t border-border/40 pt-3">
                        <div className="flex items-center gap-2 bg-muted/50 border border-border/60 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-150">
                            <input
                                type="text"
                                placeholder="Ask about campaigns, recipients, groups, analytics…"
                                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[14px] text-foreground placeholder:text-muted-foreground/60 font-medium min-w-0 px-2"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                disabled={isStreaming}
                            />
                            <button
                                type="button"
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim() || isStreaming}
                                className={`h-8 w-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-150 ${
                                    inputValue.trim() && !isStreaming
                                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
                                        : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                }`}
                            >
                                {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
