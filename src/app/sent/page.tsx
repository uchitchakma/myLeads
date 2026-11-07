"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { 
  Send, 
  Mail, 
  MailCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  ExternalLink, 
  Copy, 
  Check, 
  Eye, 
  X, 
  RefreshCw, 
  MessageSquare,
  MessageCircle,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Activity,
  Zap
} from "lucide-react";
import { getWhatsAppClickUrl } from "@/lib/url_validator";

interface SentEmailRecord {
  id?: string;
  leadId: string;
  businessName: string;
  recipientEmail: string;
  category: string;
  city: string;
  websiteUrl: string;
  phoneNumber?: string;
  subject: string;
  body: string;
  whatsappPitch?: string;
  status: string;
  sentAt: string;
  openedAt?: string;
  openCount?: number;
  lastOpenedAt?: string;
  userAgent?: string;
}

export default function SentEmailsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPENED" | "SENT" | "UNOPENED" | "FAILED">("ALL");
  const [selectedRecord, setSelectedRecord] = useState<SentEmailRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [simulatingLeadId, setSimulatingLeadId] = useState<string | null>(null);
  const [simulateToast, setSimulateToast] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads?scope=all");
      const data = await res.json();
      if (data.leads && Array.isArray(data.leads)) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error("Failed to fetch leads for sent emails outbox:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Extract all individual sent email records from lead history
  const sentRecords: SentEmailRecord[] = useMemo(() => {
    const list: SentEmailRecord[] = [];

    for (const lead of leads) {
      if (lead.emailHistory && Array.isArray(lead.emailHistory) && lead.emailHistory.length > 0) {
        for (const hist of lead.emailHistory) {
          list.push({
            id: hist.id,
            leadId: lead.id,
            businessName: lead.businessName,
            recipientEmail: hist.recipientEmail || lead.contactEmail || "N/A",
            category: lead.category || "General Business",
            city: lead.city || "Unknown Location",
            websiteUrl: lead.websiteUrl || "",
            phoneNumber: lead.phoneNumber || "",
            subject: hist.subject || `Quick question regarding ${lead.businessName}`,
            body: hist.body || lead.aiPitch?.body || "Email body content recorded.",
            whatsappPitch: lead.aiPitch?.whatsapp || "",
            status: hist.status || "SENT",
            sentAt: hist.sentAt || lead.updatedAt || lead.createdAt,
            openedAt: hist.openedAt,
            openCount: hist.openCount || 0,
            lastOpenedAt: hist.lastOpenedAt,
            userAgent: hist.userAgent
          });
        }
      } else if (lead.status === "CONTACTED" || lead.status === "OPENED") {
        // Fallback for leads marked contacted/opened without history array
        list.push({
          leadId: lead.id,
          businessName: lead.businessName,
          recipientEmail: lead.contactEmail || "N/A",
          category: lead.category || "General Business",
          city: lead.city || "Unknown Location",
          websiteUrl: lead.websiteUrl || "",
          phoneNumber: lead.phoneNumber || "",
          subject: lead.aiPitch?.subjects?.[0] || `Quick question regarding ${lead.businessName}`,
          body: lead.aiPitch?.body || "Email body content recorded.",
          whatsappPitch: lead.aiPitch?.whatsapp || "",
          status: "SENT",
          sentAt: lead.updatedAt || lead.createdAt,
          openCount: lead.status === "OPENED" ? 1 : 0,
          openedAt: lead.status === "OPENED" ? lead.updatedAt : undefined
        });
      }
    }

    // Sort newest to oldest
    return list.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [leads]);

  // Filtering
  const filteredRecords = useMemo(() => {
    return sentRecords.filter(r => {
      const matchesSearch = 
        r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === "ALL" ? true :
        statusFilter === "OPENED" ? (r.openCount || 0) > 0 :
        statusFilter === "UNOPENED" ? (r.openCount || 0) === 0 :
        statusFilter === "SENT" ? (r.status === "SENT" || r.status === "SIMULATED_SENT") :
        (r.status === "FAILED");

      return matchesSearch && matchesStatus;
    });
  }, [sentRecords, searchQuery, statusFilter]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulateOpen = async (record: SentEmailRecord) => {
    setSimulatingLeadId(record.leadId);
    try {
      const res = await fetch(`/api/tracking/open?tid=${record.id || ""}&lid=${record.leadId}&action=simulate`);
      const data = await res.json();
      if (data.success) {
        setSimulateToast(`Recorded open trigger for ${record.businessName} (Total: ${data.openCount}x)`);
        if (selectedRecord && selectedRecord.leadId === record.leadId) {
          setSelectedRecord(prev => prev ? {
            ...prev,
            openCount: data.openCount,
            lastOpenedAt: new Date().toISOString(),
            openedAt: prev.openedAt || new Date().toISOString()
          } : null);
        }
        await fetchLeads();
      } else {
        setSimulateToast(`Could not record open: ${data.message || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("Simulation failed:", err);
      setSimulateToast("Failed to simulate open event.");
    } finally {
      setSimulatingLeadId(null);
      setTimeout(() => setSimulateToast(null), 4000);
    }
  };

  const totalDelivered = sentRecords.filter(r => r.status === "SENT" || r.status === "SIMULATED_SENT").length;
  const totalOpened = sentRecords.filter(r => (r.openCount || 0) > 0).length;
  const openRate = sentRecords.length > 0 ? Math.round((totalOpened / sentRecords.length) * 100) : 0;
  const uniqueBusinesses = new Set(sentRecords.map(r => r.leadId)).size;

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden md:pl-64">
        {/* Top Header */}
        <header className="h-16 border-b border-[var(--border-subtle)] px-6 flex items-center justify-between bg-[var(--bg-card)] shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#C5453E]/10 text-[#C5453E]">
              <MailCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--text-main)] tracking-tight flex items-center gap-2">
                Sent Emails Outbox
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold border border-emerald-500/20">
                  Live History
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-semibold border border-amber-500/20 flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 animate-pulse" />
                  Pixel Tracking Active
                </span>
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Track dispatched cold emails, monitor real-time recipient opens, and launch instant follow-ups.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeads}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-main)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition text-[var(--text-main)] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#C5453E]" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* Global Toast */}
        {simulateToast && (
          <div className="bg-amber-500/90 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 fill-white" />
              <span>{simulateToast}</span>
            </div>
            <button onClick={() => setSimulateToast(null)} className="opacity-80 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats Grid - 4 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-medium text-[var(--text-muted)]">Total Dispatched</div>
                <div className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{sentRecords.length}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-medium text-[var(--text-muted)]">Delivered Successfully</div>
                <div className="text-2xl font-bold text-emerald-500 mt-0.5">
                  {totalDelivered}
                  <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5">
                    ({sentRecords.length > 0 ? Math.round((totalDelivered / sentRecords.length) * 100) : 100}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-medium text-[var(--text-muted)]">Emails Opened</div>
                <div className="text-2xl font-bold text-amber-500 mt-0.5">
                  {totalOpened}
                  <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5">
                    ({openRate}% rate)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-medium text-[var(--text-muted)]">Unique Companies</div>
                <div className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{uniqueBusinesses}</div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by company, email, subject, or niche..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[#C5453E]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
              </span>
              <div className="flex items-center rounded-xl bg-[var(--bg-main)] p-1 border border-[var(--border-subtle)] text-xs font-medium shrink-0">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1 rounded-lg transition ${
                    statusFilter === "ALL"
                      ? "bg-[#C5453E] text-white shadow-xs font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  All ({sentRecords.length})
                </button>
                <button
                  onClick={() => setStatusFilter("OPENED")}
                  className={`px-3 py-1 rounded-lg transition ${
                    statusFilter === "OPENED"
                      ? "bg-amber-500 text-white shadow-xs font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Opened ({totalOpened})
                </button>
                <button
                  onClick={() => setStatusFilter("SENT")}
                  className={`px-3 py-1 rounded-lg transition ${
                    statusFilter === "SENT"
                      ? "bg-emerald-600 text-white shadow-xs font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Delivered ({totalDelivered})
                </button>
                <button
                  onClick={() => setStatusFilter("UNOPENED")}
                  className={`px-3 py-1 rounded-lg transition ${
                    statusFilter === "UNOPENED"
                      ? "bg-slate-700 text-white shadow-xs font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Unopened ({sentRecords.length - totalOpened})
                </button>
                <button
                  onClick={() => setStatusFilter("FAILED")}
                  className={`px-3 py-1 rounded-lg transition ${
                    statusFilter === "FAILED"
                      ? "bg-rose-600 text-white shadow-xs font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Failed ({sentRecords.length - totalDelivered})
                </button>
              </div>
            </div>
          </div>

          {/* Sent Emails Table */}
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
                <RefreshCw className="w-6 h-6 text-[#C5453E] animate-spin" />
                <p className="text-xs text-[var(--text-muted)]">Loading sent outreach history...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-muted)]">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-main)]">No Sent Emails Found</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm">
                  {searchQuery 
                    ? `No dispatched emails matched "${searchQuery}". Try clearing your search.` 
                    : "No outreach campaigns have been dispatched yet. When your morning sidecar runs, sent messages will appear here."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-main)]/60 text-[var(--text-muted)] border-b border-[var(--border-subtle)] uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Recipient & Company</th>
                      <th className="py-3 px-4">Subject Line</th>
                      <th className="py-3 px-4">Category & City</th>
                      <th className="py-3 px-4">Dispatched At</th>
                      <th className="py-3 px-4">Delivery</th>
                      <th className="py-3 px-4">Open Tracking</th>
                      <th className="py-3 px-4">WhatsApp</th>
                      <th className="py-3 px-4 text-right">Inspect Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {filteredRecords.map((item, idx) => (
                      <tr 
                        key={`${item.leadId}_${item.id || idx}`}
                        className="hover:bg-[var(--bg-card-hover)] transition group"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                            {item.businessName}
                            {item.websiteUrl && (
                              <a 
                                href={item.websiteUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[var(--text-dim)] hover:text-[#C5453E] transition"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-[var(--text-dim)]" />
                            {item.recipientEmail}
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="truncate font-medium text-[var(--text-main)]" title={item.subject}>
                            {item.subject}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-[var(--text-main)]">{item.category}</div>
                          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[var(--text-dim)]" />
                            {item.city}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[var(--text-muted)] whitespace-nowrap">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-[var(--text-dim)]" />
                            {new Date(item.sentAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.status === "SENT" || item.status === "SIMULATED_SENT" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Sent Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/20">
                              <AlertCircle className="w-3 h-3" /> Lookup Issue
                            </span>
                          )}
                        </td>

                        {/* Open Tracking Column */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {(item.openCount || 0) > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                <Eye className="w-3.5 h-3.5" />
                                Opened ({item.openCount}x)
                              </span>
                              {item.lastOpenedAt && (
                                <span className="text-[10px] text-[var(--text-muted)] font-mono pl-1">
                                  {new Date(item.lastOpenedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                              <Eye className="w-3 h-3 text-[var(--text-dim)]" />
                              Unopened
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {(() => {
                            const waUrl = getWhatsAppClickUrl(item.phoneNumber, item.whatsappPitch, item.businessName);
                            if (waUrl && item.phoneNumber) {
                              return (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 text-[11px] font-semibold transition shadow-xs group"
                                  title={`Click to open WhatsApp follow-up with ${item.phoneNumber}`}
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                                  <span className="font-mono text-[10px]">{item.phoneNumber}</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                                </a>
                              );
                            }
                            return (
                              <span className="text-[10px] text-[var(--text-dim)] italic px-1">Unavailable</span>
                            );
                          })()}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedRecord(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-[var(--bg-main)] border border-[var(--border-subtle)] hover:border-[#C5453E] hover:text-[#C5453E] transition text-xs shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Email
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Inspect Email Modal / Drawer */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#C5453E]/10 text-[#C5453E]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                      {selectedRecord.businessName}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold border border-emerald-500/20">
                        Dispatched Pitch
                      </span>
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      To: {selectedRecord.recipientEmail}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message Details */}
              <div className="p-6 overflow-y-auto space-y-5">
                {/* Real-Time Email Open Tracking Card */}
                <div className={`p-4 rounded-xl border transition ${
                  (selectedRecord.openCount || 0) > 0
                    ? "bg-amber-500/5 border-amber-500/30"
                    : "bg-[var(--bg-main)] border-[var(--border-subtle)]"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        (selectedRecord.openCount || 0) > 0 
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" 
                          : "bg-slate-500/15 text-slate-400"
                      }`}>
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                          {(selectedRecord.openCount || 0) > 0 ? (
                            <>
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              </span>
                              Recipient Opened Email! ({selectedRecord.openCount}x total)
                            </>
                          ) : (
                            "Open Tracking: Unopened"
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {(selectedRecord.openCount || 0) > 0 
                            ? `First opened at: ${new Date(selectedRecord.openedAt!).toLocaleString()}${selectedRecord.lastOpenedAt && selectedRecord.lastOpenedAt !== selectedRecord.openedAt ? ` (Last: ${new Date(selectedRecord.lastOpenedAt).toLocaleTimeString()})` : ""}`
                            : "Tracking pixel embedded. When the recipient views this email, the timestamp will appear here automatically."}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSimulateOpen(selectedRecord)}
                      disabled={simulatingLeadId === selectedRecord.leadId}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      title="Simulate open trigger to test database logging"
                    >
                      <Zap className={`w-3.5 h-3.5 ${simulatingLeadId === selectedRecord.leadId ? "animate-spin" : ""}`} />
                      {simulatingLeadId === selectedRecord.leadId ? "Recording..." : "Test Open Trigger"}
                    </button>
                  </div>
                </div>

                {/* Email Meta Card */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] font-semibold">Subject Line:</span>
                    <button
                      onClick={() => handleCopy(selectedRecord.subject, "subj")}
                      className="text-[11px] text-[#C5453E] hover:underline flex items-center gap-1"
                    >
                      {copiedField === "subj" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedField === "subj" ? "Copied" : "Copy Subject"}
                    </button>
                  </div>
                  <div className="text-[var(--text-main)] font-semibold text-sm">
                    {selectedRecord.subject}
                  </div>
                  <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                    <div>
                      <strong>Sender:</strong> Uchit Chakma &lt;uchit@ucdreams.website&gt;
                    </div>
                    <div>
                      <strong>Sent Date:</strong> {new Date(selectedRecord.sentAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5453E]" />
                      Delivered Cold Outreach Email Body:
                    </label>
                    <button
                      onClick={() => handleCopy(selectedRecord.body, "body")}
                      className="text-xs text-[#C5453E] hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedField === "body" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedField === "body" ? "Copied Email Body" : "Copy Body"}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] whitespace-pre-wrap font-sans leading-relaxed shadow-inner">
                    {selectedRecord.body}
                  </div>
                </div>

                {/* Company Context & Instant Follow-Up */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#C5453E]/5 to-amber-500/5 border border-[#C5453E]/20 space-y-3">
                  <div className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C5453E]" />
                    Fast Closing & Follow-Up Channels
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {selectedRecord.phoneNumber && (
                      <span className="font-mono bg-[var(--bg-card)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
                        📞 {selectedRecord.phoneNumber}
                      </span>
                    )}

                    {selectedRecord.websiteUrl && (
                      <a
                        href={selectedRecord.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[#C5453E] hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" /> Visit Website
                      </a>
                    )}
                  </div>

                  {selectedRecord.phoneNumber && (
                    <div className="pt-2 border-t border-[#C5453E]/10">
                      {(() => {
                        const waUrl = getWhatsAppClickUrl(selectedRecord.phoneNumber, selectedRecord.whatsappPitch, selectedRecord.businessName);
                        return waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Send WhatsApp Follow-up Message
                          </a>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-main)]/50 flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
