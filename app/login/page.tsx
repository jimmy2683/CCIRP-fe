"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/libs/api";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { access_token } = await api.auth.login({ email, password });
      login(access_token);
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 backdrop-blur-md border border-border shadow-2xl">
        <h1 className="text-3xl font-semibold mb-6 text-center text-gradient">CCIRP Sign In</h1>
        {error && <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm text-muted-foreground mb-1">Password</label>
            <input
              type="password"
              className="w-full bg-muted border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required />
          </div>
          <button type="submit" className="w-full cursor-pointer bg-primary text-primary-foreground font-medium py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all mt-4">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account? <Link href="/register" className="text-primary hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
