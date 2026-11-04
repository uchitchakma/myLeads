"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Key, 
  Mail, 
  Save, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Send,
  Globe,
  Lock,
  Code,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Server,
  SlidersHorizontal,
  Layers,
  Inbox
} from "lucide-react";
import Link from "next/link";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Password / Secret visibilities
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Copy helpers
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live SMTP testing state
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // System Settings State
  const [settings, setSettings] = useState({
    googleAuth: {
      enabled: false,
      clientId: "",
      clientSecret: "",
      redirectUri: "https://myleads.ucdreams.com/api/auth/google/callback"
    },
    systemSmtp: {
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      user: "uchit@ucdreams.website",
      pass: "Uchir@123",
      senderName: "myLeads System",
      senderEmail: "uchit@ucdreams.website",
      notificationEmail: "uchitchakmas@gmail.com"
    },
    contactFormConfig: {
      enabled: true,
      forwardToEmail: true,
      saveAsLead: true,
      notifyAdmin: true
    },
    globalApis: {
      googleMapsApiKey: "",
      yelpApiKey: "",
      geminiApiKey: "",
      companiesHouseApiKey: "",
      webhookUrl: ""
    },
    security: {
      allowPublicRegistration: true
    }
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized or forbidden");
        return res.json();
      })
      .then(data => {
        if (data.settings) {
          setSettings(prev => ({
            ...prev,
            ...data.settings,
            googleAuth: { ...prev.googleAuth, ...(data.settings.googleAuth || {}) },
            systemSmtp: { ...prev.systemSmtp, ...(data.settings.systemSmtp || {}) },
            contactFormConfig: { ...prev.contactFormConfig, ...(data.settings.contactFormConfig || {}) },
            globalApis: { ...prev.globalApis, ...(data.settings.globalApis || {}) },
            security: { ...prev.security, ...(data.settings.security || {}) }
          }));
        }
        setLoading(false);
      })
      .catch(() => {
        window.location.href = "/dashboard";
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      setSaveSuccess(true);
      showToast("Global admin & API configurations saved successfully!");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const res = await fetch("/api/admin/settings/test-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smtpConfig: settings.systemSmtp })
      });

      const data = await res.json();
      if (!res.ok) {
        setSmtpTestResult({ success: false, message: data.error || "SMTP test failed" });
      } else {
        setSmtpTestResult({ success: true, message: data.message });
      }
    } catch (err: any) {
      setSmtpTestResult({ success: false, message: err.message || "Failed to reach server" });
    } finally {
      setTestingSmtp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-main)]">
        <Sidebar />
        <main className="flex-1 p-8 md:ml-64 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <RefreshCw className="w-4 h-4 animate-spin text-[#C5453E]" />
            Loading Global Admin Configurations...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] transition-colors">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 pt-20 px-4 pb-16 md:pt-8 md:px-8 md:ml-64 max-w-5xl">
        {/* Toast Notification */}
        {notification && (
          <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${
            notification.type === "error" 
              ? "bg-red-500/15 border-red-500/30 text-red-500" 
              : "bg-[#C5453E]/15 border-[#C5453E]/30 text-[#C5453E]"
          }`}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="pb-6 border-b border-[var(--border-subtle)] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
                Global API &amp; System Configuration
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Control organization-wide OAuth integrations, global outbound SMTP mail gateways, contact form webhooks, and fallback scrapers.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#C5453E] text-white text-xs sm:text-sm font-semibold hover:bg-[#b03d37] transition-all shadow-md shadow-[#C5453E]/20 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes..." : saveSuccess ? "Saved Successfully!" : "Save All Configurations"}</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* ================= 1. GOOGLE LOGIN OAUTH 2.0 ================= */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)]">Google Login &amp; OAuth 2.0 API</h2>
                  <p className="text-xs text-[var(--text-muted)]">Allow users and team members to sign in with 1-click Google Single Sign-On (SSO).</p>
                </div>
              </div>

              {/* Enable Toggle Switch */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <span className="text-xs font-semibold text-[var(--text-main)]">
                  {settings.googleAuth.enabled ? "SSO Enabled" : "SSO Disabled"}
                </span>
                <input
                  type="checkbox"
                  checked={settings.googleAuth.enabled}
                  onChange={e => setSettings({
                    ...settings,
                    googleAuth: { ...settings.googleAuth, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--bg-main)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5453E] border border-[var(--border-subtle)] relative"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Google Client ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789-xxxx.apps.googleusercontent.com"
                  value={settings.googleAuth.clientId}
                  onChange={e => setSettings({
                    ...settings,
                    googleAuth: { ...settings.googleAuth, clientId: e.target.value.trim() }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Google Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showClientSecret ? "text" : "password"}
                    placeholder="GOCSPX-xxxxxxxxxxxxxxxx"
                    value={settings.googleAuth.clientSecret}
                    onChange={e => setSettings({
                      ...settings,
                      googleAuth: { ...settings.googleAuth, clientSecret: e.target.value.trim() }
                    })}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientSecret(!showClientSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    {showClientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Authorized Redirect URI (Copyable Helper) */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  Authorized Redirect URI (Paste into Google Cloud Console)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(settings.googleAuth.redirectUri, "google-redirect")}
                  className="text-xs text-[#C5453E] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedKey === "google-redirect" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "google-redirect" ? "Copied to Clipboard" : "Copy URI"}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-[var(--text-main)] select-all truncate">
                {settings.googleAuth.redirectUri}
              </div>
            </div>
          </div>

          {/* ================= 2. GLOBAL SYSTEM SMTP & HOSTINGER EMAIL ================= */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)]">Global System SMTP &amp; Email Gateway</h2>
                  <p className="text-xs text-[var(--text-muted)]">Default mail gateway used for contact form notifications, admin alerts, and team fallback outreach.</p>
                </div>
              </div>

              {/* Live SMTP Test Button */}
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={testingSmtp}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] hover:border-[#C5453E] text-xs font-semibold text-[var(--text-main)] transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {testingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C5453E]" /> : <Send className="w-3.5 h-3.5 text-[#C5453E]" />}
                <span>{testingSmtp ? "Testing Handshake..." : "Send Test Email"}</span>
              </button>
            </div>

            {/* Test Result Callout */}
            {smtpTestResult && (
              <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                smtpTestResult.success 
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500" 
                  : "bg-red-500/10 border border-red-500/30 text-red-500"
              }`}>
                {smtpTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{smtpTestResult.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  SMTP Host
                </label>
                <input
                  type="text"
                  placeholder="smtp.hostinger.com"
                  value={settings.systemSmtp.host}
                  onChange={e => setSettings({
                    ...settings,
                    systemSmtp: { ...settings.systemSmtp, host: e.target.value.trim() }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Port &amp; Protocol
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="465"
                    value={settings.systemSmtp.port}
                    onChange={e => setSettings({
                      ...settings,
                      systemSmtp: { ...settings.systemSmtp, port: Number(e.target.value) }
                    })}
                    className="w-24 px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                  />
                  <select
                    value={settings.systemSmtp.secure ? "SSL" : "TLS"}
                    onChange={e => setSettings({
                      ...settings,
                      systemSmtp: { ...settings.systemSmtp, secure: e.target.value === "SSL" }
                    })}
                    className="flex-1 px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                  >
                    <option value="SSL">SSL / Port 465 (Hostinger Recommended)</option>
                    <option value="TLS">STARTTLS / Port 587</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Admin Notification Email
                </label>
                <input
                  type="email"
                  placeholder="uchitchakmas@gmail.com"
                  value={settings.systemSmtp.notificationEmail}
                  onChange={e => setSettings({
                    ...settings,
                    systemSmtp: { ...settings.systemSmtp, notificationEmail: e.target.value.trim() }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  SMTP Username / Auth Email
                </label>
                <input
                  type="email"
                  placeholder="uchit@ucdreams.website"
                  value={settings.systemSmtp.user}
                  onChange={e => setSettings({
                    ...settings,
                    systemSmtp: { ...settings.systemSmtp, user: e.target.value.trim() }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  SMTP Password
                </label>
                <div className="relative">
                  <input
                    type={showSmtpPass ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={settings.systemSmtp.pass}
                    onChange={e => setSettings({
                      ...settings,
                      systemSmtp: { ...settings.systemSmtp, pass: e.target.value }
                    })}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPass(!showSmtpPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  placeholder="myLeads System"
                  value={settings.systemSmtp.senderName}
                  onChange={e => setSettings({
                    ...settings,
                    systemSmtp: { ...settings.systemSmtp, senderName: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Sender Email Address
                </label>
                <input
                  type="email"
                  placeholder="uchit@ucdreams.website"
                  value={settings.systemSmtp.senderEmail}
                  onChange={e => setSettings({
                    ...settings,
                    systemSmtp: { ...settings.systemSmtp, senderEmail: e.target.value.trim() }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                />
              </div>
            </div>
          </div>

          {/* ================= 3. INBOUND CONTACT FORMS API ================= */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)]">Inbound Contact Forms &amp; Lead Ingestion API</h2>
                  <p className="text-xs text-[var(--text-muted)]">Connect contact forms from any landing page, Webflow, or WordPress site to auto-harvest inbound clients.</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <span className="text-xs font-semibold text-[var(--text-main)]">
                  {settings.contactFormConfig.enabled ? "API Active" : "API Paused"}
                </span>
                <input
                  type="checkbox"
                  checked={settings.contactFormConfig.enabled}
                  onChange={e => setSettings({
                    ...settings,
                    contactFormConfig: { ...settings.contactFormConfig, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--bg-main)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5453E] border border-[var(--border-subtle)] relative"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.contactFormConfig.saveAsLead}
                  onChange={e => setSettings({
                    ...settings,
                    contactFormConfig: { ...settings.contactFormConfig, saveAsLead: e.target.checked }
                  })}
                  className="rounded border-[var(--border-subtle)] text-[#C5453E] focus:ring-[#C5453E]"
                />
                <div>
                  <div className="text-xs font-semibold text-[var(--text-main)]">Auto-Ingest into Leads Database</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Automatically create a new verified lead record tagged with &quot;Contact Form&quot;.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.contactFormConfig.forwardToEmail}
                  onChange={e => setSettings({
                    ...settings,
                    contactFormConfig: { ...settings.contactFormConfig, forwardToEmail: e.target.checked }
                  })}
                  className="rounded border-[var(--border-subtle)] text-[#C5453E] focus:ring-[#C5453E]"
                />
                <div>
                  <div className="text-xs font-semibold text-[var(--text-main)]">Forward to Admin Email Alert</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Immediately dispatch submission details to your admin notification email.</div>
                </div>
              </label>
            </div>

            {/* Inbound Endpoint Documentation Box */}
            <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#C5453E]" />
                  <span className="text-xs font-semibold text-[var(--text-main)]">Public Contact Form REST Webhook</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("https://myleads.ucdreams.com/api/contact", "contact-endpoint")}
                  className="text-xs text-[#C5453E] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedKey === "contact-endpoint" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "contact-endpoint" ? "Copied Endpoint" : "Copy URL"}</span>
                </button>
              </div>

              <div className="font-mono text-xs text-[var(--text-main)] bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                POST https://myleads.ucdreams.com/api/contact
              </div>

              <div className="text-[11px] text-[var(--text-muted)]">
                Accepts standard JSON payload with CORS enabled:
              </div>
              <pre className="font-mono text-[11px] text-[var(--text-muted)] bg-[var(--bg-card)] p-3 rounded-lg overflow-x-auto border border-[var(--border-subtle)]">
{`// Sample fetch payload from your landing page or contact form:
await fetch("https://myleads.ucdreams.com/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555-123-4567",
    company: "Acme Corp",
    message: "Interested in consulting and funnel design."
  })
});`}
              </pre>
            </div>
          </div>

          {/* ================= 4. GLOBAL SCRAPING & AI KEYS ================= */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)]">Global Scraper &amp; AI Fallback Keys</h2>
                <p className="text-xs text-[var(--text-muted)]">Shared API keys used across the platform whenever an individual user has not configured their own.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Fallback Google Maps Places Key
                </label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={settings.globalApis.googleMapsApiKey || ""}
                  onChange={e => setSettings({
                    ...settings,
                    globalApis: { ...settings.globalApis, googleMapsApiKey: e.target.value.trim() }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Fallback Yelp Fusion Key
                </label>
                <input
                  type="text"
                  placeholder="Yelp Fusion API Bearer Token"
                  value={settings.globalApis.yelpApiKey || ""}
                  onChange={e => setSettings({
                    ...settings,
                    globalApis: { ...settings.globalApis, yelpApiKey: e.target.value.trim() }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Fallback Gemini AI Studio Key
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    placeholder="AIzaSy..."
                    value={settings.globalApis.geminiApiKey || ""}
                    onChange={e => setSettings({
                      ...settings,
                      globalApis: { ...settings.globalApis, geminiApiKey: e.target.value.trim() }
                    })}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Fallback UK Companies House Key (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Government REST API Key (Zero config web stream used if empty)"
                  value={settings.globalApis.companiesHouseApiKey || ""}
                  onChange={e => setSettings({
                    ...settings,
                    globalApis: { ...settings.globalApis, companiesHouseApiKey: e.target.value.trim() }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Outbound Webhook / Zapier URL
                </label>
                <input
                  type="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={settings.globalApis.webhookUrl || ""}
                  onChange={e => setSettings({
                    ...settings,
                    globalApis: { ...settings.globalApis, webhookUrl: e.target.value.trim() }
                  })}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                />
              </div>
            </div>
          </div>

          {/* ================= 5. SYSTEM SECURITY & REGISTRATION POLICY ================= */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)]">Access Policy &amp; User Registrations</h2>
                <p className="text-xs text-[var(--text-muted)]">Control whether anyone can sign up or if new accounts must be created manually by an Admin.</p>
              </div>
            </div>

            <label className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-[var(--text-main)]">Allow Public Registrations (/signup)</div>
                <div className="text-xs text-[var(--text-muted)]">
                  When disabled, the signup page will reject new registrations, making myLeads private and invite-only.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.security.allowPublicRegistration}
                onChange={e => setSettings({
                  ...settings,
                  security: { ...settings.security, allowPublicRegistration: e.target.checked }
                })}
                className="w-5 h-5 rounded border-[var(--border-subtle)] text-[#C5453E] focus:ring-[#C5453E]"
              />
            </label>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C5453E] text-white text-sm font-semibold hover:bg-[#b03d37] transition-all shadow-md shadow-[#C5453E]/20 disabled:opacity-50 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Saving All Settings..." : "Save All Configurations"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
