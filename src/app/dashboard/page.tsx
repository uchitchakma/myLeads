"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { 
  Users, 
  Database, 
  Flame, 
  Gauge, 
  ArrowUpRight, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  ExternalLink,
  Send,
  Layers
} from "lucide-react";

interface Lead {
  id: string;
  businessName: string;
  websiteUrl: string;
  phoneNumber: string;
  contactEmail: string;
  ownerName: string;
  category: string;
  city: string;
  status: string;
  speedScore: number;
  loadTime: string;
  userEmail?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaignCount, setCampaignCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/leads").then(r => r.json()),
      fetch("/api/campaigns").then(r => r.json())
    ]).then(([authData, leadsData, campData]) => {
      if (authData.authenticated && authData.user) {
        setUser(authData.user);
      } else {
        window.location.href = "/login";
        return;
      }
      if (leadsData.leads) {
        setLeads(leadsData.leads);
      }
      if (campData.campaigns) {
        setCampaignCount(campData.campaigns.length);
      }
      setLoading(false);
    }).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  const totalLeads = leads.length;
  const slowLeads = leads.filter(l => l.speedScore < 50).length;
  const avgScore = totalLeads ? Math.round(leads.reduce((acc, l) => acc + (l.speedScore || 0), 0) / totalLeads) : 0;
  const contactedCount = leads.filter(l => l.status === "CONTACTED" || l.status === "REPLIED" || l.status === "CLOSED").length;

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] transition-colors">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 pt-20 px-4 pb-12 md:pt-8 md:px-8 md:ml-64">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
                {user?.role === "ADMIN" ? "Master Command Center" : "Scout Dashboard"}
              </h1>
              {user?.role === "ADMIN" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              {user?.role === "ADMIN" 
                ? "Global telemetry across all team members and scrapers."
                : `Welcome back, ${user?.name || "Scout"}. Here is your active pipeline.`}
            </p>
          </div>

          <Link
            href="/scraper"
            className="px-4 py-2.5 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-[#C5453E]/20"
          >
            <Search className="w-4 h-4" />
            Launch Lead Harvester
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1 */}
          <div className="card-glass p-5 relative overflow-hidden card-glass-hover">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {user?.role === "ADMIN" ? "Global System Leads" : "My Scraped Leads"}
              </span>
              <Database className="w-4 h-4 text-[#C5453E]" />
            </div>
            <div className="text-3xl font-bold text-[var(--text-main)]">{totalLeads}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% Verified &amp; Stored</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card-glass p-5 relative overflow-hidden card-glass-hover">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">High Priority Leads</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-[var(--text-main)]">{slowLeads}</div>
            <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-2">
              <span>Speed score &lt; 50 (Web Dev Targets)</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card-glass p-5 relative overflow-hidden card-glass-hover">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Mobile Score</span>
              <Gauge className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-3xl font-bold text-[var(--text-main)]">{avgScore}<span className="text-sm font-normal text-[var(--text-muted)]">/100</span></div>
            <div className="text-xs text-[var(--text-muted)] mt-2">
              Based on Google PageSpeed tests
            </div>
          </div>

          {/* Card 4 */}
          <Link href="/campaigns" className="card-glass p-5 relative overflow-hidden card-glass-hover block">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Campaigns</span>
              <Send className="w-4 h-4 text-[#C5453E]" />
            </div>
            <div className="text-3xl font-bold text-[var(--text-main)]">{campaignCount}</div>
            <div className="text-xs text-[#C5453E] flex items-center gap-1 mt-2">
              <span>{contactedCount} leads contacted • Open Campaigns →</span>
            </div>
          </Link>
        </div>

        {/* Quick Launch Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#C5453E]/10 via-[var(--bg-card)] to-[var(--bg-card)] border border-[#C5453E]/20 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C5453E] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#C5453E]/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-main)]">Technique #1: Google Local Harvester</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Automatically finds businesses in any city, calculates mobile load times, and drafts 1-to-1 AI pitches.
              </p>
            </div>
          </div>
          <Link
            href="/scraper"
            className="px-5 py-2.5 btn-primary text-xs shrink-0 flex items-center gap-2"
          >
            Run Harvester Now
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Recent Discovered Leads Table */}
        <div className="card-glass overflow-hidden">
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)]">Recently Discovered Leads</h2>
              <p className="text-xs text-[var(--text-muted)]">Latest business targets audited by your pipeline</p>
            </div>
            <Link href="/leads" className="text-xs text-[#C5453E] hover:underline font-semibold flex items-center gap-1">
              View All in Database →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--table-header)] text-[var(--text-muted)] text-xs uppercase font-semibold border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="px-5 py-3.5">Business &amp; Website</th>
                  <th className="px-5 py-3.5">Owner / Contact</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Speed Score</th>
                  {user?.role === "ADMIN" && <th className="px-5 py-3.5">Scouted By</th>}
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-muted)]">
                {leads.slice(0, 6).map(lead => (
                  <tr key={lead.id} className="hover:bg-[var(--bg-card-hover)] transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--text-main)]">{lead.businessName}</div>
                      <a 
                        href={lead.websiteUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-[var(--text-muted)] hover:text-[#C5453E] transition truncate max-w-[200px] block"
                      >
                        {lead.websiteUrl}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-medium text-[var(--text-main)]">{lead.ownerName || "Business Owner"}</div>
                      <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-[var(--text-dim)]" />
                        <span>{lead.contactEmail}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-[var(--text-main)]">
                      <div>{lead.city}</div>
                      <span className="text-[10px] text-[var(--text-muted)]">{lead.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        lead.speedScore < 50
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                          : lead.speedScore < 70
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {lead.speedScore}/100
                        <span className="text-[10px] font-normal text-[var(--text-muted)]">({lead.loadTime})</span>
                      </span>
                    </td>
                    {user?.role === "ADMIN" && (
                      <td className="px-5 py-4 text-xs font-mono text-[var(--text-muted)]">
                        {lead.userEmail || "System"}
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-subtle)]">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
