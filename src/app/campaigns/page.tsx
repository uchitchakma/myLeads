"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Send, 
  Plus, 
  Trash2, 
  Users, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  FolderPlus, 
  SlidersHorizontal, 
  Layers, 
  Search, 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  CheckSquare, 
  Square, 
  X, 
  Edit, 
  Eye, 
  Play, 
  RefreshCw,
  Info,
  Check,
  Copy,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  description?: string;
  targetNiche?: string;
  targetCity?: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
  pitchGoal?: "SALES" | "REAL_ESTATE" | "MARKETING" | "WEB";
  emailSubject?: string;
  emailBody?: string;
  leadIds: string[];
  stats?: {
    totalLeads: number;
    emailsSent: number;
    delivered: number;
    replied: number;
    bounced: number;
    lastSentAt?: string;
  };
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Active Selected Campaign for Outreach / Management
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [campaignLeads, setCampaignLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"OUTREACH" | "LEADS">("OUTREACH");

  // Create / Edit Campaign Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    targetNiche: "Dental Clinic",
    targetCity: "Miami, FL",
    pitchGoal: "SALES" as "SALES" | "REAL_ESTATE" | "MARKETING" | "WEB",
    status: "ACTIVE" as "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED"
  });

  // Add Leads to Active Campaign Modal
  const [isAddLeadsModalOpen, setIsAddLeadsModalOpen] = useState(false);
  const [selectedLeadsToAdd, setSelectedLeadsToAdd] = useState<string[]>([]);
  const [leadsSearch, setLeadsSearch] = useState("");

  // Outreach & Mailing State
  const [selectedLeadIdsForMail, setSelectedLeadIdsForMail] = useState<string[]>([]);
  const [pitchGoal, setPitchGoal] = useState<"SALES" | "REAL_ESTATE" | "MARKETING" | "WEB">("SALES");
  const [emailSubject, setEmailSubject] = useState("Quick question regarding {{businessName}}");
  const [emailBody, setEmailBody] = useState(
    "Hi {{ownerName}},\n\nI came across {{businessName}} in {{city}} and was impressed by your local presence.\n\nWe specialize in high-impact B2B client acquisition and growth strategies for top-tier {{category}} businesses.\n\nWould you be open to a quick 5-minute conversation to explore whether a collaboration makes sense?\n\nBest regards,\nAlex | Client Acquisition"
  );
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [emailProgress, setEmailProgress] = useState({ current: 0, total: 0 });
  const [emailResultLogs, setEmailResultLogs] = useState<any[] | null>(null);

  const showNotification = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campRes, leadsRes] = await Promise.all([
        fetch("/api/campaigns"),
        fetch("/api/leads")
      ]);

      const campData = await campRes.json();
      const leadsData = await leadsRes.json();

      if (campData.campaigns) {
        setCampaigns(campData.campaigns);
      }
      if (leadsData.leads) {
        setAllLeads(leadsData.leads);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      showNotification("Failed to load campaigns", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When activeCampaign changes, sync its leads
  useEffect(() => {
    if (activeCampaign) {
      const filtered = allLeads.filter(l => 
        (activeCampaign.leadIds && activeCampaign.leadIds.includes(l.id)) ||
        l.campaign?.toLowerCase() === activeCampaign.name.toLowerCase()
      );
      setCampaignLeads(filtered);
      setSelectedLeadIdsForMail(filtered.map(l => l.id));
      if (activeCampaign.pitchGoal) {
        setPitchGoal(activeCampaign.pitchGoal);
        updatePitchTemplate(activeCampaign.pitchGoal);
      }
    } else {
      setCampaignLeads([]);
      setSelectedLeadIdsForMail([]);
    }
  }, [activeCampaign, allLeads]);

  const updatePitchTemplate = (goal: "SALES" | "REAL_ESTATE" | "MARKETING" | "WEB") => {
    setPitchGoal(goal);
    if (goal === "SALES") {
      setEmailSubject("Partnership proposal for {{businessName}}");
      setEmailBody(
        "Hi {{ownerName}},\n\nI came across {{businessName}} in {{city}} and was impressed by your reputation with {{rating}}★ on Google.\n\nWe provide high-value B2B solutions tailored specifically for growing {{category}} operators to streamline operations and unlock new customer channels.\n\nWould you be open to a brief 5-minute introductory chat this week to explore if a collaboration makes sense for {{businessName}}?\n\nBest regards,\nAlex | Client Acquisition"
      );
    } else if (goal === "REAL_ESTATE") {
      setEmailSubject("Property & commercial acquisition inquiry for {{businessName}}");
      setEmailBody(
        "Hi {{ownerName}},\n\nI am contacting you regarding {{businessName}}'s location in {{city}}.\n\nWe represent active investors and commercial operators looking for prime assets and business partnerships in {{city}}.\n\nIf you have 5 minutes this week, I'd love to share high-level insights or discuss potential synergy for {{businessName}}.\n\nBest regards,\nAlex | Acquisitions"
      );
    } else if (goal === "MARKETING") {
      setEmailSubject("Dominating {{category}} search in {{city}} - {{businessName}}");
      setEmailBody(
        "Hi {{ownerName}},\n\nI was reviewing top-ranking {{category}} businesses in {{city}} and noticed {{businessName}} has {{reviewCount}} Google reviews.\n\nWith just a few localized ranking adjustments and automated lead capture, we can help {{businessName}} capture 35-50% more local buyer inquiries monthly.\n\nCan I send over a quick 2-minute video breakdown of how you compare to local competitors?\n\nBest regards,\nAlex | Growth Strategist"
      );
    } else if (goal === "WEB") {
      setEmailSubject("Quick note regarding {{businessName}}'s mobile performance");
      setEmailBody(
        "Hi {{ownerName}},\n\nI was looking at {{websiteUrl}} and ran a quick mobile performance audit for {{businessName}} in {{city}}.\n\nYour site currently scores {{speedScore}}/100 on mobile devices (taking ~{{loadTime}} to fully load). According to Google's data, sites taking over 3 seconds lose roughly 35-40% of potential customer inquiries.\n\nI specialize in building ultra-fast, modern web applications that load in under 1.5s to maximize local customer conversions.\n\nWould you be open to a quick 2-minute video showing how we can get your speed to 95+ and double your mobile leads?\n\nBest regards,\nAlex | Web Architect"
      );
    }
  };

  const handleCreateOrUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.name.trim()) {
      showNotification("Please enter a campaign name.", "error");
      return;
    }

    try {
      if (editingCampaign) {
        const res = await fetch("/api/campaigns", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCampaign.id,
            updates: campaignForm
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update campaign");
        showNotification(`Campaign "${campaignForm.name}" updated successfully.`);
      } else {
        const res = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "CREATE",
            ...campaignForm
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create campaign");
        showNotification(`Campaign "${campaignForm.name}" created successfully.`);
      }

      setIsCreateModalOpen(false);
      setEditingCampaign(null);
      fetchData();
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to delete campaign "${campaign.name}"? (Grouped leads will remain safely preserved in your leads database).`)) return;

    try {
      const res = await fetch(`/api/campaigns?id=${campaign.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete campaign");

      showNotification(`Campaign "${campaign.name}" deleted.`);
      if (activeCampaign?.id === campaign.id) {
        setActiveCampaign(null);
      }
      fetchData();
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleRemoveLeadFromCampaign = async (leadId: string) => {
    if (!activeCampaign) return;
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REMOVE_LEADS",
          campaignId: activeCampaign.id,
          campaignName: activeCampaign.name,
          leadIds: [leadId]
        })
      });

      if (!res.ok) throw new Error("Failed to remove lead from campaign");
      showNotification("Lead removed from campaign.");
      fetchData();
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleAddSelectedLeadsToActiveCampaign = async () => {
    if (!activeCampaign || selectedLeadsToAdd.length === 0) return;
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: selectedLeadsToAdd,
          campaignName: activeCampaign.name
        })
      });

      if (!res.ok) throw new Error("Failed to add leads to campaign");
      showNotification(`Added ${selectedLeadsToAdd.length} leads to ${activeCampaign.name}`);
      setIsAddLeadsModalOpen(false);
      setSelectedLeadsToAdd([]);
      fetchData();
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleSendCampaignEmails = async () => {
    if (selectedLeadIdsForMail.length === 0) {
      showNotification("Please select at least one recipient lead.", "error");
      return;
    }

    setIsSendingEmails(true);
    setEmailProgress({ current: 0, total: selectedLeadIdsForMail.length });
    setEmailResultLogs(null);

    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: selectedLeadIdsForMail,
          customSubject: emailSubject,
          customBody: emailBody,
          useAiPitch: false
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mailing failed");

      setEmailResultLogs(data.logs || []);
      showNotification(data.message || `Dispatched ${data.sentCount} outreach emails!`, "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setIsSendingEmails(false);
    }
  };

  // Preview interpolation for first lead
  const previewLead = campaignLeads[0] || allLeads[0] || {
    businessName: "Acme Dental Care",
    ownerName: "Dr. John Doe",
    city: "Miami, FL",
    category: "Dental Clinic",
    websiteUrl: "https://acmedental.com",
    speedScore: 58,
    loadTime: "3.2s",
    rating: 4.9,
    reviewCount: 48
  };

  const interpolateTokens = (text: string) => {
    return text
      .replaceAll("{{businessName}}", previewLead.businessName || "Acme Dental Care")
      .replaceAll("{{ownerName}}", previewLead.ownerName || "Dr. John Doe")
      .replaceAll("{{city}}", previewLead.city || "Miami, FL")
      .replaceAll("{{category}}", previewLead.category || "Dental Clinic")
      .replaceAll("{{websiteUrl}}", previewLead.websiteUrl || "https://acmedental.com")
      .replaceAll("{{speedScore}}", String(previewLead.speedScore || 58))
      .replaceAll("{{loadTime}}", previewLead.loadTime || "3.2s")
      .replaceAll("{{rating}}", String(previewLead.rating || 4.9))
      .replaceAll("{{reviewCount}}", String(previewLead.reviewCount || 48));
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase())) ||
      (c.targetNiche && c.targetNiche.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalGroupedLeads = campaigns.reduce((acc, c) => acc + (c.stats?.totalLeads || c.leadIds?.length || 0), 0);
  const totalEmailsSent = campaigns.reduce((acc, c) => acc + (c.stats?.emailsSent || 0), 0);

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
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">Campaigns & Outreach</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-mono">
                Mailing Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Group your high-intent leads into targeted campaigns and dispatch personalized email outreach blasts.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingCampaign(null);
              setCampaignForm({
                name: "",
                description: "",
                targetNiche: "Dental Clinic",
                targetCity: "Miami, FL",
                pitchGoal: "SALES",
                status: "ACTIVE"
              });
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C5453E] text-white text-sm font-semibold hover:bg-[#b03d37] transition-all shadow-md shadow-[#C5453E]/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Active Campaigns</span>
              <Layers className="w-4 h-4 text-[#C5453E]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-main)]">{campaigns.length}</div>
            <div className="text-[11px] text-[var(--text-dim)] mt-1">Targeted outreach groups</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Grouped Leads</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-main)]">{totalGroupedLeads}</div>
            <div className="text-[11px] text-[var(--text-dim)] mt-1">Assigned across campaigns</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Emails Dispatched</span>
              <Send className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-main)]">{totalEmailsSent}</div>
            <div className="text-[11px] text-[var(--text-dim)] mt-1">Cold outreach sent</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Pure Leads Pool</span>
              <Globe className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-main)]">{allLeads.length}</div>
            <div className="text-[11px] text-[var(--text-dim)] mt-1">Available in database</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              type="text"
              placeholder="Search campaigns by name, niche, or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[#C5453E]"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[var(--text-muted)] text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading campaigns...
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <Send className="w-10 h-10 text-[var(--text-dim)] mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-semibold text-[var(--text-main)]">No campaigns found</h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mx-auto mt-1 mb-6">
              Create your first campaign to group your leads and dispatch personalized outreach emails.
            </p>
            <button
              onClick={() => {
                setEditingCampaign(null);
                setCampaignForm({
                  name: "Miami Real Estate Q4",
                  description: "High-value commercial real estate outreach",
                  targetNiche: "Commercial Real Estate",
                  targetCity: "Miami, FL",
                  pitchGoal: "REAL_ESTATE",
                  status: "ACTIVE"
                });
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C5453E] text-white text-xs sm:text-sm font-semibold hover:bg-[#b03d37] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCampaigns.map(camp => {
              const leadCount = camp.stats?.totalLeads ?? (camp.leadIds?.length || 0);
              const sentCount = camp.stats?.emailsSent ?? 0;

              return (
                <div
                  key={camp.id}
                  className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#C5453E]/40 transition-all p-5 flex flex-col justify-between shadow-sm hover:shadow-md group relative"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider mb-2 ${
                          camp.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                            : camp.status === "PAUSED"
                            ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                            : "bg-[var(--text-dim)]/15 text-[var(--text-muted)] border border-[var(--border-subtle)]"
                        }`}>
                          {camp.status}
                        </span>
                        <h3 className="text-base font-bold text-[var(--text-main)] group-hover:text-[#C5453E] transition-colors line-clamp-1">
                          {camp.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => {
                            setEditingCampaign(camp);
                            setCampaignForm({
                              name: camp.name,
                              description: camp.description || "",
                              targetNiche: camp.targetNiche || "Dental Clinic",
                              targetCity: camp.targetCity || "Miami, FL",
                              pitchGoal: camp.pitchGoal || "SALES",
                              status: camp.status
                            });
                            setIsCreateModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                          title="Edit Campaign"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(camp)}
                          className="p-1.5 rounded-lg hover:bg-red-500/15 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {camp.description && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-4">
                        {camp.description}
                      </p>
                    )}

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {camp.targetNiche && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] font-medium">
                          <Building2 className="w-3 h-3 text-[#C5453E]" />
                          {camp.targetNiche}
                        </span>
                      )}
                      {camp.targetCity && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] font-medium">
                          <MapPin className="w-3 h-3 text-[#C5453E]" />
                          {camp.targetCity}
                        </span>
                      )}
                    </div>

                    {/* Stats Mini Grid */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] mb-5">
                      <div>
                        <div className="text-[10px] text-[var(--text-dim)] uppercase font-semibold">Grouped Leads</div>
                        <div className="text-lg font-bold text-[var(--text-main)]">{leadCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--text-dim)] uppercase font-semibold">Outreach Sent</div>
                        <div className="text-lg font-bold text-blue-500">{sentCount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    onClick={() => {
                      setActiveCampaign(camp);
                      setActiveTab("OUTREACH");
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C5453E] text-white text-xs sm:text-sm font-semibold hover:bg-[#b03d37] transition-all shadow-md shadow-[#C5453E]/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open Outreach Center</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ---------------- ACTIVE CAMPAIGN OUTREACH DRAWER / WORKSPACE ---------------- */}
        {activeCampaign && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
            <div className="w-full max-w-3xl bg-[var(--bg-card)] h-full border-l border-[var(--border-subtle)] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30">
                      Campaign Workspace
                    </span>
                    <span className="text-xs text-[var(--text-dim)]">ID: {activeCampaign.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-main)]">
                    {activeCampaign.name}
                  </h2>
                </div>
                
                <button
                  onClick={() => setActiveCampaign(null)}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-Nav Tabs */}
              <div className="px-6 border-b border-[var(--border-subtle)] flex items-center gap-6 bg-[var(--bg-card)]">
                <button
                  onClick={() => setActiveTab("OUTREACH")}
                  className={`py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === "OUTREACH"
                      ? "border-[#C5453E] text-[#C5453E]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Outreach & Mailing Engine</span>
                </button>

                <button
                  onClick={() => setActiveTab("LEADS")}
                  className={`py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === "LEADS"
                      ? "border-[#C5453E] text-[#C5453E]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Grouped Leads ({campaignLeads.length})</span>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === "OUTREACH" ? (
                  <div className="space-y-6">
                    {/* Strategy Switcher */}
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2.5">
                        1. Select Outreach Strategy & Goal
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "SALES", label: "B2B Sales", icon: Building2 },
                          { id: "REAL_ESTATE", label: "Real Estate", icon: MapPin },
                          { id: "MARKETING", label: "SEO & Ads", icon: Sparkles },
                          { id: "WEB", label: "Website Speed", icon: Globe }
                        ].map(st => {
                          const Icon = st.icon;
                          const isSelected = pitchGoal === st.id;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => updatePitchTemplate(st.id as any)}
                              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                                isSelected
                                  ? "bg-[#C5453E] border-[#C5453E] text-white shadow-md shadow-[#C5453E]/20"
                                  : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{st.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Email Subject */}
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                        2. Email Subject Line
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                      />
                    </div>

                    {/* Email Body */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          3. Pitch Body & Merge Variables
                        </label>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-dim)] font-mono">
                          <span>Available:</span>
                          <span className="text-[#C5453E]">{"{{businessName}}"}</span>
                          <span className="text-[#C5453E]">{"{{ownerName}}"}</span>
                          <span className="text-[#C5453E]">{"{{city}}"}</span>
                        </div>
                      </div>
                      <textarea
                        rows={7}
                        value={emailBody}
                        onChange={e => setEmailBody(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] font-mono focus:outline-none focus:border-[#C5453E]"
                      />
                    </div>

                    {/* Live Preview Box */}
                    <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-3.5 h-3.5 text-[#C5453E]" />
                        <span className="text-xs font-bold text-[var(--text-main)]">Live Render Preview</span>
                        <span className="text-[10px] text-[var(--text-dim)]">
                          (Previewing for: {previewLead.businessName || "Acme Inc"})
                        </span>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2 text-xs">
                        <div className="text-[var(--text-muted)]">
                          <strong className="text-[var(--text-main)]">Subject:</strong> {interpolateTokens(emailSubject)}
                        </div>
                        <div className="whitespace-pre-wrap text-[var(--text-main)] font-sans leading-relaxed pt-2 border-t border-[var(--border-subtle)]">
                          {interpolateTokens(emailBody)}
                        </div>
                      </div>
                    </div>

                    {/* Recipients Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          4. Select Recipients ({selectedLeadIdsForMail.length} of {campaignLeads.length} leads selected)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedLeadIdsForMail.length === campaignLeads.length) {
                              setSelectedLeadIdsForMail([]);
                            } else {
                              setSelectedLeadIdsForMail(campaignLeads.map(l => l.id));
                            }
                          }}
                          className="text-xs font-semibold text-[#C5453E] hover:underline"
                        >
                          {selectedLeadIdsForMail.length === campaignLeads.length ? "Deselect All" : "Select All"}
                        </button>
                      </div>

                      {campaignLeads.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-[var(--border-subtle)] rounded-xl">
                          <p className="text-xs text-[var(--text-muted)] mb-2">No leads grouped in this campaign yet.</p>
                          <button
                            onClick={() => setIsAddLeadsModalOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-[#C5453E]/15 text-[#C5453E] text-xs font-semibold border border-[#C5453E]/30 hover:bg-[#C5453E]/25 transition-all"
                          >
                            + Add Leads from Database
                          </button>
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                          {campaignLeads.map(lead => {
                            const isChecked = selectedLeadIdsForMail.includes(lead.id);
                            return (
                              <label
                                key={lead.id}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors cursor-pointer text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedLeadIdsForMail(prev => prev.filter(id => id !== lead.id));
                                      } else {
                                        setSelectedLeadIdsForMail(prev => [...prev, lead.id]);
                                      }
                                    }}
                                    className="rounded border-[var(--border-subtle)] text-[#C5453E] focus:ring-[#C5453E]"
                                  />
                                  <div>
                                    <div className="font-semibold text-[var(--text-main)]">{lead.businessName}</div>
                                    <div className="text-[10px] text-[var(--text-dim)]">{lead.contactEmail || `contact@${lead.normalizedDomain}`}</div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono text-[var(--text-dim)]">{lead.city}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Dispatch Results Logs */}
                    {emailResultLogs && (
                      <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Dispatch Activity Log</span>
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[11px]">
                          {emailResultLogs.map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)] last:border-0">
                              <span className="text-[var(--text-main)]">{log.businessName} ({log.recipientEmail})</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                log.status === "SENT" || log.status === "SIMULATED_SENT"
                                  ? "bg-emerald-500/15 text-emerald-500"
                                  : "bg-red-500/15 text-red-500"
                              }`}>
                                {log.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* LEADS TAB */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-main)]">
                          Leads in this Campaign ({campaignLeads.length})
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          Manage and organize leads grouped under {activeCampaign.name}.
                        </p>
                      </div>

                      <button
                        onClick={() => setIsAddLeadsModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5453E] text-white text-xs font-semibold hover:bg-[#b03d37] transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Leads</span>
                      </button>
                    </div>

                    {campaignLeads.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-[var(--border-subtle)] rounded-xl">
                        <Users className="w-8 h-8 text-[var(--text-dim)] mx-auto mb-2 opacity-50" />
                        <p className="text-xs text-[var(--text-muted)] mb-3">No leads in this campaign yet.</p>
                        <button
                          onClick={() => setIsAddLeadsModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-[#C5453E] text-white text-xs font-semibold"
                        >
                          + Select Leads from Database
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[var(--bg-main)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] uppercase text-[10px] font-semibold">
                            <tr>
                              <th className="py-3 px-4">Business</th>
                              <th className="py-3 px-4">Contacts</th>
                              <th className="py-3 px-4">Location</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-main)]">
                            {campaignLeads.map(lead => (
                              <tr key={lead.id} className="hover:bg-[var(--bg-main)] transition-colors">
                                <td className="py-3 px-4 font-semibold">
                                  <div>{lead.businessName}</div>
                                  <div className="text-[10px] text-[var(--text-dim)] font-normal">{lead.category}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-[var(--text-main)] font-mono">{lead.phoneNumber || "—"}</div>
                                  <div className="text-[10px] text-[var(--text-dim)]">{lead.contactEmail || `contact@${lead.normalizedDomain}`}</div>
                                </td>
                                <td className="py-3 px-4 text-[var(--text-muted)]">{lead.city}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    lead.status === "CONTACTED"
                                      ? "bg-blue-500/15 text-blue-500"
                                      : lead.status === "CLOSED"
                                      ? "bg-emerald-500/15 text-emerald-500"
                                      : "bg-[var(--text-dim)]/15 text-[var(--text-muted)]"
                                  }`}>
                                    {lead.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => handleRemoveLeadFromCampaign(lead.id)}
                                    className="p-1 rounded text-red-500 hover:bg-red-500/15 transition-colors"
                                    title="Remove from campaign"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              {activeTab === "OUTREACH" && (
                <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between">
                  <div className="text-xs text-[var(--text-muted)]">
                    Ready to dispatch to <strong>{selectedLeadIdsForMail.length}</strong> recipients
                  </div>

                  <button
                    onClick={handleSendCampaignEmails}
                    disabled={isSendingEmails || selectedLeadIdsForMail.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C5453E] text-white text-sm font-semibold hover:bg-[#b03d37] disabled:opacity-50 transition-all shadow-md shadow-[#C5453E]/20"
                  >
                    {isSendingEmails ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending Outreach...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Dispatch Outreach Blast</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- CREATE / EDIT CAMPAIGN MODAL ---------------- */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-5">
                <h3 className="text-lg font-bold text-[var(--text-main)]">
                  {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdateCampaign} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Miami Real Estate Q4"
                    value={campaignForm.name}
                    onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                    Description & Objectives
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of outreach objectives..."
                    value={campaignForm.description}
                    onChange={e => setCampaignForm({ ...campaignForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                      Target Industry
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Commercial Real Estate"
                      value={campaignForm.targetNiche}
                      onChange={e => setCampaignForm({ ...campaignForm, targetNiche: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                      Target City / Market
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Miami, FL"
                      value={campaignForm.targetCity}
                      onChange={e => setCampaignForm({ ...campaignForm, targetCity: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                      Strategy Goal
                    </label>
                    <select
                      value={campaignForm.pitchGoal}
                      onChange={e => setCampaignForm({ ...campaignForm, pitchGoal: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    >
                      <option value="SALES">B2B Sales & Proposal</option>
                      <option value="REAL_ESTATE">Real Estate & Commercial</option>
                      <option value="MARKETING">SEO & Local Marketing</option>
                      <option value="WEB">Website Speed & Audit</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                      Status
                    </label>
                    <select
                      value={campaignForm.status}
                      onChange={e => setCampaignForm({ ...campaignForm, status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="DRAFT">Draft</option>
                      <option value="PAUSED">Paused</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#C5453E] text-white text-xs font-semibold hover:bg-[#b03d37] transition-all shadow-md shadow-[#C5453E]/20"
                  >
                    {editingCampaign ? "Save Changes" : "Create Campaign"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- ADD LEADS TO CAMPAIGN MODAL ---------------- */}
        {isAddLeadsModalOpen && activeCampaign && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl p-6 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)]">
                    Add Leads to {activeCampaign.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Select pure leads from your database to group into this campaign.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddLeadsModalOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  type="text"
                  placeholder="Filter available leads by name, niche, or city..."
                  value={leadsSearch}
                  onChange={e => setLeadsSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#C5453E]"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 border border-[var(--border-subtle)] rounded-xl p-2 mb-4 bg-[var(--bg-main)]">
                {allLeads
                  .filter(l => {
                    const matchesSearch = l.businessName?.toLowerCase().includes(leadsSearch.toLowerCase()) ||
                      l.category?.toLowerCase().includes(leadsSearch.toLowerCase()) ||
                      l.city?.toLowerCase().includes(leadsSearch.toLowerCase());
                    return matchesSearch;
                  })
                  .map(lead => {
                    const isAlreadyInCampaign = (activeCampaign.leadIds || []).includes(lead.id) || lead.campaign === activeCampaign.name;
                    const isChecked = selectedLeadsToAdd.includes(lead.id);

                    return (
                      <label
                        key={lead.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isAlreadyInCampaign 
                            ? "opacity-50 bg-[var(--bg-card)] border-transparent cursor-not-allowed" 
                            : isChecked 
                            ? "bg-[#C5453E]/10 border-[#C5453E]/40" 
                            : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            disabled={isAlreadyInCampaign}
                            checked={isChecked || isAlreadyInCampaign}
                            onChange={() => {
                              if (isAlreadyInCampaign) return;
                              if (isChecked) {
                                setSelectedLeadsToAdd(prev => prev.filter(id => id !== lead.id));
                              } else {
                                setSelectedLeadsToAdd(prev => [...prev, lead.id]);
                              }
                            }}
                            className="rounded border-[var(--border-subtle)] text-[#C5453E] focus:ring-[#C5453E]"
                          />
                          <div>
                            <div className="font-semibold text-[var(--text-main)] flex items-center gap-2">
                              <span>{lead.businessName}</span>
                              {isAlreadyInCampaign && (
                                <span className="text-[10px] text-emerald-500 font-normal">(Already Added)</span>
                              )}
                            </div>
                            <div className="text-[10px] text-[var(--text-dim)]">
                              {lead.category} • {lead.city} • {lead.contactEmail || `contact@${lead.normalizedDomain}`}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--text-dim)]">{lead.phoneNumber}</span>
                      </label>
                    );
                  })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-muted)]">
                  Selected: <strong>{selectedLeadsToAdd.length}</strong> new leads
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddLeadsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSelectedLeadsToActiveCampaign}
                    disabled={selectedLeadsToAdd.length === 0}
                    className="px-5 py-2 rounded-xl bg-[#C5453E] text-white text-xs font-semibold hover:bg-[#b03d37] disabled:opacity-50 transition-all shadow-md shadow-[#C5453E]/20"
                  >
                    Add {selectedLeadsToAdd.length} Leads to Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
