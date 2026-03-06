"use client"
import React, { useState } from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export function Header() {
    const { logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-card/50 backdrop-blur-md border-b border-border sticky top-0 z-30">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1">
                    <div className="flex w-full md:w-1/3">
                        <label htmlFor="search-field" className="sr-only">
                            Search
                        </label>
                        <div className="relative w-full text-muted-foreground focus-within:text-foreground">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                                <Search className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <input
                                id="search-field"
                                className="block h-full w-full bg-transparent border-transparent py-2 pl-8 pr-3 text-foreground placeholder-muted-foreground focus:border-transparent focus:placeholder-foreground focus:outline-none focus:ring-0 sm:text-sm"
                                placeholder="Search"
                                type="search"
                                name="search"
                            />
                        </div>
                    </div>
                </div>
                <div className="ml-4 flex items-center md:ml-6 gap-4">
                    <button
                        type="button"
                        className="cursor-pointer rounded-full bg-transparent p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    >
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-6 w-6" aria-hidden="true" />
                    </button>

                    {/* Profile dropdown */}
                    <div className="relative ml-3">
                        <div>
                            <button
                                type="button"
                                className="cursor-pointer flex max-w-xs items-center rounded-full bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:ring-2 p-0.5"
                                id="user-menu-button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                    <User className="h-5 w-5" />
                                </div>
                            </button>
                        </div>

                        {isMenuOpen && (
                            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-card border border-border shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none py-2 animate-in fade-in zoom-in duration-150">
                                <div className="px-4 py-2 border-b border-border/50 mb-1">
                                    <p className="text-xs font-bold text-foreground truncate">{user?.full_name || 'User'}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => logout()}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer font-bold"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
