"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Search, 
  Database, 
  Users, 
  Settings,
  LogOut, 
  Flame, 
  ShieldCheck, 
  Sun,
  Moon,
  Bot,
  Menu,
  X,
  Send
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  // Close mobile drawer on route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard
    },
    {
      label: "Lead Harvester",
      href: "/scraper",
      icon: Search
    },
    {
      label: user?.role === "ADMIN" ? "Leads Database" : "Leads Database",
      href: "/leads",
      icon: Database
    },
    {
      label: "Campaigns & Outreach",
      href: "/campaigns",
      icon: Send
    },
    {
      label: "Autopilot Automations",
      href: "/automation",
      icon: Bot
    },
    {
      label: "API & Engine Settings",
      href: "/settings",
      icon: Settings
    }
  ];

  const adminItems = [
    {
      label: "User Management",
      href: "/admin/users",
      icon: Users,
      badge: "Admin"
    }
  ];

  const NavContent = () => (
    <>
      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-[var(--text-dim)] uppercase">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#C5453E] text-white shadow-md shadow-[#C5453E]/25"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[var(--text-muted)]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-[var(--bg-surface)] text-[var(--text-muted)]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Navigation (Conditional) */}
        {user?.role === "ADMIN" && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-[#C5453E] uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Controls
            </div>
            <nav className="space-y-1">
              {adminItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#C5453E] text-white shadow-md shadow-[#C5453E]/25"
                        : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#C5453E]"}`} />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C5453E]/20 text-[#C5453E] border border-[#C5453E]/30 font-semibold">
                      Master
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User Profile & Logout Bottom Pill */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-main)]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#C5453E] to-amber-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-[var(--text-main)] truncate">{user?.name || "Loading..."}</div>
              <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                {user?.role === "ADMIN" ? (
                  <span className="text-[#C5453E] font-medium flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Super Admin
                  </span>
                ) : (
                  <span className="text-[var(--text-muted)]">Scout User</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-[var(--text-muted)] hover:text-[#C5453E] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Mobile Top Header Bar (Visible on screens < md) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] z-40 px-4 flex items-center justify-between transition-colors shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open Navigation Menu"
            className="p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-main)] hover:text-[#C5453E] transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C5453E] flex items-center justify-center text-white shadow-md shadow-[#C5453E]/20">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <span className="font-bold text-base text-[var(--text-main)] tracking-tight">
              LeadFlow <span className="text-[9px] px-1 py-0.2 rounded bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-semibold">PRO</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            className="p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[#C5453E] transition"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Initial Pill */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#C5453E] to-amber-600 flex items-center justify-center text-white font-bold text-xs">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
        </div>
      </header>

      {/* 2. Mobile Drawer & Backdrop (Visible when opened on < md) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Drawer Sidebar */}
          <div className="relative w-72 max-w-[80vw] bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C5453E] flex items-center justify-center shadow-md shadow-[#C5453E]/20 text-white">
                  <Flame className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="font-bold text-base text-[var(--text-main)] tracking-tight flex items-center gap-1">
                    LeadFlow
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-semibold">
                      PRO
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">Client Engine</div>
                </div>
              </div>

              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[#C5453E] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav links and profile */}
            <NavContent />
          </div>
        </div>
      )}

      {/* 3. Desktop Permanent Sidebar (Visible on screens >= md) */}
      <aside className="hidden md:flex w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex-col h-screen fixed left-0 top-0 select-none z-30 transition-colors shadow-sm">
        {/* Brand Header */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5453E] flex items-center justify-center shadow-lg shadow-[#C5453E]/20 text-white">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-[var(--text-main)] tracking-tight flex items-center gap-1.5">
                LeadFlow
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-semibold">
                  PRO
                </span>
              </div>
              <div className="text-xs text-[var(--text-muted)]">Client Engine</div>
            </div>
          </div>

          {/* Quick Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            className="p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[#C5453E] transition"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        <NavContent />
      </aside>
    </>
  );
}

