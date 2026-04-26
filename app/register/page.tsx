"use client";

import { useState } from "react";
import { api } from "@/libs/api";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

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
        <div className="flex h-screen">

            {/* Left editorial panel */}
            <div className="hidden lg:flex lg:w-[48%] flex-col justify-between bg-[#16120D] px-14 py-12 relative overflow-hidden flex-shrink-0">

                {/* Decorative partial circles — editorial, not orbs */}
                <svg className="absolute -bottom-16 -right-16 w-[380px] h-[380px] opacity-[0.06] pointer-events-none" viewBox="0 0 380 380" fill="none">
                    <circle cx="320" cy="320" r="260" stroke="#C8924A" strokeWidth="1" />
                    <circle cx="320" cy="320" r="180" stroke="#C8924A" strokeWidth="0.5" />
                </svg>
                <svg className="absolute top-20 -right-24 w-[220px] h-[220px] opacity-[0.04] pointer-events-none" viewBox="0 0 220 220" fill="none">
                    <circle cx="180" cy="40" r="120" stroke="#C8924A" strokeWidth="0.75" />
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
                            Get started today
                        </p>
                        <h2 className="text-[44px] font-bold leading-[1.08] tracking-tight text-[#F5EDE4]">
                            Reach more people,<br />
                            without losing<br />
                            <em className="not-italic font-light text-[#C8924A]">the human touch.</em>
                        </h2>
                    </div>

                    <div className="border-l-2 border-[#C8924A]/30 pl-5 space-y-3">
                        <p className="text-[14px] text-[#B8A99A] leading-[1.8]">
                            One platform for email, SMS, and WhatsApp. Segments that adapt to real behavior. Reporting that tells you what actually worked.
                        </p>
                        <p className="text-[13px] text-[#6A5C54] leading-relaxed">
                            Takes minutes to set up. Stays useful for years.
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
            <div className="flex-1 flex flex-col items-center justify-center bg-[#FEFCF9] px-8 py-12 overflow-y-auto">
                <div className="w-full max-w-[380px] animate-fade-up">

                    {/* Mobile wordmark */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-10">
                        <div className="h-7 w-7 rounded-md bg-[#C8924A] flex items-center justify-center flex-shrink-0">
                            <span className="text-[#16120D] text-[14px] font-black leading-none">C</span>
                        </div>
                        <span className="text-[18px] font-bold text-[#1A1310] tracking-tight">CCIRP</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-[28px] font-bold text-[#1A1310] tracking-tight leading-snug">
                            Create your account.
                        </h1>
                        <p className="mt-2 text-[14px] text-[#8C7A70]">
                            A few details and you're in.
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-semibold text-[#5C4F48] mb-1.5 uppercase tracking-[0.1em]">
                                Full name
                            </label>
                            <input
                                type="text"
                                autoComplete="name"
                                className="w-full bg-white border border-[#E2D9D2] rounded-lg px-4 py-3 text-[14px] text-[#1A1310] placeholder:text-[#C5B8B0] focus:outline-none focus:ring-2 focus:ring-[#C8924A]/20 focus:border-[#C8924A]/50 transition-all duration-150"
                                placeholder="Alex Morgan"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-[#5C4F48] mb-1.5 uppercase tracking-[0.1em]">
                                Email address
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
                            <label className="block text-[11px] font-semibold text-[#5C4F48] mb-1.5 uppercase tracking-[0.1em]">
                                Phone number
                            </label>
                            <input
                                type="tel"
                                autoComplete="tel"
                                className="w-full bg-white border border-[#E2D9D2] rounded-lg px-4 py-3 text-[14px] text-[#1A1310] placeholder:text-[#C5B8B0] focus:outline-none focus:ring-2 focus:ring-[#C8924A]/20 focus:border-[#C8924A]/50 transition-all duration-150"
                                placeholder="+91 99999 99999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-[#5C4F48] mb-1.5 uppercase tracking-[0.1em]">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    className="w-full bg-white border border-[#E2D9D2] rounded-lg px-4 py-3 text-[14px] text-[#1A1310] placeholder:text-[#C5B8B0] focus:outline-none focus:ring-2 focus:ring-[#C8924A]/20 focus:border-[#C8924A]/50 transition-all duration-150"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#5C4F48] mb-1.5 uppercase tracking-[0.1em]">
                                    Confirm
                                </label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    className={`w-full bg-white border rounded-lg px-4 py-3 text-[14px] text-[#1A1310] placeholder:text-[#C5B8B0] focus:outline-none focus:ring-2 transition-all duration-150 ${
                                        confirmPassword && password !== confirmPassword
                                            ? "border-rose-300 focus:ring-rose-300/30 focus:border-rose-400"
                                            : "border-[#E2D9D2] focus:ring-[#C8924A]/20 focus:border-[#C8924A]/50"
                                    }`}
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

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-[#C8924A] hover:bg-[#B07840] active:bg-[#9A6835] text-white font-semibold py-3 rounded-lg transition-colors duration-150 text-[14px] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isLoading ? "Creating account…" : "Create account"}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-[13px] text-[#8C7A70]">
                        Already have an account?{" "}
                        <Link href="/login" className="text-[#C8924A] hover:text-[#A87240] font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
