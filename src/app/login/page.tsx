"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, Sun, Moon } from "lucide-react";
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
    e.stopPropagation();
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

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
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
          <img src="/logo-icon.svg" alt="myLeads" className="w-14 h-14 mb-3 drop-shadow-lg" />
          <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Welcome to myLeads</h1>
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
