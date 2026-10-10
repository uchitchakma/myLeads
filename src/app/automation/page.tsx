"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Bot, 
  Plus, 
  Play, 
  Trash2, 
  Clock, 
  Layers, 
  MapPin, 
  Building2, 
  Send, 
  CheckCircle2, 
  X, 
  Edit, 
  Folder, 
  AlertCircle,
  Zap,
  Globe,
  Info
} from "lucide-react";
import Link from "next/link";

export default function AutomationPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const defaultNiches = [
    "Dental Clinic",
    "Roofing Contractor",
    "Plumbing Services",
    "Real Estate Agency",
    "HVAC Repair",
    "Law Firm / Attorney"
  ];

  const [formData, setFormData] = useState({
    name: "",
    niches: ["Dental Clinic", "Roofing Contractor"],
    cities: ["Miami, FL", "Dallas, TX"],
    sourceTechnique: "ALL_SOURCES",
    frequency: "DAILY",
    leadsPerRun: 10,
    campaignName: "Autopilot Outreach",
    autoOutreach: false
  });

  const showNotification = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/automations");
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/automations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates: { isActive: !currentStatus } })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t));
      showNotification(`Autopilot task ${!currentStatus ? "activated" : "paused"}.`, "info");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete automation task "${name}"?`)) return;
    try {
      const res = await fetch(`/api/automations?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks(prev => prev.filter(t => t.id !== id));
      showNotification(`Deleted task "${name}"`, "info");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleRunNow = async (id: string) => {
    setRunningTaskId(id);
    try {
      const res = await fetch("/api/automations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to execute autopilot");

      showNotification(data.message, "success");
      fetchTasks();
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setRunningTaskId(null);
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        niches: formData.niches,
        cities: formData.cities,
        sourceTechnique: formData.sourceTechnique,
        frequency: formData.frequency,
        leadsPerRun: Number(formData.leadsPerRun),
        campaignName: formData.campaignName,
        autoOutreach: formData.autoOutreach
      };

      let res;
      if (editingTask) {
        res = await fetch("/api/automations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingTask.id, updates: payload })
        });
      } else {
        res = await fetch("/api/automations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save task");
      }

      setIsModalOpen(false);
      setEditingTask(null);
      showNotification(`Autopilot task ${editingTask ? "updated" : "created"} successfully.`, "success");
      fetchTasks();
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      name: "Daily Multi-Niche Client Scout",
      niches: ["Dental Clinic", "Roofing Contractor"],
      cities: ["Miami, FL", "Austin, TX"],
      sourceTechnique: "ALL_SOURCES",
      frequency: "DAILY",
      leadsPerRun: 10,
      campaignName: "Autopilot Leads",
      autoOutreach: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      niches: task.niches || ["Dental Clinic"],
      cities: task.cities || ["Miami, FL"],
      sourceTechnique: task.sourceTechnique || "ALL_SOURCES",
      frequency: task.frequency || "DAILY",
      leadsPerRun: task.leadsPerRun || 10,
      campaignName: task.campaignName || "",
      autoOutreach: Boolean(task.autoOutreach)
    });
    setIsModalOpen(true);
  };

  const totalAutoHarvested = tasks.reduce((sum, t) => sum + (t.totalLeadsHarvested || 0), 0);
  const activeCount = tasks.filter(t => t.isActive).length;

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] transition-colors">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 pt-20 px-4 pb-12 md:pt-8 md:px-8 md:ml-64 max-w-6xl">
        {/* Floating Toast Notification */}
        {notification && (
          <div className="fixed top-6 right-4 sm:right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300 max-w-[calc(100vw-2rem)]"
            style={{
              backgroundColor: notification.type === "error" ? "#EF4444" : notification.type === "info" ? "#3B82F6" : "#10B981",
              color: "#FFFFFF",
              borderColor: "rgba(255,255,255,0.2)"
            }}
          >
            {notification.type === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span className="truncate">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
                Autopilot &amp; Lead Automations
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 font-mono">
                Hands-Free
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Set automated recurring searches across multiple professions and cities on daily, weekly, or monthly schedules.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/leads"
              className="px-4 py-2 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-xs font-semibold text-[var(--text-main)] shadow-xs transition"
            >
              View Pipeline
            </Link>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 btn-primary flex items-center gap-2 text-xs font-semibold shadow-lg shadow-[#C5453E]/20"
            >
              <Plus className="w-4 h-4" />
              New Autopilot Task
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card-glass p-5 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Active Tasks</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--text-main)] mt-2">
              {activeCount} <span className="text-xs font-normal text-[var(--text-dim)]">/ {tasks.length} total</span>
            </div>
          </div>

          <div className="card-glass p-5 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Auto-Harvested</span>
              <div className="w-8 h-8 rounded-lg bg-[#C5453E]/10 text-[#C5453E] flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--text-main)] mt-2">
              {totalAutoHarvested} <span className="text-xs font-normal text-[var(--text-dim)]">prospects saved</span>
            </div>
          </div>

          <div className="card-glass p-5 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Automated Outreach</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--text-main)] mt-2">
              {tasks.filter(t => t.autoOutreach && t.isActive).length} <span className="text-xs font-normal text-[var(--text-dim)]">auto-dispatching</span>
            </div>
          </div>
        </div>

        {/* Automation Tasks List */}
        {tasks.length === 0 ? (
          <div className="card-glass p-12 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C5453E]/10 text-[#C5453E] flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-main)]">No Autopilot Tasks Configured Yet</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Create your first automated task to periodically search Google Maps &amp; OpenStreetMap for dentists, roofers, or plumbers on a set schedule.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 btn-primary text-xs font-semibold inline-flex items-center gap-2 shadow-md shadow-[#C5453E]/20 mt-2"
            >
              <Plus className="w-4 h-4" /> Create First Autopilot Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => {
              const isRunning = runningTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className="card-glass p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl transition hover:border-[#C5453E]/40 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${task.isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                      <div>
                        <div className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                          <span>{task.name}</span>
                          <span className="px-2 py-0.5 rounded-md bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-subtle)] text-[10px] font-mono font-semibold uppercase">
                            {task.frequency}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-muted)] flex items-center gap-3 mt-0.5">
                          <span>Next run: {new Date(task.nextRunAt).toLocaleDateString()}</span>
                          {task.lastRunAt && (
                            <span>• Last executed: {new Date(task.lastRunAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRunNow(task.id)}
                        disabled={isRunning}
                        title="Run this harvest immediately"
                        className="px-3.5 py-1.5 bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Play className={`w-3.5 h-3.5 text-[#C5453E] ${isRunning ? "animate-spin" : ""}`} />
                        <span>{isRunning ? "Running..." : "Run Now"}</span>
                      </button>

                      <button
                        onClick={() => handleToggleActive(task.id, task.isActive)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          task.isActive 
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20" 
                            : "bg-gray-500/10 text-gray-500 border border-gray-500/20 hover:bg-gray-500/20"
                        }`}
                      >
                        {task.isActive ? "Active" : "Paused"}
                      </button>

                      <button
                        onClick={() => openEditModal(task)}
                        className="p-2 text-[var(--text-muted)] hover:text-blue-500 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(task.id, task.name)}
                        className="p-2 text-[var(--text-muted)] hover:text-red-500 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Task Configuration Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    {/* Target Niches */}
                    <div>
                      <span className="font-semibold text-[var(--text-muted)] uppercase text-[10px] block mb-1">
                        Professions / Niches ({task.niches?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(task.niches || []).map((n: string) => (
                          <span key={n} className="px-2 py-0.5 rounded-md bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-main)]">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Target Cities */}
                    <div>
                      <span className="font-semibold text-[var(--text-muted)] uppercase text-[10px] block mb-1">
                        Target Cities ({task.cities?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(task.cities || []).map((c: string) => (
                          <span key={c} className="px-2 py-0.5 rounded-md bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-main)]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Source & Volume */}
                    <div>
                      <span className="font-semibold text-[var(--text-muted)] uppercase text-[10px] block mb-1">
                        Source &amp; Volume
                      </span>
                      <div className="text-[var(--text-main)] font-medium">
                        {task.sourceTechnique === "ALL_SOURCES" ? "All Sources" : task.sourceTechnique}
                      </div>
                      <div className="text-[var(--text-muted)] text-[11px]">
                        {task.leadsPerRun} leads per scheduled cycle
                      </div>
                    </div>

                    {/* Campaign & Outreach */}
                    <div>
                      <span className="font-semibold text-[var(--text-muted)] uppercase text-[10px] block mb-1">
                        Campaign &amp; Outreach
                      </span>
                      {task.campaignName && (
                        <div className="text-[11px] text-[#C5453E] font-semibold flex items-center gap-1">
                          <Folder className="w-3 h-3" /> {task.campaignName}
                        </div>
                      )}
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {task.autoOutreach ? "Auto-Email Dispatch Active" : "Save to CRM Only"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Autopilot Task Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="card-glass w-full max-w-xl p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4 shadow-2xl rounded-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Bot className="w-5 h-5 text-[#C5453E]" />
                    {editingTask ? "Edit Autopilot Task" : "Create Autopilot Harvester"}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Schedule automated searches across multiple professions.
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4">
                {/* Task Name */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">
                    Task Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Florida Dentists & Roofers Daily Hunter"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-[#C5453E]"
                  />
                </div>

                {/* Multi-Niches Input & Quick Select */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 flex items-center justify-between">
                    <span>Target Professions / Niches</span>
                    <div className="relative group flex items-center cursor-help" title="Select multiple or separate with commas">
                      <Info className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-colors" />
                      <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex flex-col items-end z-50 pointer-events-none">
                        <span className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-normal py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap border border-slate-700/50">
                          Select multiple or separate with commas
                        </span>
                        <span className="w-2 h-2 -mt-1 mr-1.5 rotate-45 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700/50" />
                      </div>
                    </div>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.niches.join(", ")}
                    onChange={e => setFormData({
                      ...formData,
                      niches: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="Dental Clinic, Roofing Contractor, Plumbing Services"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-[#C5453E]"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {defaultNiches.map(item => {
                      const isSelected = formData.niches.some(n => n.toLowerCase() === item.toLowerCase());
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormData({ ...formData, niches: formData.niches.filter(n => n.toLowerCase() !== item.toLowerCase()) });
                            } else {
                              setFormData({ ...formData, niches: [...formData.niches, item] });
                            }
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                            isSelected 
                              ? "bg-[#C5453E] text-white border-[#C5453E] font-semibold" 
                              : "bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-subtle)]"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}{item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cities Input */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1 flex items-center justify-between">
                    <span>Target Cities</span>
                    <div className="relative group flex items-center cursor-help" title="Enter multiple cities separated by commas">
                      <Info className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-colors" />
                      <div className="absolute right-0 bottom-full mb-2 hidden group-hover:flex flex-col items-end z-50 pointer-events-none">
                        <span className="bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-normal py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap border border-slate-700/50">
                          Separate multiple cities with commas
                        </span>
                        <span className="w-2 h-2 -mt-1 mr-1.5 rotate-45 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700/50" />
                      </div>
                    </div>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cities.join(", ")}
                    onChange={e => setFormData({
                      ...formData,
                      cities: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="Miami, FL, Dallas, TX, Austin, TX"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-[#C5453E]"
                  />
                </div>

                {/* Frequency & Source Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">
                      Execution Schedule
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-[#C5453E]"
                    >
                      <option value="DAILY">Daily (Every 24 Hours)</option>
                      <option value="WEEKLY">Weekly (Every 7 Days)</option>
                      <option value="MONTHLY">Monthly (Every 30 Days)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">
                      Data Source Engine
                    </label>
                    <select
                      value={formData.sourceTechnique}
                      onChange={e => setFormData({ ...formData, sourceTechnique: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-[#C5453E]"
                    >
                      <option value="ALL_SOURCES">All Sources (Combined)</option>
                      <option value="GOOGLE_MAPS">Google Maps Only</option>
                      <option value="OPEN_STREET_MAP">OpenStreetMap Only</option>
                    </select>
                  </div>
                </div>

                {/* Campaign Name & Volume */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">
                      Auto-Assign to Campaign
                    </label>
                    <input
                      type="text"
                      value={formData.campaignName}
                      onChange={e => setFormData({ ...formData, campaignName: e.target.value })}
                      placeholder="e.g. Daily Scout"
                      className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-[#C5453E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">
                      Leads Per Cycle
                    </label>
                    <select
                      value={formData.leadsPerRun}
                      onChange={e => setFormData({ ...formData, leadsPerRun: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-[#C5453E]"
                    >
                      <option value={5}>5 Leads</option>
                      <option value={10}>10 Leads (Recommended)</option>
                      <option value={20}>20 Leads (High Volume)</option>
                    </select>
                  </div>
                </div>

                {/* Auto Outreach Checkbox */}
                <div className="p-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[var(--text-main)]">Auto-Dispatch Cold Email Outreach</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Automatically emails customized AI speed pitch to newly discovered leads.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoOutreach}
                    onChange={e => setFormData({ ...formData, autoOutreach: e.target.checked })}
                    className="w-4 h-4 accent-[#C5453E] cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[var(--bg-main)] text-[var(--text-main)] rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 btn-primary text-xs font-bold shadow-md shadow-[#C5453E]/20"
                  >
                    {editingTask ? "Update Task" : "Activate Autopilot"}
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
