"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Bot, User, Send, Sparkles, Paperclip, MoreHorizontal, FileText, Image } from 'lucide-react';

const INITIAL_MESSAGES = [
    { id: 1, role: 'ai', content: "Hello! I'm your CCIRP AI Assistant. How can I help you optimize your communications today?" },
    { id: 2, role: 'user', content: "I need to write a promotional email for our new Spring Collection. It should be upbeat and mention a 20% discount." },
    { id: 3, role: 'ai', content: "I'd be happy to help with that! Here's a draft you can use for your campaign:\n\n**Subject: 🌸 Spring is here! Enjoy 20% off our new collection**\n\nHi [Name],\n\nReady to refresh your style? Our new Spring Collection has just arrived, and it's full of bright colors and breezy fabrics perfect for the new season.\n\nTo celebrate, we're giving you a special **20% discount** on all new arrivals. Just use the code **SPRING20** at checkout.\n\n[Shop the Spring Collection Button]\n\nDon't wait too long – this offer blooms out on Friday!\n\nBest,\nThe Team" },
];

const SUGGESTIONS = [
    "Draft a re-engagement email for inactive users",
    "Suggest subject lines for a webinar invite",
    "Analyze my recent campaign performance",
    "How do I set up a drip sequence?"
];

export default function AIPage() {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (!inputValue.trim()) return;

        // Add user message
        const newMsg = { id: Date.now(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');

        // Mock AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                content: "I've received your request! As a prototype AI, I can't process it right now, but this is exactly how I'll converse with you in the future."
            }]);
        }, 1000);
    };

    const handleSuggestion = (text: string) => {
        setInputValue(text);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-8rem)]">

                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground leading-none">Intelligence Assistant</h1>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Neural Engine Active
                            </p>
                        </div>
                    </div>
                    <button className="cursor-pointer text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-accent/50 transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col relative">

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-md
                  ${msg.role === 'user' ? 'bg-muted text-primary border border-border' : 'bg-primary text-primary-foreground'}`}
                                >
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                {/* Message Bubble */}
                                <div className={`rounded-2xl px-5 py-3.5 shadow-lg border
                  ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-none border-primary/50'
                                        : 'bg-muted text-foreground rounded-tl-none border-border prose prose-invert prose-sm'}`
                                }>
                                    <p className="whitespace-pre-wrap leading-relaxed m-0 text-sm">
                                        {msg.content}
                                    </p>

                                    {/* Action buttons on AI response */}
                                    {msg.role === 'ai' && msg.id === 3 && (
                                        <div className="mt-4 flex gap-2 pt-3 border-t border-white/5">
                                            <button className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 border border-border rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all">
                                                <FileText className="w-3.5 h-3.5" /> Save as Template
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Suggestions Layer */}
                    <div className="px-6 pb-2 pt-4 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestion(s)}
                                    className="cursor-pointer whitespace-nowrap px-4 py-2 bg-muted border border-border rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 hover:border-primary/20 transition-all shadow-sm"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-muted border-t border-border">
                        <div className="relative flex items-center bg-card border border-border rounded-2xl p-2 shadow-2xl focus-within:ring-2 focus-within:ring-primary transition-all">
                            <button className="cursor-pointer p-2 text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-accent/50 ml-1">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <button className="cursor-pointer p-2 text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-accent/50">
                                <Image className="w-5 h-5" />
                            </button>

                            <input
                                type="text"
                                placeholder="Neural query..."
                                className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm text-foreground placeholder-muted-foreground font-medium"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />

                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className={`cursor-pointer p-2.5 rounded-xl ml-2 transition-all shadow-lg
                  ${inputValue.trim()
                                        ? 'bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02] shadow-primary/20'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'}`}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-center mt-4">
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[2px] flex items-center justify-center gap-2">
                                <Sparkles className="w-3 h-3 text-primary" /> Human validation required for AI outputs
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
