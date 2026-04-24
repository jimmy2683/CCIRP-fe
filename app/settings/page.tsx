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

    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: '',
        is_active: true,
        created_at: '',
    });

    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

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
                        phone: data.phone || '',
                        role: data.role || 'user',
                        is_active: data.is_active ?? true,
                        created_at: data.created_at || '',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
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
        if (!profile.full_name.trim()) { showMessage('error', 'Full name is required.'); return; }
        if (!profile.phone.trim()) { showMessage('error', 'Phone number is required.'); return; }
        setIsSaving(true);
        try {
            await api.settings.updateProfile({ full_name: profile.full_name, phone: profile.phone });
            showMessage('success', 'Profile updated successfully.');
        } catch (error: unknown) {
            showMessage('error', error instanceof Error ? error.message : 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwords.newPass !== passwords.confirm) { showMessage('error', 'New passwords do not match.'); return; }
        if (passwords.newPass.length < 8) { showMessage('error', 'New password must be at least 8 characters.'); return; }
        setIsSaving(true);
        try {
            await api.settings.changePassword({ current_password: passwords.current, new_password: passwords.newPass });
            showMessage('success', 'Password changed successfully.');
            setPasswords({ current: '', newPass: '', confirm: '' });
        } catch (error: unknown) {
            showMessage('error', error instanceof Error ? error.message : 'Failed to change password.');
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

    const inputClass = "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-150 shadow-sm";
    const disabledInputClass = "w-full rounded-xl border border-border/40 bg-muted/50 px-4 py-2.5 text-[14px] text-muted-foreground cursor-not-allowed shadow-sm";

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-[13px] text-muted-foreground font-medium">Loading settings...</p>
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
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Account</p>
                    <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-none">Settings</h1>
                    <p className="mt-2 text-[14px] text-muted-foreground">Manage your profile, security, and preferences</p>
                </div>

                {/* Status message */}
                {message && (
                    <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all animate-fade-in ${
                        message.type === 'success'
                            ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-600'
                            : 'bg-rose-500/8 border-rose-500/20 text-rose-600'
                    }`}>
                        {message.type === 'success'
                            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            : <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        }
                        <p className="text-[13px] font-medium">{message.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-2">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                                            isActive
                                                ? 'bg-primary/8 text-primary'
                                                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Account info */}
                        <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Account Info</p>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[11px] text-muted-foreground mb-1">Role</p>
                                    <span className="badge badge-primary capitalize">{profile.role}</span>
                                </div>
                                <div>
                                    <p className="text-[11px] text-muted-foreground mb-1">Status</p>
                                    <span className={`badge ${profile.is_active ? 'badge-success' : 'badge-error'}`}>
                                        {profile.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {profile.created_at && (
                                    <div>
                                        <p className="text-[11px] text-muted-foreground mb-1">Member Since</p>
                                        <p className="text-[13px] font-semibold text-foreground">{new Date(profile.created_at).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-6 lg:p-8">

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-[18px] font-bold text-foreground">Profile Information</h2>
                                        <p className="mt-1 text-[13px] text-muted-foreground">Update your personal details.</p>
                                    </div>

                                    <div className="flex items-center gap-4 p-5 rounded-xl bg-muted/30 border border-border/50">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-[22px] font-bold shadow-md flex-shrink-0">
                                            {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-semibold text-foreground">{profile.full_name || 'User'}</p>
                                            <p className="text-[13px] text-muted-foreground mt-0.5">{profile.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Full Name</label>
                                            <input
                                                type="text"
                                                value={profile.full_name}
                                                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                                                className={inputClass}
                                                placeholder="Your full name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Email Address</label>
                                            <input type="email" value={profile.email} disabled className={disabledInputClass} />
                                            <p className="text-[11px] text-muted-foreground mt-1.5">Email cannot be changed.</p>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                                className={inputClass}
                                                placeholder="+919999999999"
                                            />
                                            <p className="text-[11px] text-muted-foreground mt-1.5">Required for SMS and WhatsApp campaigns.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all duration-150 disabled:opacity-50 cursor-pointer"
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
                                        <h2 className="text-[18px] font-bold text-foreground">Security</h2>
                                        <p className="mt-1 text-[13px] text-muted-foreground">Update your password to keep your account secure.</p>
                                    </div>

                                    <div className="space-y-5 max-w-md">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    value={passwords.current}
                                                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                                                    className={`${inputClass} pr-10`}
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={passwords.newPass}
                                                    onChange={(e) => setPasswords(prev => ({ ...prev, newPass: e.target.value }))}
                                                    className={`${inputClass} pr-10`}
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                                className={inputClass}
                                                placeholder="Confirm new password"
                                            />
                                            {passwords.confirm && passwords.newPass !== passwords.confirm && (
                                                <p className="text-[12px] text-rose-500 font-medium mt-1.5">Passwords do not match.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={isSaving || !passwords.current || !passwords.newPass || !passwords.confirm}
                                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all duration-150 disabled:opacity-50 cursor-pointer"
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
                                        <h2 className="text-[18px] font-bold text-foreground">Preferences</h2>
                                        <p className="mt-1 text-[13px] text-muted-foreground">Customize your application experience.</p>
                                    </div>

                                    {/* Theme */}
                                    <div className="flex items-center justify-between p-5 rounded-xl border border-border/60 bg-muted/20">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-primary/8 text-primary rounded-xl">
                                                {preferences.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-semibold text-foreground">Appearance</p>
                                                <p className="text-[12px] text-muted-foreground mt-0.5">
                                                    {preferences.theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleThemeToggle}
                                            className={`cursor-pointer relative w-11 h-6 rounded-full transition-colors duration-200 ${preferences.theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}
                                        >
                                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${preferences.theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>

                                    {/* Notifications */}
                                    <div className="space-y-3">
                                        <h3 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Notifications</h3>

                                        <div className="flex items-center justify-between p-5 rounded-xl border border-border/60 bg-muted/20">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl">
                                                    {preferences.emailNotifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-semibold text-foreground">Email Notifications</p>
                                                    <p className="text-[12px] text-muted-foreground mt-0.5">Receive email updates about campaign activity</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setPreferences(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                                                className={`cursor-pointer relative w-11 h-6 rounded-full transition-colors duration-200 ${preferences.emailNotifications ? 'bg-primary' : 'bg-muted'}`}
                                            >
                                                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${preferences.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-5 rounded-xl border border-border/60 bg-muted/20">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                                                    <AlertCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-semibold text-foreground">Campaign Alerts</p>
                                                    <p className="text-[12px] text-muted-foreground mt-0.5">Get notified when campaigns finish sending</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setPreferences(prev => ({ ...prev, campaignAlerts: !prev.campaignAlerts }))}
                                                className={`cursor-pointer relative w-11 h-6 rounded-full transition-colors duration-200 ${preferences.campaignAlerts ? 'bg-primary' : 'bg-muted'}`}
                                            >
                                                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${preferences.campaignAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
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
