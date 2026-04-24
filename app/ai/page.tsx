"use client";

import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Bot, User, Send, Sparkles, Paperclip, FileText } from 'lucide-react';

const INITIAL_MESSAGES = [
    { id: 1, role: 'ai', content: "Hello! I'm your CCIRP AI Assistant. How can I help you optimize your communications today?" },
    { id: 2, role: 'user', content: "I need to write a promotional email for our new Spring Collection. It should be upbeat and mention a 20% discount." },
    { id: 3, role: 'ai', content: "I'd be happy to help with that! Here's a draft you can use for your campaign:\n\n**Subject: 🌸 Spring is here! Enjoy 20% off our new collection**\n\nHi [Name],\n\nReady to refresh your style? Our new Spring Collection has just arrived, and it's full of bright colors and breezy fabrics perfect for the new season.\n\nTo celebrate, we're giving you a special **20% discount** on all new arrivals. Just use the code **SPRING20** at checkout.\n\n[Shop the Spring Collection Button]\n\nDon't wait too long – this offer blooms out on Friday!\n\nBest,\nThe Team" },
];

const SUGGESTIONS = [
    "Draft a re-engagement email for inactive users",
    "Suggest subject lines for a webinar invite",
    "Analyze my recent campaign performance",
    "How do I set up a drip sequence?",
];

export default function AIPage() {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const newMsg = { id: Date.now(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');

        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                content: "I've received your request! As a prototype AI, I can't process it right now, but this is exactly how I'll converse with you in the future."
            }]);
        }, 1000);
    };

    const handleSuggestion = (text: string) => { setInputValue(text); };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-7.5rem)] max-h-[780px]">

                {/* Header */}
                <div className="flex items-center justify-between pb-5 mb-5 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 flex-shrink-0">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-[18px] font-bold text-foreground leading-none">AI Assistant</h1>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Neural Engine Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden flex flex-col">

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'ai' && (
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                )}

                                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed
                                    ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-sm shadow-primary/20'
                                        : 'bg-muted/60 text-foreground rounded-tl-sm border border-border/50'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap m-0">{msg.content}</p>

                                    {msg.role === 'ai' && msg.id === 3 && (
                                        <div className="mt-3 pt-3 border-t border-border/40">
                                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/8 border border-primary/20 text-primary rounded-lg text-[11px] font-semibold hover:bg-primary/15 transition-all duration-150 cursor-pointer">
                                                <FileText className="w-3.5 h-3.5" /> Save as Template
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground flex-shrink-0 mt-0.5">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    <div className="px-5 py-3 border-t border-border/40 bg-muted/20">
                        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestion(s)}
                                    className="whitespace-nowrap px-3.5 py-1.5 bg-card border border-border/60 rounded-full text-[12px] font-semibold text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-150 cursor-pointer flex-shrink-0"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border/40 bg-card">
                        <div className="flex items-center gap-2 bg-muted/50 border border-border/60 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-150">
                            <button className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-150 flex-shrink-0 cursor-pointer">
                                <Paperclip className="w-4 h-4" />
                            </button>
                            <input
                                type="text"
                                placeholder="Ask me anything about your campaigns..."
                                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[14px] text-foreground placeholder:text-muted-foreground/60 font-medium min-w-0"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className={`h-8 w-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-150 cursor-pointer
                                    ${inputValue.trim()
                                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90'
                                        : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-center mt-3 text-[10px] text-muted-foreground/50 font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-primary/60" />
                            AI outputs require human validation
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
