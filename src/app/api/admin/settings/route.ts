import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSystemSettings, updateSystemSettings } from "@/lib/db";

export async function GET() {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Super Admin access required." }, { status: 403 });
  }

  const settings = getSystemSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Super Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const updated = updateSystemSettings(body);
    return NextResponse.json({
      success: true,
      message: "Global admin and API settings saved successfully",
      settings: updated
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update system settings" }, { status: 400 });
  }
}
