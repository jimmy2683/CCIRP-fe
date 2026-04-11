"use client";

import { useState } from "react";
import { api } from "@/libs/api";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");

    try {
      await api.auth.register({ email, password, full_name: fullName, phone });
      // Clear error and proceed to auto-login
      const { access_token, refresh_token } = await api.auth.login({ email, password });
      login(access_token, refresh_token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register or log in");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 backdrop-blur-md border border-border shadow-2xl transform transition-all">
        <h1 className="text-3xl font-semibold mb-6 text-center text-gradient">Join CCIRP</h1>
        {error && <div className="mb-6 bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300 shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Full Name</label>
            <input
              type="text"
              className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919999999999"
              required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Password</label>
              <input
                type="password"
                className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Confirm</label>
              <input
                type="password"
                className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required />
            </div>
          </div>
          <button type="submit" className="w-full cursor-pointer bg-primary text-primary-foreground font-medium py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all mt-4">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
