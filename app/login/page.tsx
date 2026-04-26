"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/libs/api";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

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
        <div className="flex h-screen">

            {/* Left editorial panel */}
            <div className="hidden lg:flex lg:w-[48%] flex-col justify-between bg-[#16120D] px-14 py-12 relative overflow-hidden flex-shrink-0">

                {/* Decorative partial circles — editorial, not orbs */}
                <svg className="absolute -bottom-16 -right-16 w-[380px] h-[380px] opacity-[0.06] pointer-events-none" viewBox="0 0 380 380" fill="none">
                    <circle cx="320" cy="320" r="260" stroke="#C8924A" strokeWidth="1" />
                    <circle cx="320" cy="320" r="180" stroke="#C8924A" strokeWidth="0.5" />
                </svg>

                {/* Thin right edge rule */}
                <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C8924A]/15 to-transparent" />

                {/* Wordmark */}
                <div className="relative flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-[#C8924A] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#16120D] text-[14px] font-black leading-none">C</span>
                    </div>
                    <span className="text-[#F5EDE4] text-[18px] font-bold tracking-tight">CCIRP</span>
                </div>

                {/* Editorial headline + copy */}
                <div className="relative max-w-[380px] space-y-8">
                    <div className="space-y-2">
                        <p className="text-[11px] font-semibold text-[#C8924A] uppercase tracking-[0.2em]">
                            Communications Platform
                        </p>
                        <h2 className="text-[44px] font-bold leading-[1.08] tracking-tight text-[#F5EDE4]">
                            Send the right<br />
                            message,<br />
                            <em className="not-italic font-light text-[#C8924A]">every time.</em>
                        </h2>
                    </div>

                    <div className="border-l-2 border-[#C8924A]/30 pl-5 space-y-3">
                        <p className="text-[14px] text-[#B8A99A] leading-[1.8]">
                            CCIRP brings your email, SMS, and WhatsApp channels together with smart segmentation that responds to how your audience actually behaves.
                        </p>
                        <p className="text-[13px] text-[#6A5C54] leading-relaxed">
                            For teams who measure what matters.
                        </p>
                    </div>
                </div>

                {/* Bottom footer */}
                <div className="relative">
                    <div className="h-px w-10 bg-[#C8924A]/25 mb-4" />
                    <p className="text-[11px] text-[#3D3028] font-medium tracking-wide">
                        Central Communications &amp; Intelligent Reminder Platform
                    </p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex flex-col items-center justify-center bg-[#FEFCF9] px-8 py-12">
                <div className="w-full max-w-[360px] animate-fade-up">

                    {/* Mobile wordmark */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-10">
                        <div className="h-7 w-7 rounded-md bg-[#C8924A] flex items-center justify-center flex-shrink-0">
                            <span className="text-[#16120D] text-[14px] font-black leading-none">C</span>
                        </div>
                        <span className="text-[18px] font-bold text-[#1A1310] tracking-tight">CCIRP</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-9">
                        <h1 className="text-[28px] font-bold text-[#1A1310] tracking-tight leading-snug">
                            Good to see you.
                        </h1>
                        <p className="mt-2 text-[14px] text-[#8C7A70]">
                            Sign in and pick up where you left off.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-[13px] font-medium">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-semibold text-[#5C4F48] mb-1.5 uppercase tracking-[0.1em]">
                                Email
                            </label>
                            <input
                                type="email"
                                autoComplete="email"
                                className="w-full bg-white border border-[#E2D9D2] rounded-lg px-4 py-3 text-[14px] text-[#1A1310] placeholder:text-[#C5B8B0] focus:outline-none focus:ring-2 focus:ring-[#C8924A]/20 focus:border-[#C8924A]/50 transition-all duration-150"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-semibold text-[#5C4F48] uppercase tracking-[0.1em]">
                                    Password
                                </label>
                                <Link href="#" className="text-[12px] text-[#C8924A] hover:text-[#A87240] font-medium transition-colors">
                                    Forgot it?
                                </Link>
                            </div>
                            <input
                                type="password"
                                autoComplete="current-password"
                                className="w-full bg-white border border-[#E2D9D2] rounded-lg px-4 py-3 text-[14px] text-[#1A1310] placeholder:text-[#C5B8B0] focus:outline-none focus:ring-2 focus:ring-[#C8924A]/20 focus:border-[#C8924A]/50 transition-all duration-150"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-[#C8924A] hover:bg-[#B07840] active:bg-[#9A6835] text-white font-semibold py-3 rounded-lg transition-colors duration-150 text-[14px] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isLoading ? "Signing in…" : "Sign in"}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-[13px] text-[#8C7A70]">
                        New here?{" "}
                        <Link href="/register" className="text-[#C8924A] hover:text-[#A87240] font-semibold transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
