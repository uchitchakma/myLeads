import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { 
  getCampaigns, 
  getCampaignById, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign, 
  assignLeadsToCampaign, 
  removeLeadsFromCampaign 
} from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.role === "ADMIN";
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("id");

  if (campaignId) {
    const data = getCampaignById(campaignId, session.userId, isAdmin);
    if (!data) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  const campaigns = getCampaigns(session.userId, isAdmin);

  return NextResponse.json({
    campaigns,
    count: campaigns.length
  });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const isAdmin = session.role === "ADMIN";

    // Action 1: Create a new Campaign
    if (body.action === "CREATE" || (!body.leadIds && body.name)) {
      if (!body.name || !body.name.trim()) {
        return NextResponse.json({ error: "Campaign name is required." }, { status: 400 });
      }

      const campaign = createCampaign({
        userId: session.userId,
        name: body.name.trim(),
        description: body.description,
        targetNiche: body.targetNiche,
        targetCity: body.targetCity,
        status: body.status || "ACTIVE",
        pitchGoal: body.pitchGoal || "SALES",
        emailSubject: body.emailSubject,
        emailBody: body.emailBody,
        leadIds: body.leadIds || []
      });

      return NextResponse.json({ success: true, campaign });
    }

    // Action 2: Remove specific leads from a Campaign
    if (body.action === "REMOVE_LEADS") {
      const { campaignId, campaignName, leadIds } = body;
      const targetIdentifier = campaignId || campaignName;
      if (!targetIdentifier || !leadIds || !Array.isArray(leadIds)) {
        return NextResponse.json({ error: "Campaign identifier and lead IDs required." }, { status: 400 });
      }

      const removedCount = removeLeadsFromCampaign(targetIdentifier, leadIds, session.userId, isAdmin);
      return NextResponse.json({ success: true, removedCount });
    }

    // Action 3: Assign leads to a Campaign
    const { leadIds, campaignName, campaignId } = body;
    const targetIdentifier = campaignName || campaignId;
    if (!targetIdentifier || !targetIdentifier.trim()) {
      return NextResponse.json({ error: "Campaign name is required." }, { status: 400 });
    }
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: "At least one lead must be selected." }, { status: 400 });
    }

    const assignedCount = assignLeadsToCampaign(leadIds, targetIdentifier.trim(), session.userId, isAdmin);

    return NextResponse.json({
      success: true,
      campaignName: targetIdentifier.trim(),
      assignedCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process campaign action" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, updates } = await req.json();
    if (!id || !updates) {
      return NextResponse.json({ error: "Campaign ID and updates are required." }, { status: 400 });
    }

    const isAdmin = session.role === "ADMIN";
    const updated = updateCampaign(id, updates, session.userId, isAdmin);

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const target = id || name;

    if (!target) {
      return NextResponse.json({ error: "Campaign ID or name is required." }, { status: 400 });
    }

    const isAdmin = session.role === "ADMIN";
    const success = deleteCampaign(target, session.userId, isAdmin);

    return NextResponse.json({
      success,
      message: "Campaign deleted successfully. Grouped leads have been preserved in your database."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete campaign" }, { status: 500 });
  }
}
