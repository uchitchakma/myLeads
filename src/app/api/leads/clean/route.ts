import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cleanDuplicateLeads } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let scope = "my";
    try {
      const body = await req.json();
      if (body?.scope) scope = body.scope;
    } catch {}

    const isAdmin = session.role === "ADMIN";
    const cleanAll = isAdmin && scope === "all";
    const result = cleanDuplicateLeads(session.userId, cleanAll);

    return NextResponse.json({
      success: true,
      removedCount: result.removedCount,
      mergedCount: result.mergedCount,
      message: result.removedCount > 0 
        ? `Cleaned ${result.removedCount} duplicate records and merged alternate contacts.` 
        : "Database is already clean! No duplicates detected."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to clean duplicates" }, { status: 500 });
  }
}
