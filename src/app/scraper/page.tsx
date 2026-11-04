"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  ExternalLink, 
  Mail, 
  Phone, 
  Zap, 
  Star,
  Globe,
  Layers,
  ArrowRight,
  Check,
  Info,
  ChevronDown,
  X,
  Users,
  Briefcase,
  BookOpen,
  MessageCircle,
  Award,
  ShieldCheck,
  Megaphone,
  Hammer,
  ShoppingBag,
  AlertTriangle,
  Landmark,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { getVerifiedChannelUrl } from "@/lib/url_validator";

export default function ScraperPage() {
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "SEC_EDGAR_FUNDED",
    "UK_COMPANIES_HOUSE",
    "NEW_BUSINESS_REGISTRATIONS",
    "LOW_RATING_REPUTATION",
    "SHOPIFY_ECOMMERCE",
    "HIGH_TICKET_CONTRACTORS",
    "AD_SPENDERS",
    "GOOGLE_MAPS",
    "LINKEDIN_XRAY",
    "HIRING_SIGNALS",
    "YELLOW_PAGES",
    "META_WHATSAPP",
    "CLUTCH_B2B",
    "BBB_TRUST",
    "OPEN_STREET_MAP"
  ]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>(["Dental Clinic"]);
  const [nicheSearch, setNicheSearch] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>(["Miami, FL"]);
  const [citySearch, setCitySearch] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [stepText, setStepText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [dedupStats, setDedupStats] = useState<{ newLeadsSaved: number; duplicatesSkipped: number } | null>(null);

  // Dropdown States
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [isNicheDropdownOpen, setIsNicheDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const sourceRef = useRef<HTMLDivElement>(null);
  const nicheRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const nicheInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  const availableSources = [
    {
      id: "SEC_EDGAR_FUNDED",
      name: "SEC EDGAR (US Form D Venture Capital)",
      tag: "$100k-$15M+ Fresh Capital",
      description: "US companies with confirmed SEC Form D venture funding, named executive officers & capital raised",
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      id: "UK_COMPANIES_HOUSE",
      name: "UK Companies House (Official Gov.uk)",
      tag: "Official Directors & Filings",
      description: "Official UK incorporated entities, registered company numbers, appointed directors & office addresses",
      icon: Landmark,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
      borderColor: "border-purple-600/20"
    },
    {
      id: "NEW_BUSINESS_REGISTRATIONS",
      name: "New Business Registrations (State Filings)",
      tag: "Fresh Registrations / High Intent",
      description: "Brand new registered entities & freshly opened businesses needing websites, Google Maps & branding",
      icon: Sparkles,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20"
    },
    {
      id: "LOW_RATING_REPUTATION",
      name: "Reputation & Low-Rating Targets (Trustpilot)",
      tag: "1.5 - 3.7★ High Pain",
      description: "Businesses suffering from negative reviews & low ratings seeking reputation recovery",
      icon: AlertTriangle,
      color: "text-rose-600",
      bgColor: "bg-rose-600/10",
      borderColor: "border-rose-600/20"
    },
    {
      id: "SHOPIFY_ECOMMERCE",
      name: "Shopify & E-Commerce Brands",
      tag: "DTC Stores & SKUs",
      description: "Direct-to-consumer online brands running on Shopify with live product catalogs",
      icon: ShoppingBag,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      id: "HIGH_TICKET_CONTRACTORS",
      name: "High-Ticket Contractors (Houzz & Thumbtack)",
      tag: "$5k-$50k Projects",
      description: "Roofers, remodelers, custom builders & architects with verified project hires",
      icon: Hammer,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20"
    },
    {
      id: "AD_SPENDERS",
      name: "Paid Ad Spenders (Meta & Google)",
      tag: "Active $1k+/mo Ads",
      description: "Businesses actively running paid Facebook, Instagram & Google Ads",
      icon: Megaphone,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20"
    },
    {
      id: "GOOGLE_MAPS",
      name: "Google Maps",
      tag: "Maps & SEO",
      description: "Star ratings, review counts & verified websites",
      icon: MapPin,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      id: "LINKEDIN_XRAY",
      name: "LinkedIn Decision-Makers",
      tag: "Founders & CEOs",
      description: "Direct owner profiles, executive titles & emails (Zero Login)",
      icon: Users,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20"
    },
    {
      id: "HIRING_SIGNALS",
      name: "Hiring Intent & Jobs",
      tag: "Active Budgets",
      description: "Companies actively recruiting with confirmed expansion budgets",
      icon: Briefcase,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20"
    },
    {
      id: "YELLOW_PAGES",
      name: "YellowPages Directory",
      tag: "Legacy 10+ Yrs",
      description: "Established high-revenue legacy businesses with phone lines & websites",
      icon: BookOpen,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      id: "META_WHATSAPP",
      name: "Meta & WhatsApp X-Ray",
      tag: "WhatsApp & IG",
      description: "Instagram & Facebook profiles with direct WhatsApp click-to-chat links",
      icon: MessageCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      id: "CLUTCH_B2B",
      name: "Clutch B2B Radar",
      tag: "$10k+ Projects & Rates",
      description: "High-ticket service firms with verified hourly rates ($50-$200/hr) & reviews",
      icon: Award,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20"
    },
    {
      id: "BBB_TRUST",
      name: "BBB Trust Directory",
      tag: "A+ Accredited Brands",
      description: "Official BBB A+ accredited businesses & verified General Managers",
      icon: ShieldCheck,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20"
    },
    {
      id: "OPEN_STREET_MAP",
      name: "OpenStreetMap",
      tag: "Global Nodes",
      description: "Global verified physical address nodes & phone lines",
      icon: Globe,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      id: "YELP",
      name: "Yelp Directory",
      tag: "Reviews & Lines",
      description: "Local reviews, price tiers and verified listings",
      icon: Star,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    }
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sourceRef.current && !sourceRef.current.contains(e.target as Node)) {
        setIsSourceDropdownOpen(false);
      }
      if (nicheRef.current && !nicheRef.current.contains(e.target as Node)) {
        setIsNicheDropdownOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nichesList = [
    "Dental Clinic",
    "Real Estate Agency",
    "Commercial Real Estate",
    "Roofing Contractor",
    "Law Firm / Attorney",
    "Plumbing Services",
    "Accounting & CPA",
    "HVAC Repair",
    "Solar Energy",
    "Financial Advisor",
    "Marketing Agency",
    "Cosmetic Surgeon",
    "Auto Repair & Collision",
    "General Contractor",
    "Chiropractor",
    "Veterinary Clinic",
    "Insurance Agency",
    "IT & Cybersecurity Services",
    "Landscaping & Tree Service",
    "Electrician Services",
    "Med Spa & Dermatology",
    "Physical Therapy Clinic",
    "Architecture & Design Firm",
    "Staffing & Recruiting Agency",
    "Cleaning & Janitorial Services",
    "Mortgage Broker",
    "Fitness & Gym Center",
    "Wealth Management",
    "Pest Control Services",
    "Painting Contractor",
    "Web Design & SEO Agency",
    "Flooring Contractor",
    "Locksmith Services",
    "Moving & Storage Company",
    "Property Management",
    "Catering & Event Services"
  ];

  const citiesList = [
    "Miami, FL",
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
    "Dallas, TX",
    "Austin, TX",
    "Atlanta, GA",
    "Phoenix, AZ",
    "Denver, CO",
    "Seattle, WA",
    "San Francisco, CA",
    "San Diego, CA",
    "Boston, MA",
    "Las Vegas, NV",
    "Orlando, FL",
    "Tampa, FL",
    "Nashville, TN",
    "Charlotte, NC",
    "Philadelphia, PA",
    "Washington, DC",
    "Minneapolis, MN",
    "Detroit, MI",
    "Salt Lake City, UT",
    "Raleigh, NC",
    "San Jose, CA",
    "Portland, OR",
    "Toronto, Canada",
    "Vancouver, Canada",
    "Montreal, Canada",
    "London, UK",
    "Manchester, UK",
    "Sydney, Australia",
    "Melbourne, Australia",
    "Dubai, UAE"
  ];

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSources.length === 0) {
      alert("Please select at least one lead discovery channel / source.");
      return;
    }
    if (selectedNiches.length === 0) {
      alert("Please select or enter at least one business category / niche.");
      return;
    }
    if (selectedCities.length === 0) {
      alert("Please select or enter at least one target city / region.");
      return;
    }

    setLoading(true);
    setResults([]);
    setDedupStats(null);
    setIsSourceDropdownOpen(false);
    setIsNicheDropdownOpen(false);
    setIsCityDropdownOpen(false);

    const sourceNames = selectedSources.map(id => availableSources.find(s => s.id === id)?.name || id).join(", ");
    setStepText(`1. Harvesting live listings from ${selectedSources.length === availableSources.length ? "All 5 Channels" : sourceNames}...`);
    await new Promise(r => setTimeout(r, 600));
    setStepText("2. Running Google PageSpeed and Mobile Diagnostics...");
    await new Promise(r => setTimeout(r, 600));
    setStepText("3. AI is preparing personalized audit pitches...");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          niches: selectedNiches,
          cities: selectedCities,
          niche: selectedNiches.join(", "), 
          city: selectedCities.join(", "), 
          count, 
          sources: selectedSources,
          technique: selectedSources.length === availableSources.length ? "ALL_SOURCES" : selectedSources[0]
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scraping failed");
      setResults(data.leads || []);
      setDedupStats({
        newLeadsSaved: data.newLeadsSaved || 0,
        duplicatesSkipped: data.duplicatesSkipped || 0
      });
      setStepText("Complete. Leads audited and saved to database.");
    } catch (err: any) {
      alert("Scrape error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Niches based on search input
  const filteredNiches = nichesList.filter(item => 
    !nicheSearch.trim() || item.toLowerCase().includes(nicheSearch.trim().toLowerCase())
  );

  // Filtered Cities based on search input
  const filteredCities = citiesList.filter(item =>
    !citySearch.trim() || item.toLowerCase().includes(citySearch.trim().toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] transition-colors">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 pt-20 px-4 pb-12 md:pt-8 md:px-8 md:ml-64">
        {/* Header */}
        <div className="pb-6 border-b border-[var(--border-subtle)] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">Lead Harvester</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-mono">
                Multi-Source
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Extract real verified local businesses, LinkedIn decision-makers, hiring signals, and Google ratings with 1 click.
            </p>
          </div>

          <Link
            href="/leads"
            className="px-4 py-2 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-xs font-semibold text-[var(--text-main)] shadow-xs transition text-center"
          >
            View Leads Database
          </Link>
        </div>

        {/* Compact, Clean Multi-Select Discovery Channels Dropdown */}
        <div className="mb-6">
          <div ref={sourceRef} className="relative w-full">
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C5453E]" />
                Discovery Channels &amp; Sources ({selectedSources.length} of {availableSources.length} Active)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSources(availableSources.map(s => s.id))}
                  className="text-[11px] text-[#C5453E] hover:underline font-bold"
                >
                  Select All
                </button>
                <span className="text-[var(--text-dim)]">·</span>
                <button
                  type="button"
                  onClick={() => setSelectedSources([])}
                  className="text-[11px] text-[var(--text-muted)] hover:text-red-500 font-medium"
                >
                  Clear
                </button>
              </div>
            </label>

            {/* Clickable Multi-Select Box */}
            <div 
              onClick={() => {
                setIsSourceDropdownOpen(prev => !prev);
                setIsNicheDropdownOpen(false);
                setIsCityDropdownOpen(false);
              }}
              className="w-full min-h-[46px] p-2 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl flex flex-wrap items-center justify-between gap-1.5 cursor-pointer transition shadow-xs pr-10 relative focus-within:border-[#C5453E]"
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedSources.length === availableSources.length ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 text-xs font-bold font-mono">
                    <Layers className="w-3.5 h-3.5" />
                    <span>All 5 Channels Active (Google + LinkedIn + Jobs + OSM + Yelp)</span>
                  </span>
                ) : selectedSources.length === 0 ? (
                  <span className="text-xs text-[var(--text-muted)] italic px-2">
                    No sources selected. Click to choose lead discovery channels.
                  </span>
                ) : (
                  selectedSources.map(id => {
                    const src = availableSources.find(s => s.id === id);
                    if (!src) return null;
                    const Icon = src.icon;
                    return (
                      <span 
                        key={id} 
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${src.bgColor} ${src.color} ${src.borderColor} animate-in fade-in zoom-in-95`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSources(prev => prev.filter(s => s !== id));
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{src.name}</span>
                        <button
                          type="button"
                          className="p-0.5 hover:opacity-100 opacity-60 rounded transition-opacity"
                          title={`Deselect ${src.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              {/* Right Arrow / Toggle Angle */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSourceDropdownOpen(prev => !prev);
                    setIsNicheDropdownOpen(false);
                    setIsCityDropdownOpen(false);
                  }}
                  className="p-1 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSourceDropdownOpen ? "rotate-180 text-[#C5453E]" : ""}`} />
                </button>
              </div>
            </div>

            {/* Source Dropdown Menu */}
            {isSourceDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-2 max-h-80 overflow-y-auto scrollbar-thin animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1.5 text-[10px] uppercase font-semibold text-[var(--text-dim)] tracking-wider border-b border-[var(--border-subtle)] mb-1.5 flex items-center justify-between">
                  <span>Available Harvester Channels ({availableSources.length})</span>
                  <span className="text-[9px] text-[var(--text-muted)] lowercase">click to toggle multiple</span>
                </div>

                <div className="space-y-1">
                  {availableSources.map(src => {
                    const isChecked = selectedSources.includes(src.id);
                    const Icon = src.icon;

                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedSources(prev => prev.filter(s => s !== src.id));
                          } else {
                            setSelectedSources(prev => [...prev, src.id]);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition text-left ${
                          isChecked 
                            ? "bg-[var(--bg-card-hover)] text-[var(--text-main)] font-semibold border border-[var(--border-subtle)]" 
                            : "text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                            isChecked ? "bg-[#C5453E] border-[#C5453E] text-white" : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${src.bgColor} ${src.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-main)] flex items-center gap-2">
                              <span>{src.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${src.bgColor} ${src.color}`}>
                                {src.tag}
                              </span>
                            </div>
                            <div className="text-[10px] text-[var(--text-dim)] font-normal mt-0.5">{src.description}</div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                          isChecked ? "bg-[#C5453E]/15 text-[#C5453E] font-bold" : "bg-[var(--bg-surface)] text-[var(--text-dim)]"
                        }`}>
                          {isChecked ? "Active" : "Off"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scraper Configuration Form */}
        <div className="card-glass p-6 mb-8 border border-[var(--border-subtle)] relative bg-[var(--bg-card)] rounded-2xl">
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5453E]/5 rounded-full blur-3xl" />
          </div>

          <form onSubmit={handleScrape} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Multi-Select Niche Combobox Dropdown */}
              <div ref={nicheRef} className="relative">
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#C5453E]" />
                    Business Category / Niches ({selectedNiches.length})
                  </span>
                  <div className="relative group flex items-center cursor-help" title="Select multiple niches or type any custom category">
                    <Info className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-colors" />
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex flex-col items-end z-[100] pointer-events-none">
                      <span className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-normal py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap border border-slate-700/50">
                        Pick multiple from dropdown or type and press Enter
                      </span>
                      <span className="w-2 h-2 -mt-1 mr-1.5 rotate-45 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700/50" />
                    </div>
                  </div>
                </label>

                {/* Multi-Select Tag Input Box */}
                <div 
                  onClick={() => {
                    nicheInputRef.current?.focus();
                    setIsNicheDropdownOpen(true);
                    setIsCityDropdownOpen(false);
                  }}
                  className="w-full min-h-[46px] p-2 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl flex flex-wrap items-center gap-1.5 focus-within:border-[#C5453E] focus-within:ring-1 focus-within:ring-[#C5453E] transition cursor-text relative pr-10"
                >
                  {/* Selected Niche Tag Pills */}
                  {selectedNiches.map(item => (
                    <span 
                      key={item} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 text-xs font-semibold animate-in fade-in zoom-in-95 shrink-0"
                    >
                      <Building2 className="w-3 h-3 text-[#C5453E]/70" />
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNiches(prev => prev.filter(n => n !== item));
                        }}
                        className="p-0.5 hover:bg-[#C5453E]/25 rounded transition-colors text-[#C5453E]"
                        title={`Remove ${item}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {/* Inline Search / Custom Input */}
                  <input
                    ref={nicheInputRef}
                    type="text"
                    value={nicheSearch}
                    onFocus={() => {
                      setIsNicheDropdownOpen(true);
                      setIsCityDropdownOpen(false);
                    }}
                    onChange={e => {
                      setNicheSearch(e.target.value);
                      setIsNicheDropdownOpen(true);
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const val = nicheSearch.trim().replace(/^,|,$/g, "");
                        if (val && !selectedNiches.some(n => n.toLowerCase() === val.toLowerCase())) {
                          setSelectedNiches(prev => [...prev, val]);
                          setNicheSearch("");
                        }
                      } else if (e.key === "Backspace" && nicheSearch === "" && selectedNiches.length > 0) {
                        setSelectedNiches(prev => prev.slice(0, -1));
                      }
                    }}
                    placeholder={selectedNiches.length === 0 ? "Search or type custom niche (e.g. Dental)..." : "Add more niches..."}
                    className="flex-1 min-w-[130px] bg-transparent border-none text-[var(--text-main)] text-sm focus:outline-none placeholder:text-[var(--text-dim)] py-0.5 px-1"
                  />

                  {/* Right Action / Dropdown Angle Icon */}
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {selectedNiches.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNiches([]);
                          setNicheSearch("");
                        }}
                        className="p-1 text-[var(--text-dim)] hover:text-red-500 transition-colors"
                        title="Clear all selected"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsNicheDropdownOpen(prev => !prev);
                        setIsCityDropdownOpen(false);
                      }}
                      className="p-1 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isNicheDropdownOpen ? "rotate-180 text-[#C5453E]" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Niche Scrollable Dropdown Menu (Shows ALL 30+ items + Custom Input button) */}
                {isNicheDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-2 max-h-64 overflow-y-auto scrollbar-thin animate-in fade-in slide-in-from-top-2">
                    {/* Header with Counter and Quick Toggle */}
                    <div className="px-2 py-1 text-[10px] uppercase font-semibold text-[var(--text-dim)] tracking-wider border-b border-[var(--border-subtle)] mb-1.5 flex items-center justify-between">
                      <span>Available Niches ({filteredNiches.length})</span>
                      <span className="text-[9px] text-[var(--text-muted)] lowercase">click to select multiple</span>
                    </div>

                    {/* Add Custom Button if user typed something not matching */}
                    {nicheSearch.trim() && !nichesList.some(item => item.toLowerCase() === nicheSearch.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => {
                          const customVal = nicheSearch.trim();
                          if (!selectedNiches.some(n => n.toLowerCase() === customVal.toLowerCase())) {
                            setSelectedNiches(prev => [...prev, customVal]);
                          }
                          setNicheSearch("");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 mb-1.5 rounded-lg text-xs font-semibold bg-[#C5453E]/10 text-[#C5453E] hover:bg-[#C5453E]/20 transition text-left border border-dashed border-[#C5453E]/30"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>+ Add custom: "<strong>{nicheSearch.trim()}</strong>" (Press Enter)</span>
                      </button>
                    )}

                    {/* Scrollable list of suggestions */}
                    {filteredNiches.length === 0 && !nicheSearch.trim() ? (
                      <div className="px-3 py-3 text-xs text-[var(--text-muted)] italic text-center">
                        No presets found. Type custom niche above and hit Enter.
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {filteredNiches.map(item => {
                          const isSelected = selectedNiches.some(n => n.toLowerCase() === item.toLowerCase());

                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedNiches(prev => prev.filter(n => n.toLowerCase() !== item.toLowerCase()));
                                } else {
                                  setSelectedNiches(prev => [...prev, item]);
                                }
                                setNicheSearch("");
                                nicheInputRef.current?.focus();
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition text-left ${
                                isSelected
                                  ? "bg-[#C5453E]/15 text-[#C5453E] font-semibold"
                                  : "text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                                  isSelected ? "bg-[#C5453E] border-[#C5453E] text-white" : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#C5453E]" : "text-[var(--text-dim)]"}`} />
                                <span>{item}</span>
                              </div>
                              <span className="text-[10px] text-[var(--text-dim)] uppercase font-mono">
                                {isSelected ? "Selected" : "Add"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Multi-Select City / Location Combobox Dropdown */}
              <div ref={cityRef} className="relative">
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C5453E]" />
                    Target City / Region ({selectedCities.length})
                  </span>
                  <div className="relative group flex items-center cursor-help" title="Select multiple target markets or enter custom cities">
                    <Info className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-colors" />
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex flex-col items-end z-[100] pointer-events-none">
                      <span className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-normal py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap border border-slate-700/50">
                        Pick multiple cities or type custom city / postal code
                      </span>
                      <span className="w-2 h-2 -mt-1 mr-1.5 rotate-45 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700/50" />
                    </div>
                  </div>
                </label>

                {/* Multi-Select City Tag Input Box */}
                <div 
                  onClick={() => {
                    cityInputRef.current?.focus();
                    setIsCityDropdownOpen(true);
                    setIsNicheDropdownOpen(false);
                  }}
                  className="w-full min-h-[46px] p-2 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl flex flex-wrap items-center gap-1.5 focus-within:border-[#C5453E] focus-within:ring-1 focus-within:ring-[#C5453E] transition cursor-text relative pr-10"
                >
                  {/* Selected City Tag Pills */}
                  {selectedCities.map(item => (
                    <span 
                      key={item} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 text-xs font-semibold animate-in fade-in zoom-in-95 shrink-0"
                    >
                      <MapPin className="w-3 h-3 text-[#C5453E]/70" />
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCities(prev => prev.filter(c => c !== item));
                        }}
                        className="p-0.5 hover:bg-[#C5453E]/25 rounded transition-colors text-[#C5453E]"
                        title={`Remove ${item}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {/* Inline Search / Custom Input */}
                  <input
                    ref={cityInputRef}
                    type="text"
                    value={citySearch}
                    onFocus={() => {
                      setIsCityDropdownOpen(true);
                      setIsNicheDropdownOpen(false);
                    }}
                    onChange={e => {
                      setCitySearch(e.target.value);
                      setIsCityDropdownOpen(true);
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const val = citySearch.trim().replace(/^,|,$/g, "");
                        if (val && !selectedCities.some(c => c.toLowerCase() === val.toLowerCase())) {
                          setSelectedCities(prev => [...prev, val]);
                          setCitySearch("");
                        }
                      } else if (e.key === "Backspace" && citySearch === "" && selectedCities.length > 0) {
                        setSelectedCities(prev => prev.slice(0, -1));
                      }
                    }}
                    placeholder={selectedCities.length === 0 ? "Search or type custom city (e.g. Miami)..." : "Add more cities..."}
                    className="flex-1 min-w-[130px] bg-transparent border-none text-[var(--text-main)] text-sm focus:outline-none placeholder:text-[var(--text-dim)] py-0.5 px-1"
                  />

                  {/* Right Action / Dropdown Angle Icon */}
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {selectedCities.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCities([]);
                          setCitySearch("");
                        }}
                        className="p-1 text-[var(--text-dim)] hover:text-red-500 transition-colors"
                        title="Clear all selected"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCityDropdownOpen(prev => !prev);
                        setIsNicheDropdownOpen(false);
                      }}
                      className="p-1 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCityDropdownOpen ? "rotate-180 text-[#C5453E]" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* City Scrollable Dropdown Menu (Shows ALL 35+ items + Custom Input button) */}
                {isCityDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-2 max-h-64 overflow-y-auto scrollbar-thin animate-in fade-in slide-in-from-top-2">
                    {/* Header with Counter */}
                    <div className="px-2 py-1 text-[10px] uppercase font-semibold text-[var(--text-dim)] tracking-wider border-b border-[var(--border-subtle)] mb-1.5 flex items-center justify-between">
                      <span>Major Metro Markets ({filteredCities.length})</span>
                      <span className="text-[9px] text-[var(--text-muted)] lowercase">click to select multiple</span>
                    </div>

                    {/* Add Custom City Button */}
                    {citySearch.trim() && !citiesList.some(item => item.toLowerCase() === citySearch.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => {
                          const customVal = citySearch.trim();
                          if (!selectedCities.some(c => c.toLowerCase() === customVal.toLowerCase())) {
                            setSelectedCities(prev => [...prev, customVal]);
                          }
                          setCitySearch("");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 mb-1.5 rounded-lg text-xs font-semibold bg-[#C5453E]/10 text-[#C5453E] hover:bg-[#C5453E]/20 transition text-left border border-dashed border-[#C5453E]/30"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>+ Add custom: "<strong>{citySearch.trim()}</strong>" (Press Enter)</span>
                      </button>
                    )}

                    {/* Scrollable list of city suggestions */}
                    {filteredCities.length === 0 && !citySearch.trim() ? (
                      <div className="px-3 py-3 text-xs text-[var(--text-muted)] italic text-center">
                        No presets found. Type custom city above and hit Enter.
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {filteredCities.map(item => {
                          const isSelected = selectedCities.some(c => c.toLowerCase() === item.toLowerCase());

                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedCities(prev => prev.filter(c => c.toLowerCase() !== item.toLowerCase()));
                                } else {
                                  setSelectedCities(prev => [...prev, item]);
                                }
                                setCitySearch("");
                                cityInputRef.current?.focus();
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition text-left ${
                                isSelected
                                  ? "bg-[#C5453E]/15 text-[#C5453E] font-semibold"
                                  : "text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                                  isSelected ? "bg-[#C5453E] border-[#C5453E] text-white" : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#C5453E]" : "text-[var(--text-dim)]"}`} />
                                <span>{item}</span>
                              </div>
                              <span className="text-[10px] text-[var(--text-dim)] uppercase font-mono">
                                {isSelected ? "Selected" : "Add"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Volume */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#C5453E]" />
                  Leads to Harvest
                </label>
                <select
                  value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 min-h-[46px] bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:border-[#C5453E]"
                >
                  <option value={3}>3 Leads (Fast Test)</option>
                  <option value={5}>5 Leads (Standard)</option>
                  <option value={10}>10 Leads (Batch)</option>
                </select>
                <p className="text-[11px] text-[var(--text-dim)] mt-2">
                  {selectedSources.length === availableSources.length 
                    ? "Concurrently queries Google Maps, LinkedIn Decision-Makers, Hiring Intent, and OpenStreetMap."
                    : `Concurrently queries ${selectedSources.length} selected lead discovery channel${selectedSources.length > 1 ? "s" : ""}.`}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                {loading && (
                  <div className="flex items-center gap-2 text-[#C5453E] font-medium animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>{stepText}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm shadow-xl shadow-[#C5453E]/20 disabled:opacity-50"
              >
                {loading ? "Harvesting and Auditing..." : `Start Harvesting (${selectedSources.length === availableSources.length ? "All 5 Channels" : `${selectedSources.length} Selected Channel${selectedSources.length > 1 ? "s" : ""}`})`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Live Scraped Results Table */}
        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center flex-wrap gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>Harvested Data ({results.length} Leads)</span>
                  {dedupStats && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-mono">
                      +{dedupStats.newLeadsSaved} New Saved
                    </span>
                  )}
                  {dedupStats && dedupStats.duplicatesSkipped > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-mono">
                      {dedupStats.duplicatesSkipped} Existing Kept Clean
                    </span>
                  )}
                </h2>

                {/* Source Breakdown Indicators */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
                  <span className="text-[var(--text-muted)]">Extracted from:</span>
                  {results.some(r => r.sourceTechnique === "SEC_EDGAR_FUNDED" || r.discoverySources?.includes("SEC_EDGAR_FUNDED")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold font-mono text-[11px]">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span>{results.filter(r => r.sourceTechnique === "SEC_EDGAR_FUNDED" || r.discoverySources?.includes("SEC_EDGAR_FUNDED")).length} SEC Funded</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "UK_COMPANIES_HOUSE" || r.discoverySources?.includes("UK_COMPANIES_HOUSE")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold font-mono text-[11px]">
                      <Landmark className="w-3 h-3 text-purple-500" />
                      <span>{results.filter(r => r.sourceTechnique === "UK_COMPANIES_HOUSE" || r.discoverySources?.includes("UK_COMPANIES_HOUSE")).length} UK Companies</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "NEW_BUSINESS_REGISTRATIONS" || r.discoverySources?.includes("NEW_BUSINESS_REGISTRATIONS")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold font-mono text-[11px]">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{results.filter(r => r.sourceTechnique === "NEW_BUSINESS_REGISTRATIONS" || r.discoverySources?.includes("NEW_BUSINESS_REGISTRATIONS")).length} New Filings</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "LOW_RATING_REPUTATION" || r.discoverySources?.includes("LOW_RATING_REPUTATION")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600/10 text-rose-600 dark:text-rose-400 border border-rose-600/20 font-semibold font-mono text-[11px]">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>{results.filter(r => r.sourceTechnique === "LOW_RATING_REPUTATION" || r.discoverySources?.includes("LOW_RATING_REPUTATION")).length} Trustpilot Targets</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "SHOPIFY_ECOMMERCE" || r.discoverySources?.includes("SHOPIFY_ECOMMERCE")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold font-mono text-[11px]">
                      <ShoppingBag className="w-3 h-3 text-emerald-500" />
                      <span>{results.filter(r => r.sourceTechnique === "SHOPIFY_ECOMMERCE" || r.discoverySources?.includes("SHOPIFY_ECOMMERCE")).length} Shopify DTC</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "HIGH_TICKET_CONTRACTORS" || r.discoverySources?.includes("HIGH_TICKET_CONTRACTORS")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold font-mono text-[11px]">
                      <Hammer className="w-3 h-3 text-amber-500" />
                      <span>{results.filter(r => r.sourceTechnique === "HIGH_TICKET_CONTRACTORS" || r.discoverySources?.includes("HIGH_TICKET_CONTRACTORS")).length} Houzz &amp; Thumbtack</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "AD_SPENDERS" || r.discoverySources?.includes("AD_SPENDERS")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold font-mono text-[11px]">
                      <Megaphone className="w-3 h-3 text-rose-500" />
                      <span>{results.filter(r => r.sourceTechnique === "AD_SPENDERS" || r.discoverySources?.includes("AD_SPENDERS")).length} Paid Ad Spenders</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "LINKEDIN_XRAY" || r.discoverySources?.includes("LINKEDIN_XRAY")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold font-mono text-[11px]">
                      <Users className="w-3 h-3 text-sky-500" />
                      <span>{results.filter(r => r.sourceTechnique === "LINKEDIN_XRAY" || r.discoverySources?.includes("LINKEDIN_XRAY")).length} LinkedIn X-Ray</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "HIRING_SIGNALS" || r.discoverySources?.includes("HIRING_SIGNALS")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold font-mono text-[11px]">
                      <Briefcase className="w-3 h-3 text-amber-500" />
                      <span>{results.filter(r => r.sourceTechnique === "HIRING_SIGNALS" || r.discoverySources?.includes("HIRING_SIGNALS")).length} Hiring Intent</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "YELLOW_PAGES" || r.discoverySources?.includes("YELLOW_PAGES")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-semibold font-mono text-[11px]">
                      <BookOpen className="w-3 h-3 text-orange-500" />
                      <span>{results.filter(r => r.sourceTechnique === "YELLOW_PAGES" || r.discoverySources?.includes("YELLOW_PAGES")).length} YellowPages</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "META_WHATSAPP" || r.discoverySources?.includes("META_WHATSAPP")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold font-mono text-[11px]">
                      <MessageCircle className="w-3 h-3 text-emerald-500" />
                      <span>{results.filter(r => r.sourceTechnique === "META_WHATSAPP" || r.discoverySources?.includes("META_WHATSAPP")).length} WhatsApp &amp; IG</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "CLUTCH_B2B" || r.discoverySources?.includes("CLUTCH_B2B")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold font-mono text-[11px]">
                      <Award className="w-3 h-3 text-indigo-500" />
                      <span>{results.filter(r => r.sourceTechnique === "CLUTCH_B2B" || r.discoverySources?.includes("CLUTCH_B2B")).length} Clutch B2B</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "BBB_TRUST" || r.discoverySources?.includes("BBB_TRUST")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-semibold font-mono text-[11px]">
                      <ShieldCheck className="w-3 h-3 text-teal-500" />
                      <span>{results.filter(r => r.sourceTechnique === "BBB_TRUST" || r.discoverySources?.includes("BBB_TRUST")).length} BBB Trust</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "GOOGLE_MAPS" || r.discoverySources?.includes("GOOGLE_MAPS")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold font-mono text-[11px]">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      <span>{results.filter(r => r.sourceTechnique === "GOOGLE_MAPS" || r.discoverySources?.includes("GOOGLE_MAPS")).length} Google Maps</span>
                    </span>
                  )}
                  {results.some(r => r.sourceTechnique === "OPEN_STREET_MAP" || r.discoverySources?.includes("OPEN_STREET_MAP")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold font-mono text-[11px]">
                      <Globe className="w-3 h-3 text-emerald-500" />
                      <span>{results.filter(r => r.sourceTechnique === "OPEN_STREET_MAP" || r.discoverySources?.includes("OPEN_STREET_MAP")).length} OpenStreetMap</span>
                    </span>
                  )}
                </div>
              </div>

              <Link
                href="/leads"
                className="px-4 py-2 btn-primary flex items-center justify-center gap-2 text-xs shadow-lg shadow-[#C5453E]/20 self-start sm:self-auto"
              >
                Go to Pure Leads
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="card-glass overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm divide-y divide-[var(--border-subtle)]">
                  <thead className="bg-[var(--table-header)] text-[var(--text-muted)] text-xs uppercase font-semibold border-b border-[var(--border-subtle)]">
                    <tr>
                      <th className="px-4 py-3.5 min-w-[200px]">Business &amp; Decision Maker</th>
                      <th className="px-4 py-3.5 min-w-[160px] whitespace-nowrap">Category</th>
                      <th className="px-4 py-3.5 min-w-[170px] whitespace-nowrap">Source &amp; Profile Link</th>
                      <th className="px-4 py-3.5 min-w-[150px] whitespace-nowrap">Website</th>
                      <th className="px-4 py-3.5 min-w-[200px]">Contact Details</th>
                      <th className="px-4 py-3.5 min-w-[130px] whitespace-nowrap">Location</th>
                      <th className="px-4 py-3.5 min-w-[110px] whitespace-nowrap">Health Score</th>
                      <th className="px-4 py-3.5 min-w-[120px] text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-muted)]">
                    {results.map((lead, idx) => {
                      const isSecEdgar = lead.sourceTechnique === "SEC_EDGAR_FUNDED" || (lead.discoverySources && lead.discoverySources.includes("SEC_EDGAR_FUNDED"));
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
                        <tr key={lead.id || idx} className="hover:bg-[var(--bg-card-hover)] transition">
                          {/* Business Name & Decision Maker */}
                          <td className="px-4 py-4">
                            <div className="font-semibold text-[var(--text-main)] max-w-[220px] truncate">{lead.businessName}</div>
                            {lead.ownerName && lead.ownerName !== "Business Principal / Owner" && lead.ownerName !== "Principal Officer / General Manager" ? (
                              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-[11px] font-bold">
                                <Users className="w-3 h-3 text-sky-500" />
                                <span>{lead.ownerName}</span>
                                {lead.executiveRole && <span className="text-[10px] text-[var(--text-dim)] font-normal">({lead.executiveRole})</span>}
                              </div>
                            ) : lead.bbbRating ? (
                              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20 text-[11px] font-bold">
                                <ShieldCheck className="w-3 h-3 text-teal-500" />
                                <span>{lead.bbbRating}</span>
                              </div>
                            ) : lead.hourlyRate ? (
                              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-[11px] font-bold">
                                <Award className="w-3 h-3 text-indigo-500" />
                                <span>{lead.hourlyRate}</span>
                              </div>
                            ) : lead.socialHandle ? (
                              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                                <MessageCircle className="w-3 h-3 text-emerald-500" />
                                <span>{lead.socialHandle}</span>
                              </div>
                            ) : lead.yearsInBusiness ? (
                              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20 text-[11px] font-bold">
                                <BookOpen className="w-3 h-3 text-orange-500" />
                                <span>{lead.yearsInBusiness}</span>
                              </div>
                            ) : lead.rating ? (
                              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                                <span>★ {lead.rating}</span>
                                <span className="text-[10px] text-[var(--text-dim)] font-normal">({lead.reviewCount || 45} reviews)</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[var(--text-dim)] mt-0.5 block">Verified B2B Listing</span>
                            )}
                          </td>

                          {/* Category / Niche (Spacious, Single-line) */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] whitespace-nowrap shadow-xs">
                              <Building2 className="w-3.5 h-3.5 text-[#C5453E]/80 shrink-0" />
                              <span>{lead.category || "General B2B"}</span>
                            </span>
                          </td>

                          {/* Source & Profile Link */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            {isSecEdgar ? (
                              <a
                                href={getVerifiedChannelUrl("SEC_EDGAR_FUNDED", lead)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition whitespace-nowrap shadow-xs"
                                title="Open Official SEC EDGAR Form D Venture Filing"
                              >
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>{lead.capitalRaised ? `SEC: ${lead.capitalRaised}` : "SEC Form D"}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                              </a>
                            ) : isUkCompanies ? (
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

                          {/* Website Column */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            {lead.websiteUrl ? (
                              <a
                                href={lead.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-[var(--text-main)] hover:text-[#C5453E] font-medium transition max-w-[160px] truncate"
                              >
                                <Globe className="w-3.5 h-3.5 text-[#C5453E]/80 shrink-0" />
                                <span className="truncate">{lead.websiteUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                                No Website
                              </span>
                            )}
                          </td>

                          {/* Contacts */}
                          <td className="px-4 py-4 text-xs min-w-[200px]">
                            {lead.contactEmail ? (
                              <div className="text-[var(--text-main)] flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                                <span className="truncate max-w-[160px]">{lead.contactEmail}</span>
                              </div>
                            ) : null}
                            {lead.phoneNumber ? (
                              <div className="text-[var(--text-muted)] text-[11px] flex items-center gap-1.5 mt-1 font-mono">
                                <Phone className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                                <span>{lead.phoneNumber}</span>
                              </div>
                            ) : null}
                          </td>

                          {/* City */}
                          <td className="px-4 py-4 text-xs whitespace-nowrap text-[var(--text-muted)] font-medium">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                              <span>{lead.city}</span>
                            </span>
                          </td>

                          {/* Health Score */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              lead.speedScore < 50
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                                : lead.speedScore < 70
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            }`}>
                              {lead.speedScore}/100
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <Link
                              href="/leads"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] transition"
                            >
                              Manage in CRM
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
