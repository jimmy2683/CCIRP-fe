"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/libs/api';
import {
    User, Shield, Palette, Info, Save, Loader2, Eye, EyeOff,
    CheckCircle2, AlertCircle, Moon, Sun, Bell, BellOff
} from 'lucide-react';

type SettingsTab = 'profile' | 'security' | 'preferences';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile state
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        role: '',
        is_active: true,
        created_at: '',
    });

    // Security state
    const [passwords, setPasswords] = useState({
        current: '',
        newPass: '',
        confirm: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Preferences state
    const [preferences, setPreferences] = useState({
        theme: 'dark',
        emailNotifications: true,
        campaignAlerts: true,
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await api.settings.getProfile();
                if (data) {
                    setProfile({
                        full_name: data.full_name || '',
                        email: data.email || '',
                        role: data.role || 'user',
                        is_active: data.is_active ?? true,
                        created_at: data.created_at || '',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                // Use defaults
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await api.settings.updateProfile({ full_name: profile.full_name });
            showMessage('success', 'Profile updated successfully.');
        } catch (error: any) {
            showMessage('error', error.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwords.newPass !== passwords.confirm) {
            showMessage('error', 'New passwords do not match.');
            return;
        }
        if (passwords.newPass.length < 8) {
            showMessage('error', 'New password must be at least 8 characters.');
            return;
        }
        setIsSaving(true);
        try {
            await api.settings.changePassword({
                current_password: passwords.current,
                new_password: passwords.newPass,
            });
            showMessage('success', 'Password changed successfully.');
            setPasswords({ current: '', newPass: '', confirm: '' });
        } catch (error: any) {
            showMessage('error', error.message || 'Failed to change password.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleThemeToggle = () => {
        const next = preferences.theme === 'dark' ? 'light' : 'dark';
        setPreferences(prev => ({ ...prev, theme: next }));
        if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next === 'dark');
        }
    };

    const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
        { key: 'profile', label: 'Profile', icon: User },
        { key: 'security', label: 'Security', icon: Shield },
        { key: 'preferences', label: 'Preferences', icon: Palette },
    ];

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground font-medium">Loading settings...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 animate-fade-up">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your profile, security, and application preferences.
                    </p>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all animate-fade-up ${
                        message.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-border bg-card shadow-sm p-2">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Account Info Card */}
                        <div className="mt-4 rounded-2xl border border-border bg-card shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="w-4 h-4 text-primary" />
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account</h4>
                            </div>
                            <div className="space-y-2.5">
                                <div>
                                    <p className="text-[11px] text-muted-foreground">Role</p>
                                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary capitalize">{profile.role}</span>
                                </div>
                                <div>
                                    <p className="text-[11px] text-muted-foreground">Status</p>
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${profile.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {profile.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {profile.created_at && (
                                    <div>
                                        <p className="text-[11px] text-muted-foreground">Member Since</p>
                                        <p className="text-xs font-medium text-foreground">{new Date(profile.created_at).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 lg:p-8">


                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">Update your personal details.</p>
                                    </div>

                                    {/* Avatar Section */}
                                    <div className="flex items-center gap-5 p-5 rounded-xl bg-accent/30 border border-border">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border border-primary/20">
                                            {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{profile.full_name || 'User'}</p>
                                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
                                            <input
                                                type="text"
                                                value={profile.full_name}
                                                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                                                className="w-full rounded-xl border border-border bg-background p-3 text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
                                            <input
                                                type="email"
                                                value={profile.email}
                                                disabled
                                                className="w-full rounded-xl border border-border bg-muted/50 p-3 text-muted-foreground text-sm cursor-not-allowed"
                                            />
                                            <p className="text-[11px] text-muted-foreground mt-1">Email cannot be changed.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Security</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">Update your password to keep your account secure.</p>
                                    </div>

                                    <div className="space-y-5 max-w-md">
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    value={passwords.current}
                                                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                                                    className="w-full rounded-xl border border-border bg-background p-3 pr-10 text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={passwords.newPass}
                                                    onChange={(e) => setPasswords(prev => ({ ...prev, newPass: e.target.value }))}
                                                    className="w-full rounded-xl border border-border bg-background p-3 pr-10 text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                                className="w-full rounded-xl border border-border bg-background p-3 text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                                                placeholder="Confirm new password"
                                            />
                                            {passwords.confirm && passwords.newPass !== passwords.confirm && (
                                                <p className="text-xs text-rose-400 mt-1">Passwords do not match.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={isSaving || !passwords.current || !passwords.newPass || !passwords.confirm}
                                            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Preferences</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">Customize your application experience.</p>
                                    </div>

                                    {/* Theme Toggle */}
                                    <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-accent/20">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                                {preferences.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">Appearance</p>
                                                <p className="text-xs text-muted-foreground">Currently using {preferences.theme} mode</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleThemeToggle}
                                            className={`cursor-pointer relative w-12 h-6 rounded-full transition-colors ${preferences.theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}
                                        >
                                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${preferences.theme === 'dark' ? 'left-6' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    {/* Notification Preferences */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Notifications</h3>
                                        <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-accent/20">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                                                    {preferences.emailNotifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Email Notifications</p>
                                                    <p className="text-xs text-muted-foreground">Receive email updates about activity</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setPreferences(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                                                className={`cursor-pointer relative w-12 h-6 rounded-full transition-colors ${preferences.emailNotifications ? 'bg-primary' : 'bg-muted'}`}
                                            >
                                                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${preferences.emailNotifications ? 'left-6' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-accent/20">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                                                    <AlertCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Campaign Alerts</p>
                                                    <p className="text-xs text-muted-foreground">Get notified when campaigns finish sending</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setPreferences(prev => ({ ...prev, campaignAlerts: !prev.campaignAlerts }))}
                                                className={`cursor-pointer relative w-12 h-6 rounded-full transition-colors ${preferences.campaignAlerts ? 'bg-primary' : 'bg-muted'}`}
                                            >
                                                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${preferences.campaignAlerts ? 'left-6' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
