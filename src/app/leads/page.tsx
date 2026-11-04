"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Search, 
  Filter, 
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
  Layers, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  RefreshCw, 
  FolderPlus, 
  Send, 
  MapPin, 
  Globe, 
  Tag, 
  Folder, 
  Star, 
  Users, 
  Briefcase, 
  Zap, 
  SlidersHorizontal, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ArrowUpRight,
  BookOpen,
  MessageCircle,
  Award,
  Megaphone,
  Hammer,
  ShoppingBag,
  AlertTriangle,
  Landmark,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import Link from "next/link";
import { getVerifiedChannelUrl } from "@/lib/url_validator";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [campaignFilter, setCampaignFilter] = useState("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Selection & UI State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Modals state
  const [selectedLead, setSelectedLead] = useState<any | null>(null); // For AI Pitch / Audit Drawer
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
    const website = lead.websiteUrl || "your website";
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
        body: `Hi ${owner},\n\nI came across ${name} in ${city} and was impressed by your local reputation ${reviews ? `with ${rating} on Google` : ""}.\n\nWe provide high-value B2B solutions tailored specifically for growing ${category} operators to streamline operations and unlock new customer channels.\n\nWould you be open to a brief 5-minute introductory chat this week to explore if a collaboration makes sense for ${name}?\n\nBest regards,\nAlex | Client Acquisition`,
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
        body: `Hi ${owner},\n\nI am reaching out regarding commercial property and facility opportunities for ${name} in the ${city} area.\n\nWe actively work with prime property owners and commercial investors seeking strategic acquisitions, lease renegotiations, and location expansions in high-demand zones.\n\nAre you or your team open to reviewing off-market commercial opportunities or discussing your facility footprint?\n\nBest regards,\nAlex | Real Estate & Property Advisory`,
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
        body: `Hi ${owner},\n\nI was looking at local ${category} businesses in ${city} and noticed ${name} has built a solid foundation on Google Maps (${rating} ${reviews}).\n\nHowever, with a few targeted local SEO adjustments and inbound review funnels, you could capture the top 3 spots in Google Local Pack searches, bringing 20-30 additional qualified customer calls every month without ad spend.\n\nWould you be open to a quick 2-minute video breakdown of how other local ${category} operators achieved this?\n\nBest regards,\nAlex | Local Growth Specialist`,
        whatsapp: `Hi ${owner}! Loved seeing ${name}'s ${rating} reviews on Google Maps. We have a simple strategy to get you into the #1 Google Local 3-Pack in ${city}. Want a free 2-min breakdown?`
      };
    } else {
      return {
        title: "Website & Speed Performance Modernization",
        subjects: [
          `Quick note regarding ${name}'s mobile site speed`,
          `Google speed score (${lead.speedScore || 50}/100) for ${name}`,
          `3 mobile performance fixes for ${name}`
        ],
        body: `Hi ${owner},\n\nI was looking at your website (${website}) and ran a quick mobile performance audit for ${name} in ${city}.\n\nYour site currently scores ${lead.speedScore || 50}/100 on mobile devices (taking ~${lead.loadTime || "3.5s"} to fully load). According to Google's data, sites taking over 3 seconds lose roughly 35-40% of potential customer inquiries.\n\nHere are the top bottlenecks we detected:\n  • Unoptimized mobile assets delaying initial screen render\n  • Render-blocking scripts slowing down 4G/5G visitor load\n\nI specialize in building ultra-fast, modern web applications that load in under 1.5s to maximize local customer conversions.\n\nWould you be open to a quick 2-minute video showing how we can get your speed to 95+ and double your mobile leads?\n\nBest regards,\nAlex | Web Architect`,
        whatsapp: `Hi! 👋 I noticed ${name}'s website (${website}) loads in ~${lead.loadTime || "3.5s"} on mobile (score: ${lead.speedScore || 50}/100). Fixing a couple of bottlenecks can cut load time in half and increase calls. Want a free 2-min breakdown?`
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
      const [leadsRes, campRes, userRes] = await Promise.all([
        fetch("/api/leads?scope=my"),
        fetch("/api/campaigns"),
        fetch("/api/auth/me")
      ]);

      const leadsData = await leadsRes.json();
      const campData = await campRes.json();
      const userData = await userRes.json();

      if (userData.authenticated && userData.user) {
        setUser(userData.user);
      } else {
        window.location.href = "/login";
        return;
      }
      if (leadsData.leads) setLeads(leadsData.leads);
      if (campData.campaigns) setCampaigns(campData.campaigns);
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      showNotification("Failed to load leads", "error");
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
    if (!confirm("Are you sure you want to delete this lead?")) return;
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
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected leads?`)) return;

    try {
      const res = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: selectedIds })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete leads");
      
      setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)));
      showNotification(`Deleted ${data.deletedCount || selectedIds.length} leads.`);
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
        body: JSON.stringify({ scope: "my" })
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
      showNotification("Please specify a campaign name.", "error");
      return;
    }
    if (selectedIds.length === 0) {
      showNotification("Please select at least one lead.", "error");
      return;
    }

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: selectedIds,
          campaignName: finalCampaignName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign campaign");

      showNotification(`Grouped ${data.assignedCount} leads into "${finalCampaignName}"!`);
      setIsCampaignModalOpen(false);
      setNewCampaignInput("");
      setTargetCampaignName("");
      setSelectedIds([]);
      fetchData();
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update lead");

      setLeads(prev => prev.map(l => l.id === editingLead.id ? data.lead : l));
      setEditingLead(null);
      showNotification("Lead details updated.");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectAll = () => {
    const pageIds = paginatedLeads.map(l => l.id);
    const allSelectedOnPage = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));
    if (allSelectedOnPage) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const exportCSV = () => {
    const headers = ["Business Name", "Niche", "City", "Website", "Google Maps", "Phone", "Email", "Owner", "Status", "Campaign", "Speed Score"];
    const rows = filteredLeads.map(l => [
      `"${l.businessName || ""}"`,
      `"${l.category || ""}"`,
      `"${l.city || ""}"`,
      `"${l.websiteUrl || ""}"`,
      `"${l.googleMapsUrl || ""}"`,
      `"${l.phoneNumber || ""}"`,
      `"${l.contactEmail || ""}"`,
      `"${l.ownerName || ""}"`,
      `"${l.status || ""}"`,
      `"${l.campaign || ""}"`,
      `"${l.speedScore || ""}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `myLeads_Leads_${new Date().toISOString().split("T")[0]}.csv`);
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
      lead.ownerName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || lead.category === categoryFilter;
    const matchesCampaign = campaignFilter === "ALL" || (campaignFilter === "UNASSIGNED" ? !lead.campaign : lead.campaign === campaignFilter);

    return matchesSearch && matchesStatus && matchesCategory && matchesCampaign;
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
  }, [search, statusFilter, categoryFilter, campaignFilter, pageSize]);

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
                My Harvested Leads
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-mono">
                {leads.length} Records
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Explore your personally harvested B2B leads, track conversion readiness, and launch outreach.
            </p>

            {/* Quick Admin Navigation Switcher */}
            {user?.role === "ADMIN" && (
              <div className="flex items-center gap-2 mt-3">
                <span className="px-3 py-1 rounded-lg bg-[#C5453E] text-white text-xs font-semibold shadow-xs">
                  My Leads ({leads.length})
                </span>
                <Link
                  href="/admin/leads"
                  className="px-3 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)] hover:text-[#C5453E] hover:border-[#C5453E]/40 transition flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Master Database (All Users) →</span>
                </Link>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleCleanDuplicates}
              disabled={cleaningDuplicates}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors shadow-sm disabled:opacity-50"
              title="Deduplicate by normalized domain, phone, and name"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C5453E] ${cleaningDuplicates ? "animate-spin" : ""}`} />
              <span>Clean Duplicates</span>
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
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
              <input
                type="text"
                placeholder="Search by business name, city, phone, email, or owner..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[#C5453E]"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-semibold hover:bg-red-500/25 transition-all"
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

        {/* ---------------- PURE LEADS CRM TABLE ---------------- */}
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[1300px]">
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
                  <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">Category</th>
                  <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">Source &amp; Profile Link</th>
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
                    <td colSpan={11} className="py-16 text-center text-[var(--text-muted)]">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading pure database records...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center text-[var(--text-muted)]">
                      <Search className="w-8 h-8 mx-auto mb-2 text-[var(--text-dim)] opacity-50" />
                      No leads match your search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map(lead => {
                    const isSelected = selectedIds.includes(lead.id);
                    const isUkCompanies = lead.sourceTechnique === "UK_COMPANIES_HOUSE" || (lead.discoverySources && lead.discoverySources.includes("UK_COMPANIES_HOUSE"));
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
                            {lead.ownerName && lead.ownerName !== "Business Principal" && lead.ownerName !== "Business Principal / Owner" && lead.ownerName !== "Principal Officer / General Manager" ? (
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

                        {/* Category / Niche (Spacious, Single-line, No Wrapping) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] whitespace-nowrap shadow-xs">
                            <Building2 className="w-3.5 h-3.5 text-[#C5453E]/80 shrink-0" />
                            <span>{lead.category || "General B2B"}</span>
                          </span>
                        </td>

                        {/* Discovery Source & 1-Click Profile/Map Link (Unified, High-Value) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isUkCompanies ? (
                            <a
                              href={getVerifiedChannelUrl("UK_COMPANIES_HOUSE", lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-semibold hover:bg-purple-500/20 transition whitespace-nowrap shadow-xs"
                              title="Open Official UK Companies House Government Profile"
                            >
                              <Landmark className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                              <span>UK Companies</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            </a>
                          ) : isNewBusiness ? (
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

                        {/* Dedicated Website Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {lead.websiteUrl ? (
                            <a
                              href={lead.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs text-[#C5453E] hover:underline whitespace-nowrap transition-colors max-w-[170px] truncate"
                              title={lead.websiteUrl}
                            >
                              <Globe className="w-3.5 h-3.5 flex-shrink-0 text-[#C5453E]/80" />
                              <span className="truncate">{lead.normalizedDomain || lead.websiteUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]}</span>
                              <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-[var(--text-dim)] italic px-2">No Website</span>
                          )}
                        </td>

                        {/* Owner & Contacts */}
                        <td className="py-3.5 px-4 min-w-[210px]">
                          <div className="font-semibold text-[var(--text-main)] text-xs truncate max-w-[200px]">
                            {lead.ownerName || "Business Principal / Owner"}
                          </div>
                          <div className="flex flex-col gap-1 mt-1">
                            {lead.phoneNumber ? (
                              <a
                                href={`tel:${lead.phoneNumber}`}
                                className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[#C5453E] font-mono whitespace-nowrap transition-colors"
                              >
                                <Phone className="w-3 h-3 text-[var(--text-dim)] shrink-0" />
                                <span>{lead.phoneNumber}</span>
                              </a>
                            ) : null}
                            {lead.contactEmail ? (
                              <a
                                href={`mailto:${lead.contactEmail}`}
                                className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[#C5453E] font-mono max-w-[190px] truncate transition-colors"
                                title={lead.contactEmail}
                              >
                                <Mail className="w-3 h-3 text-[var(--text-dim)] shrink-0" />
                                <span className="truncate">{lead.contactEmail}</span>
                              </a>
                            ) : null}
                          </div>
                        </td>

                        {/* City */}
                        <td className="py-3.5 px-4 text-[var(--text-muted)] text-xs whitespace-nowrap font-medium">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                            <span>{lead.city}</span>
                          </span>
                        </td>

                        {/* Campaign Group */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {lead.campaign ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 whitespace-nowrap">
                              <Folder className="w-3 h-3 shrink-0" />
                              <span className="max-w-[120px] truncate">{lead.campaign}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--text-dim)] italic">Unassigned</span>
                          )}
                        </td>

                        {/* Speed Score / Health */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border whitespace-nowrap ${
                              (lead.speedScore || 0) >= 80 
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
                                : (lead.speedScore || 0) >= 50 
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" 
                                : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                            }`}>
                              {lead.speedScore || 45}/100
                            </span>
                            <span className="text-[11px] text-[var(--text-dim)] font-mono">{lead.loadTime || "3.4s"}</span>
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            value={lead.status}
                            onChange={e => handleStatusChange(lead.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none cursor-pointer ${
                              lead.status === "DISCOVERED"
                                ? "bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-subtle)]"
                                : lead.status === "AUDITED"
                                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                                : lead.status === "CONTACTED"
                                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                                : lead.status === "REPLIED"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            }`}
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
                              onClick={() => {
                                setSelectedLead(lead);
                                setPitchGoal("SALES");
                              }}
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[#C5453E] hover:scale-105 transition shadow-xs"
                              title="Audit Pitch & Video Script"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEditingLead(lead)}
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:scale-105 transition shadow-xs"
                              title="Edit Lead"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/15 text-[var(--text-muted)] hover:text-red-500 hover:scale-105 transition shadow-xs"
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
                  <span className="font-semibold text-[var(--text-main)]">{totalLeads}</span> leads
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
                  {/* First Page Button */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={validCurrentPage === 1}
                    title="First Page"
                    className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] hover:border-[#C5453E]/40 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Previous Page Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={validCurrentPage === 1}
                    title="Previous Page"
                    className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] hover:border-[#C5453E]/40 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Smart Numbered Pills */}
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

                  {/* Next Page Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={validCurrentPage === totalPages}
                    title="Next Page"
                    className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] hover:border-[#C5453E]/40 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last Page Button */}
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
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignToCampaign} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                    Select Target Campaign
                  </label>
                  <select
                    value={targetCampaignName}
                    onChange={e => setTargetCampaignName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                  >
                    {campaigns.map(c => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name} ({c.stats?.totalLeads || c.leadIds?.length || 0} leads)
                      </option>
                    ))}
                    <option value="NEW">+ Create New Campaign</option>
                  </select>
                </div>

                {targetCampaignName === "NEW" && (
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                      New Campaign Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Miami Realtors Q4"
                      value={newCampaignInput}
                      onChange={e => setNewCampaignInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    />
                  </div>
                )}

                <div className="pt-2 text-xs text-[var(--text-dim)] flex items-center justify-between">
                  <span>Grouped leads will be ready for bulk mailing in Campaigns.</span>
                  <Link
                    href="/campaigns"
                    className="text-[#C5453E] hover:underline flex items-center gap-1"
                  >
                    <span>View Campaigns</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setIsCampaignModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#C5453E] text-white text-xs font-semibold hover:bg-[#b03d37] transition-all shadow-md shadow-[#C5453E]/20"
                  >
                    Assign Leads
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- QUICK AUDIT / AI PITCH DRAWER ---------------- */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-[var(--bg-card)] h-full border-l border-[var(--border-subtle)] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30">
                    Lead Intelligence & Pitch
                  </span>
                  <h2 className="text-lg font-bold text-[var(--text-main)] mt-1">
                    {selectedLead.businessName}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Goal Selector */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Pitch Strategy
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "SALES", label: "B2B Sales" },
                      { id: "REAL_ESTATE", label: "Real Estate" },
                      { id: "MARKETING", label: "SEO & Ads" },
                      { id: "WEB", label: "Speed Modernization" }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setPitchGoal(st.id as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          pitchGoal === st.id
                            ? "bg-[#C5453E] border-[#C5453E] text-white shadow-sm"
                            : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Lines */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Subject Lines
                    </span>
                    <button
                      onClick={() => handleCopy(getDynamicPitch(selectedLead, pitchGoal).subjects[0], "subj")}
                      className="text-xs text-[#C5453E] flex items-center gap-1"
                    >
                      {copiedId === "subj" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === "subj" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {getDynamicPitch(selectedLead, pitchGoal).subjects.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-main)]">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email Body */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Cold Email Proposal
                    </span>
                    <button
                      onClick={() => handleCopy(getDynamicPitch(selectedLead, pitchGoal).body, "body")}
                      className="text-xs text-[#C5453E] flex items-center gap-1"
                    >
                      {copiedId === "body" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === "body" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] whitespace-pre-wrap leading-relaxed">
                    {getDynamicPitch(selectedLead, pitchGoal).body}
                  </div>
                </div>

                {/* WhatsApp / SMS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      WhatsApp / Direct SMS
                    </span>
                    <button
                      onClick={() => handleCopy(getDynamicPitch(selectedLead, pitchGoal).whatsapp, "wa")}
                      className="text-xs text-[#C5453E] flex items-center gap-1"
                    >
                      {copiedId === "wa" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === "wa" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]">
                    {getDynamicPitch(selectedLead, pitchGoal).whatsapp}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- EDIT LEAD MODAL ---------------- */}
        {editingLead && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
                <h3 className="text-base font-bold text-[var(--text-main)]">Edit Pure Lead</h3>
                <button onClick={() => setEditingLead(null)} className="text-[var(--text-muted)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditLead} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLead.businessName || ""}
                    onChange={e => setEditingLead({ ...editingLead, businessName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editingLead.phoneNumber || ""}
                      onChange={e => setEditingLead({ ...editingLead, phoneNumber: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={editingLead.contactEmail || ""}
                      onChange={e => setEditingLead({ ...editingLead, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editingLead.category || ""}
                      onChange={e => setEditingLead({ ...editingLead, category: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editingLead.city || ""}
                      onChange={e => setEditingLead({ ...editingLead, city: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={editingLead.websiteUrl || ""}
                    onChange={e => setEditingLead({ ...editingLead, websiteUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  />
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
                    className="px-5 py-2 rounded-xl bg-[#C5453E] text-white text-xs font-semibold hover:bg-[#b03d37]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- ADD PURE LEAD MODAL ---------------- */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
                <h3 className="text-base font-bold text-[var(--text-main)]">Add Pure Lead</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-muted)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  const newLeadData = {
                    businessName: target.businessName.value,
                    phoneNumber: target.phoneNumber.value,
                    contactEmail: target.contactEmail.value,
                    category: target.category.value,
                    city: target.city.value,
                    websiteUrl: target.websiteUrl.value,
                    googleMapsUrl: target.googleMapsUrl.value,
                    ownerName: target.ownerName.value || "Business Principal",
                    status: "DISCOVERED",
                    speedScore: 65,
                    loadTime: "2.4s"
                  };

                  try {
                    const res = await fetch("/api/leads", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newLeadData)
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to add lead");

                    setIsAddModalOpen(false);
                    showNotification(`Added "${newLeadData.businessName}" to database!`);
                    fetchData();
                  } catch (err: any) {
                    showNotification(err.message, "error");
                  }
                }} 
                className="space-y-3"
              >
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    Business Name *
                  </label>
                  <input
                    name="businessName"
                    type="text"
                    required
                    placeholder="e.g. Apex Dental Care"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      Phone Number
                    </label>
                    <input
                      name="phoneNumber"
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      Contact Email
                    </label>
                    <input
                      name="contactEmail"
                      type="email"
                      placeholder="info@example.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      Category / Niche
                    </label>
                    <input
                      name="category"
                      type="text"
                      defaultValue="Dental Clinic"
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      City
                    </label>
                    <input
                      name="city"
                      type="text"
                      defaultValue="Miami, FL"
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      Website URL
                    </label>
                    <input
                      name="websiteUrl"
                      type="url"
                      placeholder="https://example.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                      Owner Name
                    </label>
                    <input
                      name="ownerName"
                      type="text"
                      placeholder="e.g. Dr. Jane Smith"
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    Google Maps Link
                  </label>
                  <input
                    name="googleMapsUrl"
                    type="url"
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#C5453E] text-white text-xs font-semibold hover:bg-[#b03d37]"
                  >
                    Add Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
