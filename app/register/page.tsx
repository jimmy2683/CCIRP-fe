"use client";

import { useState } from "react";
import { api } from "@/libs/api";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Zap, ShieldCheck, Cpu, Globe, AlertCircle, Loader2 } from "lucide-react";

const HIGHLIGHTS = [
    {
        icon: Globe,
        title: "Multi-channel reach",
        description: "Deliver messages via Email, SMS, and WhatsApp",
    },
    {
        icon: Cpu,
        title: "AI-powered intelligence",
        description: "Smart scheduling and audience segmentation",
    },
    {
        icon: ShieldCheck,
        title: "Enterprise-grade security",
        description: "JWT authentication with role-based access control",
    },
];

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError("");
        setIsLoading(true);
        try {
            await api.auth.register({ email, password, full_name: fullName, phone });
            const { access_token, refresh_token } = await api.auth.login({ email, password });
            login(access_token, refresh_token);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create account.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background">

            {/* Left brand panel */}
            <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-[#07101E] px-12 py-10 relative overflow-hidden flex-shrink-0">

                <div className="absolute inset-0 bg-grid pointer-events-none" />
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-indigo-900/25 blur-3xl pointer-events-none" />

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-xl shadow-indigo-900/60 flex-shrink-0">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white tracking-tight">CCIRP</p>
                        <p className="text-[10px] text-indigo-400/70 font-medium uppercase tracking-widest">Enterprise Platform</p>
                    </div>
                </div>

                {/* Main copy */}
                <div className="relative space-y-10">
                    <div>
                        <h2 className="text-[40px] font-bold text-white leading-[1.15] tracking-tight">
                            Join the next<br />
                            <span className="text-indigo-400">generation</span>
                        </h2>
                        <p className="mt-5 text-white/50 text-[15px] leading-relaxed max-w-[360px]">
                            Build, launch, and optimize communications that connect with your audience at every touchpoint.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {HIGHLIGHTS.map((item, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="h-9 w-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <item.icon className="h-4 w-4 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-white/80">{item.title}</p>
                                    <p className="text-[12px] text-white/35 mt-0.5 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="h-px w-16 bg-white/10 mb-4" />
                    <p className="text-[11px] text-white/20 font-medium">
                        CCIRP Platform — Enterprise Communications Suite
                    </p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex flex-col items-center justify-center bg-background px-8 py-12 overflow-y-auto">
                <div className="w-full max-w-[400px] animate-fade-up">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
                            <Zap className="h-4.5 w-4.5 text-white" />
                        </div>
                        <p className="text-xl font-bold text-foreground">CCIRP</p>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-[26px] font-bold text-foreground tracking-tight">Create your account</h1>
                        <p className="mt-1.5 text-[14px] text-muted-foreground">
                            Get started with CCIRP today
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 flex items-start gap-3 bg-rose-500/8 border border-rose-500/20 text-rose-600 px-4 py-3 rounded-xl text-[13px] font-medium">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[13px] font-medium text-foreground mb-1.5">Full name</label>
                            <input
                                type="text"
                                autoComplete="name"
                                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-all duration-150 shadow-sm"
                                placeholder="Alex Morgan"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-foreground mb-1.5">Email address</label>
                            <input
                                type="email"
                                autoComplete="email"
                                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-all duration-150 shadow-sm"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-foreground mb-1.5">Phone number</label>
                            <input
                                type="tel"
                                autoComplete="tel"
                                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-all duration-150 shadow-sm"
                                placeholder="+919999999999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[13px] font-medium text-foreground mb-1.5">Password</label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-all duration-150 shadow-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-foreground mb-1.5">Confirm</label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    className={`w-full bg-card border rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all duration-150 shadow-sm ${confirmPassword && password !== confirmPassword ? 'border-rose-400/60 focus:ring-rose-400/25' : 'border-border focus:ring-primary/25 focus:border-primary/60'}`}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-[12px] text-rose-500 font-medium -mt-1">Passwords do not match</p>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 text-[14px] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isLoading ? 'Creating account...' : 'Create account'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-[13px] text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
