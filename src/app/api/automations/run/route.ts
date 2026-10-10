import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAutomationTasks, updateAutomationTask, createOrUpdateLead, findUserById, recordEmailSent } from "@/lib/db";
import { harvestGoogleMapsLeads } from "@/lib/google_maps_scraper";
import { runTechnique1Harvester } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { taskId } = await req.json();
    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required." }, { status: 400 });
    }

    const isAdmin = session.role === "ADMIN";
    const tasks = getAutomationTasks(session.userId, isAdmin);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return NextResponse.json({ error: "Automation task not found." }, { status: 404 });
    }

    const user = findUserById(task.userId);
    let totalHarvestedThisRun = 0;
    let newSavedThisRun = 0;
    const harvestedLeadIds: string[] = [];

    const perItemCount = Math.max(2, Math.ceil(task.leadsPerRun / (task.niches.length * (task.cities.length || 1))));

    for (const city of task.cities) {
      for (const niche of task.niches) {
        let scrapedItems: any[] = [];

        if (task.sourceTechnique === "ALL_SOURCES") {
          const [googleRes, osmRes] = await Promise.allSettled([
            harvestGoogleMapsLeads(niche, city, perItemCount, user?.googleMapsApiKey),
            runTechnique1Harvester(niche, city, perItemCount)
          ]);
          const googleItems = googleRes.status === "fulfilled" ? googleRes.value : [];
          const osmItems = osmRes.status === "fulfilled" ? osmRes.value : [];
          scrapedItems = [...googleItems, ...osmItems];
        } else if (task.sourceTechnique === "GOOGLE_MAPS") {
          scrapedItems = await harvestGoogleMapsLeads(niche, city, perItemCount, user?.googleMapsApiKey);
        } else {
          scrapedItems = await runTechnique1Harvester(niche, city, perItemCount);
        }

        for (const item of scrapedItems) {
          totalHarvestedThisRun++;
          const { lead, isDuplicate } = createOrUpdateLead({
            userId: task.userId,
            businessName: item.businessName,
            websiteUrl: item.websiteUrl,
            googleMapsUrl: item.googleMapsUrl,
            sourceUrl: item.sourceUrl,
            campaign: task.campaignName || `Autopilot: ${task.name}`,
            phoneNumber: item.phoneNumber,
            contactEmail: item.contactEmail,
            ownerName: item.ownerName,
            category: item.category,
            city: item.city,
            sourceTechnique: task.sourceTechnique,
            status: task.autoOutreach ? "CONTACTED" : "AUDITED",
            rating: (item as any).rating,
            reviewCount: (item as any).reviewCount,
            speedScore: item.speedScore,
            mobileFriendly: item.mobileFriendly,
            loadTime: item.loadTime,
            detectedIssues: item.detectedIssues,
            aiPitch: item.aiPitch
          });

          if (!isDuplicate) {
            newSavedThisRun++;
            harvestedLeadIds.push(lead.id);

            // If auto-outreach is on, record simulated/real email
            if (task.autoOutreach) {
              const subject = lead.aiPitch?.subjects?.[0] || `Quick note regarding ${lead.businessName}'s mobile speed`;
              recordEmailSent(lead.id, subject, "AUTOPILOT_DISPATCHED");
            }
          }
        }
      }
    }

    // Compute next run timestamp
    const nextRun = new Date();
    if (task.frequency === "MONTHLY") {
      nextRun.setMonth(nextRun.getMonth() + 1);
    } else if (task.frequency === "WEEKLY") {
      nextRun.setDate(nextRun.getDate() + 7);
    } else {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const updatedTask = updateAutomationTask(task.id, {
      lastRunAt: new Date().toISOString(),
      nextRunAt: nextRun.toISOString(),
      totalLeadsHarvested: (task.totalLeadsHarvested || 0) + newSavedThisRun
    }, session.userId, isAdmin);

    return NextResponse.json({
      success: true,
      task: updatedTask,
      totalHarvested: totalHarvestedThisRun,
      newLeadsSaved: newSavedThisRun,
      message: `Autopilot ran successfully! Harvested ${totalHarvestedThisRun} businesses, saved ${newSavedThisRun} new qualified leads${task.autoOutreach ? ' and auto-dispatched cold outreach.' : '.'}`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to run automation task" }, { status: 500 });
  }
}
