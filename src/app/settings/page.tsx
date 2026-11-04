"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Key, 
  Map, 
  Sparkles, 
  Mail, 
  Save, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  ShieldCheck,
  User,
  Info,
  Check,
  X,
  AlertCircle,
  Play,
  Star
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [showYelpKey, setShowYelpKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // Testing states
  const [testingGoogleKey, setTestingGoogleKey] = useState(false);
  const [googleTestResult, setGoogleTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [testingYelpKey, setTestingYelpKey] = useState(false);
  const [yelpTestResult, setYelpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "USER",
    googleMapsApiKey: "",
    yelpApiKey: "",
    geminiApiKey: "",
    companiesHouseApiKey: "",
    smtpConfig: {
      host: "smtp.gmail.com",
      port: 587,
      user: "",
      pass: "",
      senderName: "",
      senderEmail: ""
    }
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            role: data.user.role || "USER",
            googleMapsApiKey: data.user.googleMapsApiKey || "",
            yelpApiKey: data.user.yelpApiKey || "",
            geminiApiKey: data.user.geminiApiKey || "",
            companiesHouseApiKey: data.user.companiesHouseApiKey || "",
            smtpConfig: data.user.smtpConfig || {
              host: "smtp.gmail.com",
              port: 587,
              user: "",
              pass: "",
              senderName: data.user.name || "",
              senderEmail: data.user.email || ""
            }
          });
        } else {
          window.location.href = "/login";
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const handleTestGoogleKey = async () => {
    if (!formData.googleMapsApiKey || formData.googleMapsApiKey.trim().length < 10) {
      setGoogleTestResult({
        success: false,
        message: "Please enter your Google Maps API key first (starts with AIzaSy...)."
      });
      return;
    }

    setTestingGoogleKey(true);
    setGoogleTestResult(null);

    try {
      const res = await fetch("/api/settings/test-google-maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: formData.googleMapsApiKey })
      });
      const data = await res.json();
      if (data.success) {
        setGoogleTestResult({ success: true, message: data.message });
      } else {
        setGoogleTestResult({ success: false, message: data.error || "Google key verification failed." });
      }
    } catch (err: any) {
      setGoogleTestResult({ success: false, message: err.message || "Failed to reach Google test endpoint." });
    } finally {
      setTestingGoogleKey(false);
    }
  };

  const handleTestYelpKey = async () => {
    if (!formData.yelpApiKey || formData.yelpApiKey.trim().length < 15) {
      setYelpTestResult({
        success: false,
        message: "Please enter your Yelp Fusion API key first."
      });
      return;
    }

    setTestingYelpKey(true);
    setYelpTestResult(null);

    try {
      const res = await fetch("/api/settings/test-yelp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: formData.yelpApiKey })
      });
      const data = await res.json();
      if (data.success) {
        setYelpTestResult({ success: true, message: data.message });
      } else {
        setYelpTestResult({ success: false, message: data.error || "Yelp key verification failed." });
      }
    } catch (err: any) {
      setYelpTestResult({ success: false, message: err.message || "Failed to reach Yelp test endpoint." });
    } finally {
      setTestingYelpKey(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert("Error saving settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] transition-colors">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 pt-20 px-4 pb-12 md:pt-8 md:px-8 md:ml-64 max-w-5xl">
        {/* Header */}
        <div className="pb-6 border-b border-[var(--border-subtle)] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">Personal API &amp; Engine Settings</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-mono">
                BYOK
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Configure your personal Google Maps and Gemini AI keys to harness unlimited free leads.
            </p>
          </div>

          {saveSuccess && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 animate-fade-in self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4" />
              Settings Saved Successfully
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile Card */}
          <div className="card-glass p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <h2 className="text-base font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#C5453E]" /> Account Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:border-[#C5453E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                  Email Address (Login)
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)] text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Google Maps API Key Section */}
          <div className="card-glass p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C5453E]/10 text-[#C5453E] flex items-center justify-center font-bold">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)]">Google Maps / Places API Key</h2>
                  <p className="text-xs text-[var(--text-muted)]">Used for official Google ratings, review counts, and verified websites.</p>
                </div>
              </div>
              {formData.googleMapsApiKey ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Key Configured
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--bg-surface)] text-[var(--text-dim)]">
                  Using Free Web Stream
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type={showGoogleKey ? "text" : "password"}
                    value={formData.googleMapsApiKey}
                    onChange={e => {
                      setFormData({ ...formData, googleMapsApiKey: e.target.value });
                      setGoogleTestResult(null);
                    }}
                    placeholder="AIzaSy..."
                    className="w-full pl-4 pr-12 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] font-mono text-sm focus:outline-none focus:border-[#C5453E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleKey(!showGoogleKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    {showGoogleKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Test API Key Button */}
                <button
                  type="button"
                  onClick={handleTestGoogleKey}
                  disabled={testingGoogleKey}
                  className="px-4 py-2.5 bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[#C5453E] rounded-xl text-xs font-bold text-[var(--text-main)] flex items-center justify-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 text-[#C5453E] ${testingGoogleKey ? "animate-spin" : ""}`} />
                  {testingGoogleKey ? "Testing..." : "Test API Key"}
                </button>
              </div>

              {/* Test Result Message Box */}
              {googleTestResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  googleTestResult.success 
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" 
                    : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30"
                }`}>
                  {googleTestResult.success ? (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <span>{googleTestResult.message}</span>
                </div>
              )}

              {/* Free credit guide */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-start gap-3">
                <Info className="w-4 h-4 text-[#C5453E] shrink-0 mt-0.5" />
                <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                  <strong>How to configure your free \$200/month Google Places Key:</strong>
                  <br />
                  1. In Google Cloud Console, enable <strong>Places API</strong> (or Places API New).
                  <br />
                  2. Under <em>Application restrictions</em>, select <strong>None</strong> (so your Next.js server can call it).
                  <br />
                  3. Paste key and click <strong>Test API Key</strong> above!
                  <br />
                  <a
                    href="https://console.cloud.google.com/google/maps-apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C5453E] hover:underline font-semibold inline-flex items-center gap-1 mt-1"
                  >
                    Open Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Yelp Fusion API Key Section */}
          <div className="card-glass p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)]">Yelp Fusion API Key (Free 500/day)</h2>
                  <p className="text-xs text-[var(--text-muted)]">Pulls verified local business listings, reviews, ratings, and phone numbers from Yelp.</p>
                </div>
              </div>
              {formData.yelpApiKey ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Key Configured
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--bg-surface)] text-[var(--text-dim)]">
                  Using Free Web Stream
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type={showYelpKey ? "text" : "password"}
                    value={formData.yelpApiKey}
                    onChange={e => {
                      setFormData({ ...formData, yelpApiKey: e.target.value });
                      setYelpTestResult(null);
                    }}
                    placeholder="Paste your Yelp Fusion API Key..."
                    className="w-full pl-4 pr-12 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] font-mono text-sm focus:outline-none focus:border-[#C5453E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowYelpKey(!showYelpKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    {showYelpKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Test Yelp API Key Button */}
                <button
                  type="button"
                  onClick={handleTestYelpKey}
                  disabled={testingYelpKey}
                  className="px-4 py-2.5 bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[#C5453E] rounded-xl text-xs font-bold text-[var(--text-main)] flex items-center justify-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 text-[#C5453E] ${testingYelpKey ? "animate-spin" : ""}`} />
                  {testingYelpKey ? "Testing..." : "Test Yelp Key"}
                </button>
              </div>

              {/* Test Result Message Box */}
              {yelpTestResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  yelpTestResult.success 
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" 
                    : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30"
                }`}>
                  {yelpTestResult.success ? (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <span>{yelpTestResult.message}</span>
                </div>
              )}

              {/* Yelp API Guide */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-start gap-3">
                <Info className="w-4 h-4 text-[#C5453E] shrink-0 mt-0.5" />
                <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                  <strong>How to get your free 500 calls/day Yelp Fusion API Key:</strong>
                  <br />
                  1. Visit <strong>yelp.com/developers/v3/manage_app</strong> and sign in (No credit card needed).
                  <br />
                  2. Select <strong>Access Tier: Base</strong> and submit the form to create your app.
                  <br />
                  3. Copy your API Key, paste it above, and click <strong>Test Yelp Key</strong>!
                  <br />
                  <a
                    href="https://www.yelp.com/developers/v3/manage_app"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C5453E] hover:underline font-semibold inline-flex items-center gap-1 mt-1"
                  >
                    Open Yelp App Manager <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini AI API Key Section */}
          <div className="card-glass p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)]">Google Gemini AI Key (Optional)</h2>
                  <p className="text-xs text-[var(--text-muted)]">Powers 1-on-1 personalized cold email and WhatsApp pitch writing.</p>
                </div>
              </div>
              {formData.geminiApiKey ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  AI Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--bg-surface)] text-[var(--text-dim)]">
                  Built-in Template
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  value={formData.geminiApiKey}
                  onChange={e => setFormData({ ...formData, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full pl-4 pr-12 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] font-mono text-sm focus:outline-none focus:border-[#C5453E]"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-xs text-[var(--text-muted)]">
                Get your 100% free API key from Google AI Studio:{" "}
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#C5453E] hover:underline font-semibold inline-flex items-center gap-1"
                >
                  Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Personal SMTP / Cold Email Dispatcher Section */}
          <div className="card-glass p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)]">Personal Cold Email / SMTP Setup</h2>
                <p className="text-xs text-[var(--text-muted)]">Send cold emails directly from your personal inbox (Gmail, Zoho, Workspace).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={formData.smtpConfig.host}
                  onChange={e => setFormData({
                    ...formData,
                    smtpConfig: { ...formData.smtpConfig, host: e.target.value }
                  })}
                  placeholder="smtp.gmail.com"
                  className="w-full px-4 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:border-[#C5453E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={formData.smtpConfig.port}
                  onChange={e => setFormData({
                    ...formData,
                    smtpConfig: { ...formData.smtpConfig, port: Number(e.target.value) }
                  })}
                  placeholder="587"
                  className="w-full px-4 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:border-[#C5453E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                  Sender / Email User
                </label>
                <input
                  type="email"
                  value={formData.smtpConfig.user}
                  onChange={e => setFormData({
                    ...formData,
                    smtpConfig: { ...formData.smtpConfig, user: e.target.value, senderEmail: e.target.value }
                  })}
                  placeholder="your-name@gmail.com"
                  className="w-full px-4 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:border-[#C5453E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                  SMTP App Password
                </label>
                <div className="relative">
                  <input
                    type={showSmtpPass ? "text" : "password"}
                    value={formData.smtpConfig.pass}
                    onChange={e => setFormData({
                      ...formData,
                      smtpConfig: { ...formData.smtpConfig, pass: e.target.value }
                    })}
                    placeholder="16-character App Password"
                    className="w-full pl-4 pr-12 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:border-[#C5453E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPass(!showSmtpPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 btn-primary flex items-center gap-2 text-sm shadow-lg shadow-[#C5453E]/25 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Settings..." : "Save My Personal Keys"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
