import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAutomationTasks, createAutomationTask, updateAutomationTask, deleteAutomationTask } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.role === "ADMIN";
  const tasks = getAutomationTasks(session.userId, isAdmin);

  return NextResponse.json({
    tasks,
    count: tasks.length
  });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, niches, cities, sourceTechnique, frequency, leadsPerRun, campaignName, autoOutreach } = body;

    if (!name || !niches || !Array.isArray(niches) || niches.length === 0) {
      return NextResponse.json({ error: "Task name and at least one niche are required." }, { status: 400 });
    }

    // Calculate next run date
    const nextRun = new Date();
    if (frequency === "MONTHLY") {
      nextRun.setMonth(nextRun.getMonth() + 1);
    } else if (frequency === "WEEKLY") {
      nextRun.setDate(nextRun.getDate() + 7);
    } else {
      // DAILY
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const newTask = createAutomationTask({
      userId: session.userId,
      name: name.trim(),
      niches: niches.map(n => n.trim()).filter(Boolean),
      cities: (cities && Array.isArray(cities) && cities.length > 0) ? cities.map(c => c.trim()).filter(Boolean) : ["Miami, FL"],
      sourceTechnique: sourceTechnique || "ALL_SOURCES",
      frequency: frequency || "DAILY",
      leadsPerRun: leadsPerRun || 10,
      campaignName: campaignName ? campaignName.trim() : undefined,
      autoOutreach: Boolean(autoOutreach),
      isActive: true,
      nextRunAt: nextRun.toISOString()
    });

    return NextResponse.json({ success: true, task: newTask });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create automation task" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, updates } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const isAdmin = session.role === "ADMIN";
    const updated = updateAutomationTask(id, updates, session.userId, isAdmin);

    return NextResponse.json({ success: true, task: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update automation task" }, { status: 500 });
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
    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const isAdmin = session.role === "ADMIN";
    const success = deleteAutomationTask(id, session.userId, isAdmin);

    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete automation task" }, { status: 500 });
  }
}
