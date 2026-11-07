"use client";

import { useEffect, useState, useRef } from "react";
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
  Star,
  MessageCircle,
  QrCode,
  Smartphone,
  Unlink,
  RefreshCw,
  Send,
  ShieldAlert,
  Radio,
  Zap
} from "lucide-react";

interface WhatsAppState {
  status: "DISCONNECTED" | "CONNECTING" | "SCAN_QR" | "CONNECTED" | "ERROR";
  phoneNumber?: string;
  userName?: string;
  qrCode?: string;
  connectedAt?: string;
  lastError?: string;
  hasSavedSession?: boolean;
}

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

  // WhatsApp Linked Device states
  const [waState, setWaState] = useState<WhatsAppState>({ status: "DISCONNECTED" });
  const [waLoading, setWaLoading] = useState(false);
  const [waTestPhone, setWaTestPhone] = useState("");
  const [waTestMessage, setWaTestMessage] = useState("Hello! This is a test message from myLeads outreach engine.");
  const [waSendingTest, setWaSendingTest] = useState(false);
  const [waTestResult, setWaTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const fetchWhatsAppStatus = async (init: boolean = false) => {
    try {
      const res = await fetch(`/api/whatsapp/status${init ? "?init=true" : ""}`);
      const data = await res.json();
      if (data.success) {
        setWaState({
          status: data.status,
          phoneNumber: data.phoneNumber,
          userName: data.userName,
          qrCode: data.qrCode,
          connectedAt: data.connectedAt,
          lastError: data.lastError,
          hasSavedSession: data.hasSavedSession
        });
      }
      return data;
    } catch (err) {
      console.error("Failed to fetch WhatsApp status:", err);
      return null;
    }
  };

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

    // Initial WhatsApp status check
    fetchWhatsAppStatus();
  }, []);

  // Poll WhatsApp status while waiting for QR scan
  useEffect(() => {
    if (waState.status === "SCAN_QR" || waState.status === "CONNECTING") {
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(async () => {
          const res = await fetchWhatsAppStatus();
          if (res && res.status === "CONNECTED") {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        }, 2500);
      }
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [waState.status]);

  const handleStartWhatsAppPairing = async (forceNew: boolean = true) => {
    setWaLoading(true);
    setWaTestResult(null);
    try {
      const res = await fetch("/api/whatsapp/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceNew })
      });
      const data = await res.json();
      if (data.success) {
        setWaState({
          status: data.status,
          phoneNumber: data.phoneNumber,
          userName: data.userName,
          qrCode: data.qrCode,
          connectedAt: data.connectedAt,
          lastError: data.lastError,
          hasSavedSession: data.hasSavedSession
        });
      }
    } catch (err: any) {
      console.error("Error starting WhatsApp pairing:", err);
    } finally {
      setWaLoading(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm("Are you sure you want to disconnect this WhatsApp session? You will need to scan the QR code again to reconnect.")) {
      return;
    }
    setWaLoading(true);
    try {
      const res = await fetch("/api/whatsapp/disconnect", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setWaState({
          status: "DISCONNECTED",
          phoneNumber: undefined,
          userName: undefined,
          qrCode: undefined,
          connectedAt: undefined,
          hasSavedSession: false
        });
        setWaTestResult(null);
      }
    } catch (err) {
      console.error("Error disconnecting WhatsApp:", err);
    } finally {
      setWaLoading(false);
    }
  };

  const handleSendTestWhatsApp = async () => {
    if (!waTestPhone || waTestPhone.trim().length < 8) {
      setWaTestResult({
        success: false,
        message: "Please enter a valid phone number with country code (e.g. +91 9876543210 or 14155552671)."
      });
      return;
    }

    setWaSendingTest(true);
    setWaTestResult(null);

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: waTestPhone,
          message: waTestMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setWaTestResult({
          success: true,
          message: `Test message delivered successfully to ${waTestPhone}! (Message ID: ${data.messageId || "sent"})`
        });
      } else {
        setWaTestResult({
          success: false,
          message: data.error || "Failed to deliver WhatsApp test message."
        });
      }
    } catch (err: any) {
      setWaTestResult({
        success: false,
        message: err.message || "Failed to reach WhatsApp dispatch API."
      });
    } finally {
      setWaSendingTest(false);
    }
  };

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
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">API &amp; Engine Settings</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-mono">
                BYOK
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Connect WhatsApp via Web Scanner, configure Google Maps &amp; Gemini AI, and set up your personal SMTP outreach sender.
            </p>
          </div>

          {saveSuccess && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 animate-fade-in self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4" />
              Settings Saved Successfully
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* ========================================================================= */}
          {/* WHATSAPP WEB SCANNER & MULTI-DEVICE PAIRING CARD */}
          {/* ========================================================================= */}
          <div className="card-glass p-6 border border-emerald-500/30 bg-[var(--bg-card)] rounded-2xl relative overflow-hidden shadow-xs">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                    WhatsApp Web Scanner (Linked Device)
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                      Multi-Device WebSocket
                    </span>
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Connect your phone via QR code to dispatch direct personalized pitches and automated follow-ups.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {waState.status === "CONNECTED" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connected (+{waState.phoneNumber})
                  </span>
                ) : waState.status === "SCAN_QR" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                    <Radio className="w-3.5 h-3.5" />
                    Awaiting Phone Scan...
                  </span>
                ) : waState.status === "CONNECTING" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-500 border border-blue-500/30">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Initializing Engine...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-surface)] text-[var(--text-dim)] border border-[var(--border-subtle)]">
                    <Smartphone className="w-3.5 h-3.5" />
                    Not Linked
                  </span>
                )}
              </div>
            </div>

            {/* Anti-Spam Safety Advice Alert */}
            <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Anti-Spam Safety Recommendation:</strong> We strongly advise linking a <strong>secondary / business SIM card</strong> rather than your personal number. When reaching out to new prospects, automated systems should use randomized delays and polite opt-out notes to prevent WhatsApp spam flags.
              </div>
            </div>

            {/* Dynamic Content based on State */}
            {waState.status === "CONNECTED" ? (
              /* CONNECTED STATE */
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                      WA
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                        {waState.userName || "WhatsApp Account"}
                        <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          +{waState.phoneNumber}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">
                        Multi-device session active on server. Ready for instant direct message dispatches.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDisconnectWhatsApp}
                    disabled={waLoading}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50 self-start sm:self-auto"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    {waLoading ? "Unlinking..." : "Unlink / Log Out"}
                  </button>
                </div>

                {/* Live Test Sender */}
                <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-3">
                  <div className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    Verify Connection: Send Test WhatsApp Message
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase mb-1">
                        Recipient Phone (with country code)
                      </label>
                      <input
                        type="text"
                        placeholder="+91 9876543210"
                        value={waTestPhone}
                        onChange={e => setWaTestPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase mb-1">
                        Test Message Body
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={waTestMessage}
                          onChange={e => setWaTestMessage(e.target.value)}
                          className="flex-1 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-main)] focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleSendTestWhatsApp}
                          disabled={waSendingTest}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shrink-0 shadow-sm"
                        >
                          <Send className={`w-3.5 h-3.5 ${waSendingTest ? "animate-spin" : ""}`} />
                          {waSendingTest ? "Sending..." : "Send Test"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {waTestResult && (
                    <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                      waTestResult.success 
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25" 
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/25"
                    }`}>
                      {waTestResult.success ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                      <span>{waTestResult.message}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : waState.status === "SCAN_QR" && waState.qrCode ? (
              /* SCAN QR CODE STATE */
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-6 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)]">
                {/* QR Display */}
                <div className="p-3 bg-white rounded-2xl shadow-lg border border-gray-200 shrink-0">
                  <img 
                    src={waState.qrCode} 
                    alt="Scan this WhatsApp QR Code with your phone" 
                    className="w-56 h-56 rounded-lg"
                  />
                  <div className="text-[10px] text-center text-gray-500 font-mono mt-1 flex items-center justify-center gap-1">
                    <Radio className="w-2.5 h-2.5 text-emerald-500 animate-ping" />
                    Scan with WhatsApp camera
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4 max-w-md">
                  <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-500" />
                    How to Link Your WhatsApp:
                  </h3>

                  <ol className="text-xs text-[var(--text-muted)] space-y-2.5 list-decimal pl-4 leading-relaxed">
                    <li>Open <strong>WhatsApp</strong> on your mobile phone.</li>
                    <li>Tap <strong>Settings</strong> (iOS) or <strong>⋮ More options</strong> (Android) &gt; <strong>Linked Devices</strong>.</li>
                    <li>Tap <strong>Link a Device</strong> and point your camera at this QR code.</li>
                    <li>Your session will pair automatically within 2 seconds!</li>
                  </ol>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleStartWhatsAppPairing(true)}
                      disabled={waLoading}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${waLoading ? "animate-spin" : ""}`} />
                      Regenerate QR Code
                    </button>

                    <button
                      onClick={() => setWaState(prev => ({ ...prev, status: "DISCONNECTED", qrCode: undefined }))}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* DISCONNECTED / READY TO PAIR STATE */
              <div className="p-6 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-1">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-main)]">
                      Link WhatsApp with QR Scanner
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 max-w-lg leading-relaxed">
                      Connect your WhatsApp Business or outreach number directly. Once paired, you can launch personalized cold pitches, multi-channel follow-ups, and speed audit reports in bulk directly through WhatsApp.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartWhatsAppPairing(true)}
                  disabled={waLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-emerald-600/20 disabled:opacity-50 shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  {waLoading ? "Generating QR Code..." : "Connect WhatsApp (Scan QR)"}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Profile Card */}
            <div className="card-glass p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl">
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
            <div className="card-glass p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl relative overflow-hidden">
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
              </div>
            </div>

            {/* Yelp Fusion API Key Section */}
            <div className="card-glass p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl relative overflow-hidden">
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
                    Free Tier Available
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

                  <button
                    type="button"
                    onClick={handleTestYelpKey}
                    disabled={testingYelpKey}
                    className="px-4 py-2.5 bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[#C5453E] rounded-xl text-xs font-bold text-[var(--text-main)] flex items-center justify-center gap-1.5 shadow-xs transition disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 text-red-500 ${testingYelpKey ? "animate-spin" : ""}`} />
                    {testingYelpKey ? "Testing..." : "Test Yelp Key"}
                  </button>
                </div>

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
              </div>
            </div>

            {/* Gemini API Key Section */}
            <div className="card-glass p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-main)]">Google Gemini API Key</h2>
                    <p className="text-xs text-[var(--text-muted)]">Powers cold email pitch generation, lead scoring, and automated audits.</p>
                  </div>
                </div>
                {formData.geminiApiKey ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Key Configured
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--bg-surface)] text-[var(--text-dim)]">
                    System Default
                  </span>
                )}
              </div>

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
            </div>

            {/* Custom SMTP Outreach Configuration */}
            <div className="card-glass p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)]">Custom Email SMTP (Dispatches from Your Domain)</h2>
                  <p className="text-xs text-[var(--text-muted)]">Configure your own email credentials to send outreach pitches directly from your domain.</p>
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
        </div>
      </main>
    </div>
  );
}
