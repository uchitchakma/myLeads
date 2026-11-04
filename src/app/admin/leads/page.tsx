"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Search, 
  Download, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Mail, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  X, 
  Check, 
  Copy, 
  Edit, 
  RefreshCw, 
  FolderPlus, 
  MapPin, 
  Globe, 
  Tag, 
  Users, 
  CheckCircle2, 
  Building2, 
  ShoppingBag,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
  UserCheck,
  Briefcase,
  Star,
  BookOpen,
  MessageCircle,
  Award,
  Megaphone,
  Hammer
} from "lucide-react";
import Link from "next/link";
import { getVerifiedChannelUrl } from "@/lib/url_validator";

export default function MasterLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [campaignFilter, setCampaignFilter] = useState("ALL");
  const [userFilter, setUserFilter] = useState("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Selection & UI State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Modals state
  const [selectedLead, setSelectedLead] = useState<any | null>(null); // For AI Pitch Drawer
  const [pitchGoal, setPitchGoal] = useState<"SALES" | "REAL_ESTATE" | "MARKETING" | "WEB">("SALES");
  const [editingLead, setEditingLead] = useState<any | null>(null); // For Edit Lead Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Group into Campaign Modal State
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [targetCampaignName, setTargetCampaignName] = useState("");
  const [newCampaignInput, setNewCampaignInput] = useState("");

  const getDynamicPitch = (lead: any, goal: "SALES" | "REAL_ESTATE" | "MARKETING" | "WEB") => {
    if (!lead) return { title: "", subjects: [], body: "", whatsapp: "" };
    const name = lead.businessName || "your business";
    const owner = lead.ownerName || "Business Owner";
    const city = lead.city || "your city";
    const category = lead.category || "business";
    const rating = lead.rating ? `${lead.rating}★` : "strong";
    const reviews = lead.reviewCount ? `(${lead.reviewCount} reviews)` : "";

    if (goal === "SALES") {
      return {
        title: "B2B Sales & Partnership",
        subjects: [
          `Partnership proposal for ${name}`,
          `Quick question regarding ${name} in ${city}`,
          `B2B growth collaboration with ${name}`
        ],
        body: `Hi ${owner},\n\nI came across ${name} in ${city} and was impressed by your local reputation ${reviews ? `with ${rating} on Google` : ""}.\n\nWe provide high-value B2B solutions tailored specifically for growing ${category} operators to streamline operations and unlock new customer channels.\n\nWould you be open to a brief 5-minute introductory chat this week to explore if a collaboration makes sense for ${name}?\n\nBest regards,\nUchit Chakma | UCDREAMS`,
        whatsapp: `Hi ${owner}! Impressed by ${name}'s operations in ${city}. Are you currently open to strategic B2B partnerships or expanding client capacity this quarter? Let's connect!`
      };
    } else if (goal === "REAL_ESTATE") {
      return {
        title: "Real Estate & Commercial Opportunities",
        subjects: [
          `Property & location inquiry for ${name}`,
          `Commercial real estate opportunities for ${name} (${city})`,
          `Quick property question for ${owner}`
        ],
        body: `Hi ${owner},\n\nI am reaching out regarding commercial property and facility opportunities for ${name} in the ${city} area.\n\nWe actively work with prime property owners and commercial investors seeking strategic acquisitions, lease renegotiations, and location expansions in high-demand zones.\n\nAre you or your team open to reviewing off-market commercial opportunities or discussing your facility footprint?\n\nBest regards,\nUchit Chakma | Real Estate & Advisory`,
        whatsapp: `Hi ${owner}! Quick real estate inquiry regarding ${name} in ${city}. Are you open to discussing commercial property opportunities or facility expansion?`
      };
    } else if (goal === "MARKETING") {
      return {
        title: "Local SEO & Google 3-Pack Growth",
        subjects: [
          `Google Maps ranking strategy for ${name}`,
          `3 ideas to double local customer calls for ${name}`,
          `Local market question for ${name} in ${city}`
        ],
        body: `Hi ${owner},\n\nI was looking at local ${category} businesses in ${city} and noticed ${name} has built a solid foundation on Google Maps (${rating} ${reviews}).\n\nHowever, with a few targeted local SEO adjustments and inbound review funnels, you could capture the top 3 spots in Google Local Pack searches, bringing 20-30 additional qualified customer calls every month without ad spend.\n\nWould you be open to a quick 2-minute video breakdown of how other local ${category} operators achieved this?\n\nBest regards,\nUchit Chakma | Local Growth Specialist`,
        whatsapp: `Hi ${owner}! Loved ${name}'s Google Maps presence in ${city}. Want a free 2-min breakdown of how you could capture 20+ more monthly calls in the top 3 Google spots?`
      };
    } else {
      const loadTime = lead.speedScore ? `${(100 - lead.speedScore) / 20 + 1.2}s` : "3.8s";
      return {
        title: "Website Speed & Mobile CRO",
        subjects: [
          `Mobile speed bottleneck on ${lead.websiteUrl || name}`,
          `Quick audit of ${name}'s mobile website loading`,
          `Mobile conversion fix for ${name}`
        ],
        body: `Hi ${owner},\n\nI ran a complimentary mobile performance diagnostic on your website (${lead.websiteUrl || name}) and noticed pages take ~${loadTime} to load on mobile connections (PageSpeed score: ${lead.speedScore || 45}/100).\n\nAccording to Google benchmarks, mobile bounce rates spike over 40% when pages take longer than 2.5s to render, losing potential clients to faster competitors.\n\nWe specialize in sub-second mobile funnel optimization to convert more visitors into booked appointments.\n\nWould you be open to a short 2-minute video walkthrough showing the top bottlenecks and how to resolve them?\n\nBest regards,\nUchit Chakma | Technical Director`,
        whatsapp: `Hi ${owner}! Ran a quick mobile diagnostic on ${lead.websiteUrl || name}. Pages take ~${loadTime} on phones, causing client drop-off. Open to a 2-min video showing 3 quick fixes?`
      };
    }
  };

  const showNotification = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsRes, campRes, userRes, usersListRes] = await Promise.all([
        fetch("/api/leads?scope=all"),
        fetch("/api/campaigns"),
        fetch("/api/auth/me"),
        fetch("/api/users")
      ]);

      const leadsData = await leadsRes.json();
      const campData = await campRes.json();
      const userData = await userRes.json();
      const usersListData = await usersListRes.json();

      if (!userData.authenticated || userData.user?.role !== "ADMIN") {
        window.location.href = "/leads";
        return;
      }

      setCurrentUser(userData.user);
      if (leadsData.leads) setLeads(leadsData.leads);
      if (campData.campaigns) setCampaigns(campData.campaigns);
      if (usersListData.users) setUsers(usersListData.users);
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      showNotification("Failed to load Master Database", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads?id=${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      showNotification(`Status updated to ${newStatus}`);
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead from the Master Database?")) return;
    try {
      const res = await fetch(`/api/leads?id=${leadId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete lead");
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setSelectedIds(prev => prev.filter(id => id !== leadId));
      showNotification("Lead deleted successfully");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected leads from the Master Database?`)) return;
    try {
      const res = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (!res.ok) throw new Error("Failed to delete selected leads");
      setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)));
      showNotification(`Successfully deleted ${selectedIds.length} leads`);
      setSelectedIds([]);
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleCleanDuplicates = async () => {
    setCleaningDuplicates(true);
    try {
      const res = await fetch("/api/leads/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "all" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deduplication failed");
      
      showNotification(data.message || `Removed ${data.removedCount} duplicates!`);
      fetchData();
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setCleaningDuplicates(false);
    }
  };

  const handleAssignToCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCampaignName = targetCampaignName === "NEW" ? newCampaignInput.trim() : targetCampaignName;
    if (!finalCampaignName) {
      showNotification("Please specify a campaign name", "error");
      return;
    }

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN_LEADS",
          campaignName: finalCampaignName,
          leadIds: selectedIds
        })
      });
      if (!res.ok) throw new Error("Failed to assign leads to campaign");
      
      setLeads(prev => prev.map(l => selectedIds.includes(l.id) ? { ...l, campaign: finalCampaignName } : l));
      setIsCampaignModalOpen(false);
      setSelectedIds([]);
      setNewCampaignInput("");
      showNotification(`Assigned ${selectedIds.length} leads to "${finalCampaignName}"`);
      
      const campRes = await fetch("/api/campaigns");
      const campData = await campRes.json();
      if (campData.campaigns) setCampaigns(campData.campaigns);
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleSaveEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      const res = await fetch(`/api/leads?id=${editingLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLead)
      });
      if (!res.ok) throw new Error("Failed to save changes");
      setLeads(prev => prev.map(l => l.id === editingLead.id ? editingLead : l));
      setEditingLead(null);
      showNotification("Lead details updated");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const exportCSV = () => {
    const headers = ["Business Name", "Niche", "City", "Website", "Phone", "Email", "Owner", "Harvested By", "Status", "Campaign", "Speed Score"];
    const rows = filteredLeads.map(l => [
      `"${l.businessName || ""}"`,
      `"${l.category || ""}"`,
      `"${l.city || ""}"`,
      `"${l.websiteUrl || ""}"`,
      `"${l.phoneNumber || ""}"`,
      `"${l.contactEmail || ""}"`,
      `"${l.ownerName || ""}"`,
      `"${l.userEmail || "Unknown"}"`,
      `"${l.status || ""}"`,
      `"${l.campaign || ""}"`,
      `"${l.speedScore || ""}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Master_Leads_Database_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(leads.map(l => l.category).filter(Boolean)));

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      lead.city?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phoneNumber?.toLowerCase().includes(search.toLowerCase()) ||
      lead.contactEmail?.toLowerCase().includes(search.toLowerCase()) ||
      lead.websiteUrl?.toLowerCase().includes(search.toLowerCase()) ||
      lead.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      lead.userEmail?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || lead.category === categoryFilter;
    const matchesCampaign = campaignFilter === "ALL" || (campaignFilter === "UNASSIGNED" ? !lead.campaign : lead.campaign === campaignFilter);
    const matchesUser = userFilter === "ALL" || lead.userEmail?.toLowerCase() === userFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory && matchesCampaign && matchesUser;
  });

  // Pagination Calculations
  const totalLeads = filteredLeads.length;
  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(totalLeads / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedLeads = pageSize === -1 
    ? filteredLeads 
    : filteredLeads.slice((validCurrentPage - 1) * pageSize, validCurrentPage * pageSize);

  const startRecord = totalLeads === 0 ? 0 : (validCurrentPage - 1) * (pageSize === -1 ? totalLeads : pageSize) + 1;
  const endRecord = pageSize === -1 ? totalLeads : Math.min(validCurrentPage * pageSize, totalLeads);

  const handleSelectAll = () => {
    const pageIds = paginatedLeads.map(l => l.id);
    const allSelectedOnPage = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));
    if (allSelectedOnPage) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Helper for smart page numbers (e.g. 1, 2, ..., 5, 6, ..., 12)
  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }
    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, campaignFilter, userFilter, pageSize]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] transition-colors">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 pt-20 px-4 pb-12 md:pt-8 md:px-8 md:ml-64">
        {/* Toast Notification */}
        {notification && (
          <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${
            notification.type === "error" 
              ? "bg-red-500/15 border-red-500/30 text-red-500" 
              : notification.type === "info"
              ? "bg-blue-500/15 border-blue-500/30 text-blue-500"
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
                Master Leads Database
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-mono">
                {leads.length} Global Records
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#C5453E] text-white flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3" /> All Users
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Complete organization-wide repository of all leads harvested by all team accounts.
            </p>

            {/* Quick Switcher Tabs */}
            <div className="flex items-center gap-2 mt-3">
              <Link
                href="/leads"
                className="px-3 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)] hover:text-[#C5453E] hover:border-[#C5453E]/40 transition flex items-center gap-1.5"
              >
                <span>← My Personal Leads</span>
              </Link>
              <span className="px-3 py-1 rounded-lg bg-[#C5453E] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Master Database ({leads.length})</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleCleanDuplicates}
              disabled={cleaningDuplicates}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors shadow-sm disabled:opacity-50"
              title="Global Deduplication across all team members"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C5453E] ${cleaningDuplicates ? "animate-spin" : ""}`} />
              <span>Clean Global Duplicates</span>
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C5453E] text-white text-xs font-semibold hover:bg-[#b03d37] transition-all shadow-md shadow-[#C5453E]/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* Filter & Toolbar */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] mb-6 space-y-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
              <input
                type="text"
                placeholder="Search business, owner, city, email, phone, or harvested by..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[#C5453E]"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Team Member Filter */}
              <div className="flex items-center gap-1 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl px-2 py-1">
                <UserCheck className="w-3.5 h-3.5 text-[#C5453E]" />
                <select
                  value={userFilter}
                  onChange={e => setUserFilter(e.target.value)}
                  className="bg-transparent text-xs text-[var(--text-main)] font-medium focus:outline-none cursor-pointer pr-1"
                >
                  <option value="ALL">All Team Members</option>
                  {users.map(u => (
                    <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
              >
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
              >
                <option value="ALL">All Statuses</option>
                <option value="DISCOVERED">Discovered</option>
                <option value="AUDITED">Audited</option>
                <option value="CONTACTED">Contacted</option>
                <option value="REPLIED">Replied</option>
                <option value="CLOSED">Closed</option>
              </select>

              <select
                value={campaignFilter}
                onChange={e => setCampaignFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
              >
                <option value="ALL">All Campaigns</option>
                <option value="UNASSIGNED">Unassigned</option>
                {campaigns.map(c => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Action Sticky Bar (When Items Selected) */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#C5453E]/10 border border-[#C5453E]/30 animate-in fade-in">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#C5453E]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{selectedIds.length} leads selected</span>
                </div>
                {selectedIds.length < filteredLeads.length && (
                  <button
                    onClick={() => setSelectedIds(filteredLeads.map(l => l.id))}
                    className="text-xs underline hover:text-[#b03d37] font-medium transition cursor-pointer"
                  >
                    Select all {filteredLeads.length} leads
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setTargetCampaignName(campaigns[0]?.name || "NEW");
                    setIsCampaignModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C5453E] text-white text-xs font-semibold hover:bg-[#b03d37] transition-all shadow-sm"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Group into Campaign</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-semibold hover:bg-red-500/25 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] px-2 py-1"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---------------- MASTER LEADS TABLE ---------------- */}
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead className="bg-[var(--bg-main)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedLeads.length > 0 && paginatedLeads.every(l => selectedIds.includes(l.id))}
                      onChange={handleSelectAll}
                      className="rounded border-[var(--border-subtle)] text-[#C5453E] focus:ring-[#C5453E]"
                    />
                  </th>
                  <th className="py-3.5 px-4 min-w-[200px]">Business &amp; Rating</th>
                  <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">Category</th>
                  <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">Harvested By</th>
                  <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">Source &amp; Profile Link</th>
                  <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Website</th>
                  <th className="py-3.5 px-4 min-w-[210px]">Owner &amp; Contacts</th>
                  <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">City</th>
                  <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Campaign</th>
                  <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Speed / Health</th>
                  <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 min-w-[110px] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-subtle)] text-xs text-[var(--text-main)]">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="py-16 text-center text-[var(--text-muted)]">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading global database records...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-16 text-center text-[var(--text-muted)]">
                      <Search className="w-8 h-8 mx-auto mb-2 text-[var(--text-dim)] opacity-50" />
                      No leads match your search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map(lead => {
                    const isSelected = selectedIds.includes(lead.id);
                    const isNewBusiness = lead.sourceTechnique === "NEW_BUSINESS_REGISTRATIONS" || (lead.discoverySources && lead.discoverySources.includes("NEW_BUSINESS_REGISTRATIONS"));
                    const isReputation = lead.sourceTechnique === "LOW_RATING_REPUTATION" || (lead.discoverySources && lead.discoverySources.includes("LOW_RATING_REPUTATION"));
                    const isShopify = lead.sourceTechnique === "SHOPIFY_ECOMMERCE" || (lead.discoverySources && lead.discoverySources.includes("SHOPIFY_ECOMMERCE"));
                    const isContractor = lead.sourceTechnique === "HIGH_TICKET_CONTRACTORS" || (lead.discoverySources && lead.discoverySources.includes("HIGH_TICKET_CONTRACTORS"));
                    const isAdSpender = lead.sourceTechnique === "AD_SPENDERS" || (lead.discoverySources && lead.discoverySources.includes("AD_SPENDERS"));
                    const isLinkedIn = lead.sourceTechnique === "LINKEDIN_XRAY" || (lead.discoverySources && lead.discoverySources.includes("LINKEDIN_XRAY"));
                    const isHiring = lead.sourceTechnique === "HIRING_SIGNALS" || (lead.discoverySources && lead.discoverySources.includes("HIRING_SIGNALS"));
                    const isYP = lead.sourceTechnique === "YELLOW_PAGES" || (lead.discoverySources && lead.discoverySources.includes("YELLOW_PAGES"));
                    const isMeta = lead.sourceTechnique === "META_WHATSAPP" || (lead.discoverySources && lead.discoverySources.includes("META_WHATSAPP"));
                    const isClutch = lead.sourceTechnique === "CLUTCH_B2B" || (lead.discoverySources && lead.discoverySources.includes("CLUTCH_B2B"));
                    const isBBB = lead.sourceTechnique === "BBB_TRUST" || (lead.discoverySources && lead.discoverySources.includes("BBB_TRUST"));
                    const isOsm = lead.sourceTechnique === "OPEN_STREET_MAP" || (lead.discoverySources && lead.discoverySources.includes("OPEN_STREET_MAP") && !lead.discoverySources.includes("GOOGLE_MAPS") && !lead.discoverySources.includes("YELP") && !lead.discoverySources.includes("LINKEDIN_XRAY"));
                    const isYelp = lead.sourceTechnique === "YELP" || (lead.discoverySources && lead.discoverySources.includes("YELP") && !lead.discoverySources.includes("GOOGLE_MAPS"));
                    const isMerged = lead.sourceTechnique === "ALL_SOURCES" || (lead.discoverySources && lead.discoverySources.length > 1);

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-[var(--bg-main)]/60 transition-colors ${
                          isSelected ? "bg-[#C5453E]/5" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(lead.id)}
                            className="rounded border-[var(--border-subtle)] text-[#C5453E] focus:ring-[#C5453E]"
                          />
                        </td>

                        {/* Business & Rating */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[var(--text-main)] max-w-[220px] truncate">
                            {lead.businessName}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {lead.ownerName && lead.ownerName !== "Business Principal" && lead.ownerName !== "Business Principal / Owner" ? (
                              <span className="text-[10px] font-semibold text-sky-500 flex items-center gap-0.5">
                                <Users className="w-2.5 h-2.5" /> {lead.ownerName}
                              </span>
                            ) : lead.rating ? (
                              <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-0.5">
                                ★ {lead.rating}
                              </span>
                            ) : null}
                            {lead.reviewCount ? (
                              <span className="text-[10px] text-[var(--text-dim)] font-mono">
                                ({lead.reviewCount} reviews)
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] whitespace-nowrap shadow-xs">
                            <Building2 className="w-3.5 h-3.5 text-[#C5453E]/80 shrink-0" />
                            <span>{lead.category || "General B2B"}</span>
                          </span>
                        </td>

                        {/* Harvested By Team Member */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)] shadow-xs">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#C5453E] to-amber-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                              {lead.userEmail ? lead.userEmail[0].toUpperCase() : "U"}
                            </div>
                            <span className="truncate max-w-[140px]" title={lead.userEmail}>
                              {lead.userEmail || "Unknown"}
                            </span>
                          </div>
                        </td>

                        {/* Discovery Source & Profile Link */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isNewBusiness ? (
                            <a
                              href={getVerifiedChannelUrl("NEW_BUSINESS_REGISTRATIONS", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open OpenCorporates / State Filing Record"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>New Filing</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isReputation ? (
                            <a
                              href={getVerifiedChannelUrl("LOW_RATING_REPUTATION", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600/10 text-rose-600 dark:text-rose-400 border border-rose-600/20 text-xs font-semibold hover:bg-rose-600/20 transition whitespace-nowrap shadow-xs"
                              title="Open Trustpilot Reputation Profile"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>Trustpilot Reviews</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isShopify ? (
                            <a
                              href={getVerifiedChannelUrl("SHOPIFY_ECOMMERCE", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open Shopify Online Storefront"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>Shopify Store</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isContractor ? (
                            <a
                              href={getVerifiedChannelUrl("HIGH_TICKET_CONTRACTORS", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open Verified Houzz / Thumbtack Contractor Listing"
                            >
                              <Hammer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>Houzz &amp; Thumbtack</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isAdSpender ? (
                            <div className="inline-flex items-center gap-1.5 flex-nowrap">
                              <a
                                href={`https://adstransparency.google.com/search?q=${encodeURIComponent(lead.businessName || "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-semibold hover:bg-blue-500/20 transition whitespace-nowrap shadow-xs"
                                title="Check Active Search & Display Campaigns in Google Ads Transparency Center"
                              >
                                <Megaphone className="w-3 h-3 text-blue-500 shrink-0" />
                                <span>Google Ads</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                              </a>
                              <a
                                href={`https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${encodeURIComponent(lead.businessName || "")}&search_type=keyword_unordered&media_type=all`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition whitespace-nowrap shadow-xs"
                                title="Check Meta / Instagram Campaigns in Meta Ad Library"
                              >
                                <span>Meta Ads</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                              </a>
                            </div>
                          ) : isLinkedIn ? (
                            <a
                              href={getVerifiedChannelUrl("LINKEDIN_XRAY", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-semibold hover:bg-sky-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open Verified LinkedIn Executive Profile Search"
                            >
                              <Users className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span>LinkedIn Profile</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isHiring ? (
                            <a
                              href={getVerifiedChannelUrl("HIRING_SIGNALS", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open Job Posting & Hiring Signals"
                            >
                              <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>Job Posting</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isYP ? (
                            <a
                              href={getVerifiedChannelUrl("YELLOW_PAGES", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-semibold hover:bg-orange-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open YellowPages Listing"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              <span>YellowPages</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isMeta ? (
                            <a
                              href={getVerifiedChannelUrl("META_WHATSAPP", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open Instagram / WhatsApp Channel"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>WhatsApp &amp; IG</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isClutch ? (
                            <a
                              href={getVerifiedChannelUrl("CLUTCH_B2B", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold hover:bg-indigo-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open Clutch Verified Profile"
                            >
                              <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>Clutch B2B</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isBBB ? (
                            <a
                              href={getVerifiedChannelUrl("BBB_TRUST", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-semibold hover:bg-teal-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open BBB Accreditation Profile"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                              <span>BBB Trust</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isYelp ? (
                            <a
                              href={getVerifiedChannelUrl("YELP", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open Yelp Directory Listing"
                            >
                              <Star className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span>Yelp Directory</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isOsm ? (
                            <a
                              href={getVerifiedChannelUrl("OPEN_STREET_MAP", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open OpenStreetMap Node"
                            >
                              <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>OpenStreetMap</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isMerged ? (
                            <a
                              href={getVerifiedChannelUrl("GOOGLE_MAPS", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-semibold hover:bg-purple-500/20 transition whitespace-nowrap shadow-xs"
                              title="View Multi-Source Verification"
                            >
                              <Layers className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                              <span>All Sources</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : (
                            <a
                              href={getVerifiedChannelUrl("GOOGLE_MAPS", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-semibold hover:bg-blue-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open Google Maps Profile"
                            >
                              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>Google Maps</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          )}
                        </td>

                        {/* Website */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {lead.websiteUrl ? (
                            <a
                              href={lead.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-[var(--text-muted)] hover:text-[#C5453E] hover:underline flex items-center gap-1"
                            >
                              <Globe className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                              <span className="max-w-[130px] truncate">{lead.websiteUrl.replace(/^https?:\/\/(www\.)?/, "")}</span>
                            </a>
                          ) : (
                            <span className="text-[var(--text-dim)]">N/A</span>
                          )}
                        </td>

                        {/* Contacts */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {lead.phoneNumber ? (
                              <div className="flex items-center gap-1.5 text-xs text-[var(--text-main)]">
                                <Phone className="w-3 h-3 text-[var(--text-dim)] shrink-0" />
                                <span>{lead.phoneNumber}</span>
                                <button
                                  onClick={() => handleCopy(lead.phoneNumber, `phone-${lead.id}`)}
                                  className="text-[var(--text-dim)] hover:text-[#C5453E]"
                                  title="Copy phone"
                                >
                                  {copiedId === `phone-${lead.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            ) : null}
                            {lead.contactEmail ? (
                              <div className="flex items-center gap-1.5 text-xs text-[var(--text-main)]">
                                <Mail className="w-3 h-3 text-[var(--text-dim)] shrink-0" />
                                <span className="truncate max-w-[140px]">{lead.contactEmail}</span>
                                <button
                                  onClick={() => handleCopy(lead.contactEmail, `email-${lead.id}`)}
                                  className="text-[var(--text-dim)] hover:text-[#C5453E]"
                                  title="Copy email"
                                >
                                  {copiedId === `email-${lead.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </td>

                        {/* City */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-[var(--text-muted)]">
                            <MapPin className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                            <span>{lead.city || "Various"}</span>
                          </div>
                        </td>

                        {/* Campaign */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {lead.campaign ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#C5453E]/10 border border-[#C5453E]/20 text-[#C5453E] text-[11px] font-semibold">
                              <Tag className="w-2.5 h-2.5" />
                              <span className="max-w-[100px] truncate">{lead.campaign}</span>
                            </span>
                          ) : (
                            <span className="text-[var(--text-dim)] text-[11px]">Unassigned</span>
                          )}
                        </td>

                        {/* Speed / Health */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {lead.speedScore ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                lead.speedScore >= 80 ? "bg-emerald-500" : lead.speedScore >= 50 ? "bg-amber-500" : "bg-red-500"
                              }`} />
                              <span className="font-semibold text-xs">{lead.speedScore}/100</span>
                            </div>
                          ) : (
                            <span className="text-[var(--text-dim)]">Untested</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            value={lead.status || "DISCOVERED"}
                            onChange={e => handleStatusChange(lead.id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:border-[#C5453E] cursor-pointer"
                          >
                            <option value="DISCOVERED">Discovered</option>
                            <option value="AUDITED">Audited</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="REPLIED">Replied</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="p-1.5 rounded-lg bg-[#C5453E]/10 text-[#C5453E] hover:bg-[#C5453E] hover:text-white transition shadow-xs"
                              title="Generate AI Cold Pitch"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEditingLead(lead)}
                              className="p-1.5 rounded-lg bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
                              title="Edit Lead"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-1.5 rounded-lg bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-red-500 transition"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ---------------- PAGINATION BAR ---------------- */}
          {totalLeads > 0 && (
            <div className="p-4 bg-[var(--bg-main)]/60 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
              {/* Left: Record Range & Rows Per Page */}
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                <div>
                  Showing <span className="font-semibold text-[var(--text-main)]">{startRecord}</span> to{" "}
                  <span className="font-semibold text-[var(--text-main)]">{endRecord}</span> of{" "}
                  <span className="font-semibold text-[var(--text-main)]">{totalLeads}</span> global leads
                </div>

                <div className="flex items-center gap-2 border-l border-[var(--border-subtle)] pl-4">
                  <span className="text-[var(--text-muted)]">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={e => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:border-[#C5453E] cursor-pointer"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={-1}>All ({totalLeads})</option>
                  </select>
                </div>
              </div>

              {/* Right: Page Navigation Buttons */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={validCurrentPage === 1}
                    title="First Page"
                    className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] hover:border-[#C5453E]/40 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={validCurrentPage === 1}
                    title="Previous Page"
                    className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] hover:border-[#C5453E]/40 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {getPageNumbers(validCurrentPage, totalPages).map((p, idx) => {
                      if (p === "...") {
                        return (
                          <span key={`dots-${idx}`} className="px-2 py-1 text-[var(--text-dim)] select-none">
                            ...
                          </span>
                        );
                      }
                      const pageNum = Number(p);
                      const isActive = pageNum === validCurrentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isActive
                              ? "bg-[#C5453E] text-white shadow-md shadow-[#C5453E]/25"
                              : "bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] hover:border-[#C5453E]/40"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={validCurrentPage === totalPages}
                    title="Next Page"
                    className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] hover:border-[#C5453E]/40 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={validCurrentPage === totalPages}
                    title="Last Page"
                    className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] hover:border-[#C5453E]/40 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------------- GROUP INTO CAMPAIGN MODAL ---------------- */}
        {isCampaignModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-[#C5453E]" />
                  <h3 className="text-base font-bold text-[var(--text-main)]">
                    Group {selectedIds.length} Leads into Campaign
                  </h3>
                </div>
                <button
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAssignToCampaign} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    Select Existing Campaign
                  </label>
                  <select
                    value={targetCampaignName}
                    onChange={e => setTargetCampaignName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                  >
                    {campaigns.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                    <option value="NEW">+ Create New Campaign</option>
                  </select>
                </div>

                {targetCampaignName === "NEW" && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      New Campaign Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Q4 High-Value Outreach"
                      value={newCampaignInput}
                      onChange={e => setNewCampaignInput(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCampaignModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#C5453E] text-white text-xs font-semibold hover:bg-[#b03d37] shadow-md shadow-[#C5453E]/20"
                  >
                    Assign Leads
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- EDIT LEAD MODAL ---------------- */}
        {editingLead && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
                <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#C5453E]" />
                  Edit Lead Information
                </h3>
                <button
                  onClick={() => setEditingLead(null)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditLead} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[var(--text-muted)] font-semibold mb-1">Business Name</label>
                  <input
                    type="text"
                    value={editingLead.businessName || ""}
                    onChange={e => setEditingLead({ ...editingLead, businessName: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--text-muted)] font-semibold mb-1">Category / Niche</label>
                    <input
                      type="text"
                      value={editingLead.category || ""}
                      onChange={e => setEditingLead({ ...editingLead, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] font-semibold mb-1">City</label>
                    <input
                      type="text"
                      value={editingLead.city || ""}
                      onChange={e => setEditingLead({ ...editingLead, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--text-muted)] font-semibold mb-1">Website URL</label>
                    <input
                      type="url"
                      value={editingLead.websiteUrl || ""}
                      onChange={e => setEditingLead({ ...editingLead, websiteUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editingLead.phoneNumber || ""}
                      onChange={e => setEditingLead({ ...editingLead, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--text-muted)] font-semibold mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={editingLead.contactEmail || ""}
                      onChange={e => setEditingLead({ ...editingLead, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] font-semibold mb-1">Owner / Decision Maker</label>
                    <input
                      type="text"
                      value={editingLead.ownerName || ""}
                      onChange={e => setEditingLead({ ...editingLead, ownerName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setEditingLead(null)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#C5453E] text-white text-xs font-semibold hover:bg-[#b03d37]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- AI PITCH DRAWER ---------------- */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-xl bg-[var(--bg-card)] border-l border-[var(--border-subtle)] shadow-2xl h-full flex flex-col p-6 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#C5453E]/10 text-[#C5453E] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-main)]">{selectedLead.businessName}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{selectedLead.category} in {selectedLead.city}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pitch Objective Selector */}
              <div className="py-4 border-b border-[var(--border-subtle)]">
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Pitch Objective
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setPitchGoal("SALES")}
                    className={`p-2.5 rounded-xl border text-left font-medium transition ${
                      pitchGoal === "SALES" ? "bg-[#C5453E]/10 border-[#C5453E] text-[#C5453E]" : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                    }`}
                  >
                    💼 B2B Partnership
                  </button>
                  <button
                    onClick={() => setPitchGoal("MARKETING")}
                    className={`p-2.5 rounded-xl border text-left font-medium transition ${
                      pitchGoal === "MARKETING" ? "bg-[#C5453E]/10 border-[#C5453E] text-[#C5453E]" : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                    }`}
                  >
                    📍 Local SEO &amp; Maps
                  </button>
                  <button
                    onClick={() => setPitchGoal("WEB")}
                    className={`p-2.5 rounded-xl border text-left font-medium transition ${
                      pitchGoal === "WEB" ? "bg-[#C5453E]/10 border-[#C5453E] text-[#C5453E]" : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                    }`}
                  >
                    ⚡ Speed &amp; CRO Funnel
                  </button>
                  <button
                    onClick={() => setPitchGoal("REAL_ESTATE")}
                    className={`p-2.5 rounded-xl border text-left font-medium transition ${
                      pitchGoal === "REAL_ESTATE" ? "bg-[#C5453E]/10 border-[#C5453E] text-[#C5453E]" : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                    }`}
                  >
                    🏢 Commercial Real Estate
                  </button>
                </div>
              </div>

              {/* Pitch Content Display */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {(() => {
                  const pitch = getDynamicPitch(selectedLead, pitchGoal);
                  return (
                    <>
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                          Recommended Email Subjects
                        </div>
                        <div className="space-y-1.5">
                          {pitch.subjects.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]">
                              <span>{s}</span>
                              <button
                                onClick={() => handleCopy(s, `subj-${idx}`)}
                                className="text-[var(--text-muted)] hover:text-[#C5453E] ml-2"
                              >
                                {copiedId === `subj-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                          <span>Personalized Email Pitch</span>
                          <button
                            onClick={() => handleCopy(pitch.body, "pitch-body")}
                            className="text-[#C5453E] hover:underline flex items-center gap-1 font-medium capitalize"
                          >
                            {copiedId === "pitch-body" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            Copy Full Body
                          </button>
                        </div>
                        <pre className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] whitespace-pre-wrap font-sans leading-relaxed">
                          {pitch.body}
                        </pre>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                          <span>WhatsApp &amp; SMS 1-Liner</span>
                          <button
                            onClick={() => handleCopy(pitch.whatsapp, "pitch-wa")}
                            className="text-[#C5453E] hover:underline flex items-center gap-1 font-medium capitalize"
                          >
                            {copiedId === "pitch-wa" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            Copy SMS
                          </button>
                        </div>
                        <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] leading-relaxed">
                          {pitch.whatsapp}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 rounded-xl bg-[#C5453E] text-white text-xs font-semibold hover:bg-[#b03d37]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
