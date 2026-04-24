"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/libs/api";
import Link from "next/link";
import { Zap, Mail, Users, BarChart3, AlertCircle, Loader2 } from "lucide-react";

const FEATURES = [
    {
        icon: Mail,
        title: "Multi-channel delivery",
        description: "Email, SMS, and WhatsApp in one unified platform",
    },
    {
        icon: Users,
        title: "Intelligent segmentation",
        description: "AI-powered audience targeting and dynamic groups",
    },
    {
        icon: BarChart3,
        title: "Real-time analytics",
        description: "Track engagement metrics and campaign performance",
    },
];

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const { access_token, refresh_token } = await api.auth.login({ email, password });
            login(access_token, refresh_token);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Invalid email or password.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background">

            {/* Left brand panel */}
            <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-[#07101E] px-12 py-10 relative overflow-hidden flex-shrink-0">

                {/* Decorative background */}
                <div className="absolute inset-0 bg-grid pointer-events-none" />
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-indigo-900/25 blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-purple-900/10 blur-3xl pointer-events-none" />

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
                            Communications<br />
                            <span className="text-indigo-400">at Scale</span>
                        </h2>
                        <p className="mt-5 text-white/50 text-[15px] leading-relaxed max-w-[360px]">
                            The intelligent platform for modern teams to orchestrate multi-channel campaigns and drive measurable engagement.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {FEATURES.map((feature, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="h-9 w-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <feature.icon className="h-4 w-4 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-white/80">{feature.title}</p>
                                    <p className="text-[12px] text-white/35 mt-0.5 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom */}
                <div className="relative">
                    <div className="h-px w-16 bg-white/10 mb-4" />
                    <p className="text-[11px] text-white/20 font-medium">
                        CCIRP Platform — Enterprise Communications Suite
                    </p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex flex-col items-center justify-center bg-background px-8 py-12">
                <div className="w-full max-w-[380px] animate-fade-up">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
                            <Zap className="h-4.5 w-4.5 text-white" />
                        </div>
                        <p className="text-xl font-bold text-foreground">CCIRP</p>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-[26px] font-bold text-foreground tracking-tight">Welcome back</h1>
                        <p className="mt-1.5 text-[14px] text-muted-foreground">
                            Sign in to your account to continue
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
                            <label className="block text-[13px] font-medium text-foreground mb-1.5">
                                Email address
                            </label>
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
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[13px] font-medium text-foreground">Password</label>
                                <Link href="#" className="text-[12px] text-primary hover:text-primary/80 font-medium transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                autoComplete="current-password"
                                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-all duration-150 shadow-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 text-[14px] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-[13px] text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
