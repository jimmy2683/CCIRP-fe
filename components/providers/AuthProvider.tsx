"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/libs/api";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async () => {
    try {
      const profile = await api.auth.getProfile();
      if (profile) {
        setUser(profile);
      } else {
        throw new Error("Empty profile received");
      }
    } catch (error: any) {
      console.error("Auth: Failed to fetch profile.", error.message);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const hasToken = !!localStorage.getItem("access_token");

    // Unified redirection logic
    if (!user && !isPublicRoute && !hasToken) {
      router.push("/login");
    } else if (user && isPublicRoute) {
      router.push("/");
    }
  }, [user, pathname, isLoading, isMounted, router]);

  const login = async (token: string) => {
    localStorage.setItem("access_token", token);
    setIsLoading(true);
    await fetchProfile();
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/login");
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }), [user, isLoading]);

  // Handle Hydration and Loading States without unmounting the Provider context
  return (
    <AuthContext.Provider value={value}>
      {!isMounted || (isLoading && !PUBLIC_ROUTES.includes(pathname)) ? (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse"></div>
            <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
          </div>
          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">
              Initializing Protocol
            </span>
            <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
              <div className="h-full bg-primary animate-loading-bar origin-left"></div>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
