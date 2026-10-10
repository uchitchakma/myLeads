"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Theme Toggle Button (Top Right) */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[#C5453E] shadow-xs transition"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C5453E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md card-glass p-8 relative z-10 border border-[var(--border-subtle)] shadow-xl backdrop-blur-xl bg-[var(--bg-card)]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#C5453E] flex items-center justify-center shadow-xl shadow-[#C5453E]/30 text-white mb-3">
            <Flame className="w-7 h-7 fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Welcome to LeadFlow</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Autonomous Lead Discovery & Client Engine</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:border-[#C5453E] focus:ring-1 focus:ring-[#C5453E] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:border-[#C5453E] focus:ring-1 focus:ring-[#C5453E] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 btn-primary flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In to Workspace"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Logins for Fast Testing */}
        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
          <div className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider text-center mb-3">
            Quick 1-Click Test Accounts
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillDemo("admin@leadflow.local", "admin123")}
              className="p-2.5 rounded-xl bg-[var(--bg-card-hover)] hover:bg-[#C5453E]/10 border border-[var(--border-subtle)] hover:border-[#C5453E]/40 text-left transition group"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)] group-hover:text-[#C5453E]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5453E]" />
                Super Admin
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Master Database View</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemo("alex@leadflow.local", "user123")}
              className="p-2.5 rounded-xl bg-[var(--bg-card-hover)] hover:bg-amber-500/10 border border-[var(--border-subtle)] hover:border-amber-500/40 text-left transition group"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)] group-hover:text-amber-600">
                <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                Scout User
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Personal Workspace</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#C5453E] hover:underline font-semibold">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
