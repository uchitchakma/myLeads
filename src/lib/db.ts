import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export type Role = "ADMIN" | "USER";
export type LeadStatus = "DISCOVERED" | "AUDITED" | "CONTACTED" | "REPLIED" | "CLOSED";

export interface UserSmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  senderName: string;
  senderEmail: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  googleMapsApiKey?: string;
  yelpApiKey?: string;
  geminiApiKey?: string;
  smtpConfig?: UserSmtpConfig;
  createdAt: string;
}

export interface Lead {
  id: string;
  userId: string;
  userEmail?: string;
  businessName: string;
  websiteUrl: string;
  normalizedDomain: string;
  googleMapsUrl?: string;
  sourceUrl?: string;
  campaign?: string;
  tags?: string[];
  phoneNumber: string;
  alternatePhones?: string[];
  contactEmail: string;
  alternateEmails?: string[];
  ownerName: string;
  category: string;
  city: string;
  sourceTechnique: string;
  discoverySources?: string[];
  status: LeadStatus;
  rating?: number;
  reviewCount?: number;
  address?: string;
  speedScore: number;
  mobileFriendly: boolean;
  loadTime: string;
  detectedIssues: string[];
  aiPitch?: {
    subjects: string[];
    body: string;
    whatsapp: string;
  };
  emailHistory?: Array<{
    sentAt: string;
    subject: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapeJob {
  id: string;
  userId: string;
  technique: string;
  queryNiche: string;
  location: string;
  leadsFound: number;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export interface AutomationTask {
  id: string;
  userId: string;
  name: string;
  niches: string[];
  cities: string[];
  sourceTechnique: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  leadsPerRun: number;
  campaignName?: string;
  autoOutreach: boolean;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  totalLeadsHarvested: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  userId: string;
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
  updatedAt: string;
}

interface DatabaseSchema {
  users: User[];
  leads: Lead[];
  scrapeJobs: ScrapeJob[];
  automations?: AutomationTask[];
  campaigns?: Campaign[];
}

const DB_FILE = fs.existsSync(path.join(process.cwd(), "myleads_database.json"))
  ? path.join(process.cwd(), "myleads_database.json")
  : fs.existsSync(path.join(process.cwd(), "leadflow_database.json"))
  ? path.join(process.cwd(), "leadflow_database.json")
  : path.join(process.cwd(), "myleads_database.json");

export function normalizeDomain(url: string): string {
  try {
    let clean = url.trim().toLowerCase();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

function readDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const initialDb: DatabaseSchema = {
      users: [
        {
          id: "usr_admin_master",
          name: "Super Admin",
          email: "uchitchakmas@gmail.com",
          passwordHash: bcrypt.hashSync("Uchir@123", salt),
          role: "ADMIN",
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ],
      leads: [],
      scrapeJobs: [],
      automations: [],
      campaigns: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data: DatabaseSchema = JSON.parse(raw);
    if (!data.campaigns) {
      data.campaigns = [];
    }
    return data;
  } catch (e) {
    console.error("DB Read Error", e);
    return { users: [], leads: [], scrapeJobs: [], campaigns: [] };
  }
}

function writeDb(db: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// User Helpers
export function getAllUsers(): User[] {
  const db = readDb();
  return db.users.map(u => ({ ...u, passwordHash: "REDACTED" }));
}

export function findUserByEmail(email: string): User | undefined {
  const db = readDb();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  const db = readDb();
  return db.users.find(u => u.id === id);
}

export function createUser(name: string, email: string, password: string, role: Role = "USER"): User {
  const db = readDb();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("A user with this email already exists.");
  }
  const salt = bcrypt.genSaltSync(10);
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    email,
    passwordHash: bcrypt.hashSync(password, salt),
    role,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  writeDb(db);
  return { ...newUser, passwordHash: "REDACTED" };
}

export function updateUser(id: string, updates: Partial<User>): User {
  const db = readDb();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) throw new Error("User not found.");
  db.users[index] = { ...db.users[index], ...updates };
  writeDb(db);
  return { ...db.users[index], passwordHash: "REDACTED" };
}

export function deleteUser(id: string): boolean {
  const db = readDb();
  const user = db.users.find(u => u.id === id);
  if (user?.role === "ADMIN" && db.users.filter(u => u.role === "ADMIN").length <= 1) {
    throw new Error("Cannot delete the only admin user.");
  }
  db.users = db.users.filter(u => u.id !== id);
  writeDb(db);
  return true;
}

// Lead Helpers (RBAC & Non-Destructive Multi-Technique Deduplication Enforced)
export function getLeads(requesterId: string, isAdmin: boolean): Lead[] {
  const db = readDb();
  if (isAdmin) {
    return db.leads.map(lead => {
      const creator = db.users.find(u => u.id === lead.userId);
      return { ...lead, userEmail: creator?.email || "Unknown User" };
    });
  }
  return db.leads.filter(lead => lead.userId === requesterId);
}

export interface CreateLeadResult {
  lead: Lead;
  isDuplicate: boolean;
}

export function createOrUpdateLead(leadData: Omit<Lead, "id" | "normalizedDomain" | "createdAt" | "updatedAt">): CreateLeadResult {
  const db = readDb();
  const normalized = normalizeDomain(leadData.websiteUrl);

  const existingIndex = db.leads.findIndex(l => 
    l.normalizedDomain === normalized || 
    (leadData.phoneNumber && l.phoneNumber === leadData.phoneNumber)
  );

  if (existingIndex !== -1) {
    const existing = db.leads[existingIndex];

    const phoneList = new Set<string>([existing.phoneNumber, ...(existing.alternatePhones || [])]);
    if (leadData.phoneNumber && leadData.phoneNumber !== existing.phoneNumber) {
      phoneList.add(leadData.phoneNumber);
    }
    const mergedPhones = Array.from(phoneList).filter(Boolean);

    const emailList = new Set<string>([existing.contactEmail, ...(existing.alternateEmails || [])]);
    if (leadData.contactEmail && leadData.contactEmail !== existing.contactEmail) {
      emailList.add(leadData.contactEmail);
    }
    const mergedEmails = Array.from(emailList).filter(Boolean);

    const sources = new Set<string>([
      existing.sourceTechnique, 
      ...(existing.discoverySources || []), 
      leadData.sourceTechnique,
      ...(leadData.discoverySources || [])
    ]);
    const mergedSources = Array.from(sources).filter(Boolean);
    const finalSourceTechnique = (mergedSources.includes("GOOGLE_MAPS") && mergedSources.includes("OPEN_STREET_MAP")) 
      ? "ALL_SOURCES" 
      : leadData.sourceTechnique || existing.sourceTechnique;

    db.leads[existingIndex] = {
      ...existing,
      googleMapsUrl: leadData.googleMapsUrl || existing.googleMapsUrl,
      sourceUrl: leadData.sourceUrl || existing.sourceUrl,
      sourceTechnique: finalSourceTechnique,
      campaign: leadData.campaign || existing.campaign,
      rating: leadData.rating || existing.rating,
      reviewCount: leadData.reviewCount || existing.reviewCount,
      address: leadData.address || existing.address,
      ownerName: (leadData.ownerName && leadData.ownerName !== "Business Owner") ? leadData.ownerName : existing.ownerName,
      alternatePhones: mergedPhones.filter(p => p !== existing.phoneNumber),
      alternateEmails: mergedEmails.filter(e => e !== existing.contactEmail),
      discoverySources: mergedSources,
      speedScore: leadData.speedScore || existing.speedScore,
      loadTime: leadData.loadTime || existing.loadTime,
      detectedIssues: leadData.detectedIssues?.length ? leadData.detectedIssues : existing.detectedIssues,
      aiPitch: leadData.aiPitch || existing.aiPitch,
      updatedAt: new Date().toISOString()
    };

    writeDb(db);
    return { lead: db.leads[existingIndex], isDuplicate: true };
  }

  const newLead: Lead = {
    ...leadData,
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    normalizedDomain: normalized,
    alternatePhones: [],
    alternateEmails: [],
    discoverySources: leadData.discoverySources || [leadData.sourceTechnique],
    emailHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.leads.unshift(newLead);
  writeDb(db);
  return { lead: newLead, isDuplicate: false };
}

export function createLead(leadData: Omit<Lead, "id" | "normalizedDomain" | "createdAt" | "updatedAt">): Lead {
  const result = createOrUpdateLead(leadData);
  return result.lead;
}

export function updateLead(leadId: string, updates: Partial<Lead>, requesterId: string, isAdmin: boolean): Lead {
  const db = readDb();
  const index = db.leads.findIndex(l => l.id === leadId);
  if (index === -1) throw new Error("Lead not found.");
  
  if (!isAdmin && db.leads[index].userId !== requesterId) {
    throw new Error("Unauthorized: You can only edit your own leads.");
  }

  db.leads[index] = {
    ...db.leads[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  return db.leads[index];
}

// Campaign & Grouping Helpers
export function getCampaigns(requesterId: string, isAdmin: boolean): Campaign[] {
  const db = readDb();
  if (!db.campaigns) db.campaigns = [];

  const targetLeads = isAdmin ? db.leads : db.leads.filter(l => l.userId === requesterId);

  // Auto-sync any legacy campaign names on leads to campaign objects
  const existingNames = new Set(db.campaigns.map(c => c.name.toLowerCase()));
  let dbUpdated = false;

  for (const lead of targetLeads) {
    if (lead.campaign && lead.campaign.trim() && !existingNames.has(lead.campaign.trim().toLowerCase())) {
      const newCamp: Campaign = {
        id: "camp_" + Math.random().toString(36).substring(2, 9),
        userId: lead.userId || requesterId,
        name: lead.campaign.trim(),
        description: `Campaign for ${lead.category || "B2B"} leads in ${lead.city || "various locations"}`,
        targetNiche: lead.category,
        targetCity: lead.city,
        status: "ACTIVE",
        pitchGoal: "SALES",
        leadIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.campaigns.push(newCamp);
      existingNames.add(newCamp.name.toLowerCase());
      dbUpdated = true;
    }
  }

  // Filter campaigns for user
  const userCampaigns = isAdmin ? db.campaigns : db.campaigns.filter(c => c.userId === requesterId);

  // Sync leadIds & compute stats for each campaign
  for (const camp of userCampaigns) {
    const leadsInCampaign = targetLeads.filter(l => l.campaign?.toLowerCase() === camp.name.toLowerCase() || (camp.leadIds && camp.leadIds.includes(l.id)));
    camp.leadIds = leadsInCampaign.map(l => l.id);
    
    const sentCount = leadsInCampaign.filter(l => l.status === "CONTACTED" || (l.emailHistory && l.emailHistory.length > 0)).length;
    const repliedCount = leadsInCampaign.filter(l => l.status === "REPLIED" || l.status === "CLOSED").length;
    
    camp.stats = {
      totalLeads: leadsInCampaign.length,
      emailsSent: sentCount,
      delivered: sentCount,
      replied: repliedCount,
      bounced: 0,
      lastSentAt: camp.stats?.lastSentAt
    };
  }

  if (dbUpdated) {
    writeDb(db);
  }

  return userCampaigns;
}

export function getCampaignById(campaignIdOrName: string, requesterId: string, isAdmin: boolean): { campaign: Campaign; leads: Lead[] } | null {
  const campaigns = getCampaigns(requesterId, isAdmin);
  const campaign = campaigns.find(c => c.id === campaignIdOrName || c.name.toLowerCase() === campaignIdOrName.toLowerCase());
  if (!campaign) return null;

  const db = readDb();
  const allLeads = isAdmin ? db.leads : db.leads.filter(l => l.userId === requesterId);
  const leads = allLeads.filter(l => (campaign.leadIds && campaign.leadIds.includes(l.id)) || l.campaign?.toLowerCase() === campaign.name.toLowerCase());

  return { campaign, leads };
}

export function createCampaign(data: {
  userId: string;
  name: string;
  description?: string;
  targetNiche?: string;
  targetCity?: string;
  status?: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
  pitchGoal?: "SALES" | "REAL_ESTATE" | "MARKETING" | "WEB";
  emailSubject?: string;
  emailBody?: string;
  leadIds?: string[];
}): Campaign {
  const db = readDb();
  if (!db.campaigns) db.campaigns = [];

  const existing = db.campaigns.find(c => c.name.toLowerCase() === data.name.trim().toLowerCase() && c.userId === data.userId);
  if (existing) {
    throw new Error(`A campaign named "${data.name}" already exists.`);
  }

  const newCampaign: Campaign = {
    id: "camp_" + Math.random().toString(36).substring(2, 9),
    userId: data.userId,
    name: data.name.trim(),
    description: data.description || "",
    targetNiche: data.targetNiche || "All Niches",
    targetCity: data.targetCity || "All Cities",
    status: data.status || "DRAFT",
    pitchGoal: data.pitchGoal || "SALES",
    emailSubject: data.emailSubject || "Quick question regarding {{businessName}}",
    emailBody: data.emailBody || "Hi {{ownerName}},\n\nI noticed {{businessName}} in {{city}} and wanted to reach out regarding our B2B growth solutions...\n\nBest regards,\nUchit Chakma\nFounder & Technical Director | UCDREAMS\nhttps://ucdreams.com",
    leadIds: data.leadIds || [],
    stats: {
      totalLeads: (data.leadIds || []).length,
      emailsSent: 0,
      delivered: 0,
      replied: 0,
      bounced: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.campaigns.unshift(newCampaign);

  // If leadIds were provided, assign them to this campaign in db.leads
  if (data.leadIds && data.leadIds.length > 0) {
    for (const lead of db.leads) {
      if (data.leadIds.includes(lead.id)) {
        lead.campaign = newCampaign.name;
        lead.updatedAt = new Date().toISOString();
      }
    }
  }

  writeDb(db);
  return newCampaign;
}

export function updateCampaign(campaignId: string, updates: Partial<Campaign>, requesterId: string, isAdmin: boolean): Campaign {
  const db = readDb();
  if (!db.campaigns) db.campaigns = [];

  const index = db.campaigns.findIndex(c => c.id === campaignId || c.name.toLowerCase() === campaignId.toLowerCase());
  if (index === -1) throw new Error("Campaign not found.");

  if (!isAdmin && db.campaigns[index].userId !== requesterId) {
    throw new Error("Unauthorized: You can only edit your own campaigns.");
  }

  const oldName = db.campaigns[index].name;

  db.campaigns[index] = {
    ...db.campaigns[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // If campaign name changed, update corresponding leads
  if (updates.name && updates.name.trim() !== oldName) {
    for (const lead of db.leads) {
      if (lead.campaign?.toLowerCase() === oldName.toLowerCase()) {
        lead.campaign = updates.name.trim();
        lead.updatedAt = new Date().toISOString();
      }
    }
  }

  writeDb(db);
  return db.campaigns[index];
}

export function deleteCampaign(campaignId: string, requesterId: string, isAdmin: boolean): boolean {
  const db = readDb();
  if (!db.campaigns) db.campaigns = [];

  const target = db.campaigns.find(c => c.id === campaignId || c.name.toLowerCase() === campaignId.toLowerCase());
  if (!target) return false;

  if (!isAdmin && target.userId !== requesterId) {
    throw new Error("Unauthorized: You can only delete your own campaigns.");
  }

  // Remove campaign tag from leads (leads remain untouched in pure leads database!)
  for (const lead of db.leads) {
    if (lead.campaign?.toLowerCase() === target.name.toLowerCase() || (target.leadIds && target.leadIds.includes(lead.id))) {
      delete lead.campaign;
      lead.updatedAt = new Date().toISOString();
    }
  }

  db.campaigns = db.campaigns.filter(c => c.id !== target.id);
  writeDb(db);
  return true;
}

export function assignLeadsToCampaign(leadIds: string[], campaignIdentifier: string, requesterId: string, isAdmin: boolean): number {
  const db = readDb();
  if (!db.campaigns) db.campaigns = [];

  let campaign = db.campaigns.find(c => c.id === campaignIdentifier || c.name.toLowerCase() === campaignIdentifier.trim().toLowerCase());
  
  // If campaign doesn't exist yet, auto-create it
  if (!campaign) {
    campaign = {
      id: "camp_" + Math.random().toString(36).substring(2, 9),
      userId: requesterId,
      name: campaignIdentifier.trim(),
      description: `Targeted outreach campaign`,
      status: "ACTIVE",
      pitchGoal: "SALES",
      leadIds: [],
      stats: { totalLeads: 0, emailsSent: 0, delivered: 0, replied: 0, bounced: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.campaigns.unshift(campaign);
  }

  let updatedCount = 0;
  const leadIdSet = new Set(campaign.leadIds || []);

  for (let i = 0; i < db.leads.length; i++) {
    if (leadIds.includes(db.leads[i].id)) {
      if (isAdmin || db.leads[i].userId === requesterId) {
        db.leads[i].campaign = campaign.name;
        db.leads[i].updatedAt = new Date().toISOString();
        leadIdSet.add(db.leads[i].id);
        updatedCount++;
      }
    }
  }

  campaign.leadIds = Array.from(leadIdSet);
  if (campaign.stats) campaign.stats.totalLeads = campaign.leadIds.length;
  campaign.updatedAt = new Date().toISOString();

  writeDb(db);
  return updatedCount;
}

export function removeLeadsFromCampaign(campaignIdentifier: string, leadIds: string[], requesterId: string, isAdmin: boolean): number {
  const db = readDb();
  if (!db.campaigns) return 0;

  const campaign = db.campaigns.find(c => c.id === campaignIdentifier || c.name.toLowerCase() === campaignIdentifier.trim().toLowerCase());
  let removedCount = 0;

  for (let i = 0; i < db.leads.length; i++) {
    if (leadIds.includes(db.leads[i].id)) {
      if (isAdmin || db.leads[i].userId === requesterId) {
        if (db.leads[i].campaign?.toLowerCase() === (campaign?.name || campaignIdentifier).toLowerCase()) {
          delete db.leads[i].campaign;
          db.leads[i].updatedAt = new Date().toISOString();
          removedCount++;
        }
      }
    }
  }

  if (campaign) {
    campaign.leadIds = (campaign.leadIds || []).filter(id => !leadIds.includes(id));
    if (campaign.stats) campaign.stats.totalLeads = campaign.leadIds.length;
    campaign.updatedAt = new Date().toISOString();
  }

  writeDb(db);
  return removedCount;
}

export function removeCampaign(campaignName: string, requesterId: string, isAdmin: boolean): number {
  deleteCampaign(campaignName, requesterId, isAdmin);
  return 1;
}

export function recordEmailSent(leadId: string, subject: string, status: string = "SENT"): void {
  const db = readDb();
  const index = db.leads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    if (!db.leads[index].emailHistory) {
      db.leads[index].emailHistory = [];
    }
    db.leads[index].emailHistory!.push({
      sentAt: new Date().toISOString(),
      subject,
      status
    });
    db.leads[index].status = "CONTACTED";
    db.leads[index].updatedAt = new Date().toISOString();
    writeDb(db);
  }
}

export function deleteLead(leadId: string, requesterId: string, isAdmin: boolean): boolean {
  const db = readDb();
  const lead = db.leads.find(l => l.id === leadId);
  if (!lead) return false;

  if (!isAdmin && lead.userId !== requesterId) {
    throw new Error("Unauthorized: You can only delete your own leads.");
  }

  db.leads = db.leads.filter(l => l.id !== leadId);
  writeDb(db);
  return true;
}

export function bulkDeleteLeads(leadIds: string[], requesterId: string, isAdmin: boolean): number {
  const db = readDb();
  const initialLength = db.leads.length;

  db.leads = db.leads.filter(lead => {
    if (!leadIds.includes(lead.id)) return true;
    if (!isAdmin && lead.userId !== requesterId) return true; // Keep if not authorized to delete
    return false; // Remove
  });

  const removed = initialLength - db.leads.length;
  writeDb(db);
  return removed;
}

export function cleanDuplicateLeads(requesterId: string, isAdmin: boolean): { removedCount: number; mergedCount: number } {
  const db = readDb();
  const targetLeads = isAdmin ? [...db.leads] : db.leads.filter(l => l.userId === requesterId);
  
  const leadMap = new Map<string, Lead>();
  const idsToRemove = new Set<string>();
  let mergedCount = 0;

  for (const lead of targetLeads) {
    // Generate a unique deduplication key
    let dedupKey = "";
    if (lead.normalizedDomain && lead.normalizedDomain.length > 3 && !lead.normalizedDomain.includes("google.com") && !lead.normalizedDomain.includes("facebook.com")) {
      dedupKey = `domain:${lead.normalizedDomain}`;
    } else if (lead.phoneNumber && lead.phoneNumber.replace(/\D/g, "").length >= 7) {
      dedupKey = `phone:${lead.phoneNumber.replace(/\D/g, "")}`;
    } else if (lead.businessName) {
      dedupKey = `name_city:${lead.businessName.trim().toLowerCase()}_${(lead.city || "").trim().toLowerCase()}`;
    } else {
      dedupKey = `id:${lead.id}`;
    }

    if (leadMap.has(dedupKey)) {
      // Merge into the existing primary lead
      const primary = leadMap.get(dedupKey)!;
      
      const phoneSet = new Set<string>([
        primary.phoneNumber,
        ...(primary.alternatePhones || []),
        lead.phoneNumber,
        ...(lead.alternatePhones || [])
      ]);
      const mergedPhones = Array.from(phoneSet).filter(p => Boolean(p && p.trim()));

      const emailSet = new Set<string>([
        primary.contactEmail,
        ...(primary.alternateEmails || []),
        lead.contactEmail,
        ...(lead.alternateEmails || [])
      ]);
      const mergedEmails = Array.from(emailSet).filter(e => Boolean(e && e.trim()));

      const sourceSet = new Set<string>([
        primary.sourceTechnique,
        ...(primary.discoverySources || []),
        lead.sourceTechnique,
        ...(lead.discoverySources || [])
      ]);

      primary.phoneNumber = primary.phoneNumber || lead.phoneNumber;
      primary.alternatePhones = mergedPhones.filter(p => p !== primary.phoneNumber);
      primary.contactEmail = primary.contactEmail || lead.contactEmail;
      primary.alternateEmails = mergedEmails.filter(e => e !== primary.contactEmail);
      primary.discoverySources = Array.from(sourceSet);
      primary.rating = primary.rating || lead.rating;
      primary.reviewCount = Math.max(primary.reviewCount || 0, lead.reviewCount || 0) || primary.reviewCount;
      primary.address = primary.address || lead.address;
      if (!primary.ownerName || primary.ownerName === "Business Owner") {
        primary.ownerName = lead.ownerName;
      }
      if (!primary.aiPitch && lead.aiPitch) {
        primary.aiPitch = lead.aiPitch;
      }

      idsToRemove.add(lead.id);
      mergedCount++;
    } else {
      leadMap.set(dedupKey, lead);
    }
  }

  if (idsToRemove.size > 0) {
    db.leads = db.leads.filter(l => !idsToRemove.has(l.id));
    // Also update any modified primary leads in db.leads
    for (let i = 0; i < db.leads.length; i++) {
      const current = db.leads[i];
      for (const primary of leadMap.values()) {
        if (current.id === primary.id) {
          db.leads[i] = primary;
        }
      }
    }
    writeDb(db);
  }

  return { removedCount: idsToRemove.size, mergedCount };
}

// Automation Task Helpers
export function getAutomationTasks(requesterId: string, isAdmin: boolean): AutomationTask[] {
  const db = readDb();
  if (!db.automations) return [];
  if (isAdmin) return db.automations;
  return db.automations.filter(t => t.userId === requesterId);
}

export function createAutomationTask(taskData: Omit<AutomationTask, "id" | "totalLeadsHarvested" | "createdAt" | "updatedAt">): AutomationTask {
  const db = readDb();
  if (!db.automations) db.automations = [];

  const newTask: AutomationTask = {
    ...taskData,
    id: `auto_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    totalLeadsHarvested: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.automations.unshift(newTask);
  writeDb(db);
  return newTask;
}

export function updateAutomationTask(id: string, updates: Partial<AutomationTask>, requesterId: string, isAdmin: boolean): AutomationTask {
  const db = readDb();
  if (!db.automations) db.automations = [];

  const index = db.automations.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Automation task not found.");

  if (!isAdmin && db.automations[index].userId !== requesterId) {
    throw new Error("Unauthorized to edit this automation task.");
  }

  db.automations[index] = {
    ...db.automations[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeDb(db);
  return db.automations[index];
}

export function deleteAutomationTask(id: string, requesterId: string, isAdmin: boolean): boolean {
  const db = readDb();
  if (!db.automations) return false;

  const task = db.automations.find(t => t.id === id);
  if (!task) return false;

  if (!isAdmin && task.userId !== requesterId) {
    throw new Error("Unauthorized to delete this automation task.");
  }

  db.automations = db.automations.filter(t => t.id !== id);
  writeDb(db);
  return true;
}


