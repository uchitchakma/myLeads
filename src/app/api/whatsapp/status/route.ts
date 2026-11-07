import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppStatus, initWhatsApp, hasSavedSession } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shouldInit = searchParams.get("init") === "true";
    const forceNew = searchParams.get("force") === "true";

    let status = getWhatsAppStatus();

    // If requested to initialize or if saved session exists and currently disconnected
    if (shouldInit || (hasSavedSession() && status.status === "DISCONNECTED")) {
      status = await initWhatsApp(forceNew);
    }

    return NextResponse.json({
      success: true,
      ...status,
      hasSavedSession: hasSavedSession(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to retrieve WhatsApp status",
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const forceNew = body.forceNew === true;

    const status = await initWhatsApp(forceNew);

    return NextResponse.json({
      success: true,
      ...status,
      hasSavedSession: hasSavedSession(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to initiate WhatsApp pairing",
    }, { status: 500 });
  }
}
