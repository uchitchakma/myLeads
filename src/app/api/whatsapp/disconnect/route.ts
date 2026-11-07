import { NextRequest, NextResponse } from "next/server";
import { disconnectWhatsApp, getWhatsAppStatus } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await disconnectWhatsApp();
    const status = getWhatsAppStatus();

    return NextResponse.json({
      success: true,
      message: "WhatsApp session unlinked and logged out successfully.",
      ...status,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to disconnect WhatsApp",
    }, { status: 500 });
  }
}
