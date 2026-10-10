import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLeads, createLead, updateLead, deleteLead, bulkDeleteLeads, LeadStatus } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.role === "ADMIN";
  const leads = getLeads(session.userId, isAdmin);

  return NextResponse.json({
    leads,
    isAdmin,
    count: leads.length
  });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const newLead = createLead({
      ...body,
      userId: session.userId,
      status: body.status || "DISCOVERED",
      sourceTechnique: body.sourceTechnique || "MANUAL"
    });

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create lead" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ids, updates } = body;
    const isAdmin = session.role === "ADMIN";

    // Handle bulk update (e.g. bulk status change)
    if (ids && Array.isArray(ids) && updates) {
      let updatedCount = 0;
      for (const leadId of ids) {
        try {
          updateLead(leadId, updates, session.userId, isAdmin);
          updatedCount++;
        } catch {}
      }
      return NextResponse.json({ success: true, updatedCount });
    }

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const updated = updateLead(id, updates, session.userId, isAdmin);
    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update lead" }, { status: 400 });
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
    const idsParam = searchParams.get("ids");
    const isAdmin = session.role === "ADMIN";

    // Check if bulk deletion via query parameter
    if (idsParam) {
      const ids = idsParam.split(",").map(s => s.trim()).filter(Boolean);
      const count = bulkDeleteLeads(ids, session.userId, isAdmin);
      return NextResponse.json({ success: true, count });
    }

    // Check if JSON body with ids array
    try {
      const body = await req.json();
      if (body.ids && Array.isArray(body.ids)) {
        const count = bulkDeleteLeads(body.ids, session.userId, isAdmin);
        return NextResponse.json({ success: true, count });
      }
      if (body.id) {
        const success = deleteLead(body.id, session.userId, isAdmin);
        return NextResponse.json({ success });
      }
    } catch {
      // Body was not JSON or empty, fallback to id param
    }

    if (!id) {
      return NextResponse.json({ error: "Lead ID or IDs are required" }, { status: 400 });
    }

    const success = deleteLead(id, session.userId, isAdmin);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete lead" }, { status: 400 });
  }
}

