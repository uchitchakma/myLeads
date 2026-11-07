import { NextRequest, NextResponse } from "next/server";
import { recordEmailOpened } from "@/lib/db";

// 1x1 Transparent GIF byte buffer (Industry standard tracking pixel)
const TRANSPARENT_1X1_GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingId = searchParams.get("tid") || undefined;
    const leadId = searchParams.get("lid") || undefined;
    const action = searchParams.get("action");
    const format = searchParams.get("format");
    const userAgent = req.headers.get("user-agent") || undefined;

    // Record open activity in database
    const result = recordEmailOpened(leadId, trackingId, userAgent);

    // If requested as JSON (e.g. from the UI test trigger)
    if (format === "json" || action === "simulate") {
      return NextResponse.json({
        success: result.success,
        leadId: result.leadId || leadId,
        openCount: result.openCount,
        message: result.success ? `Email open recorded (Total opens: ${result.openCount})` : "Email record not found"
      });
    }

    // Default: return 1x1 transparent GIF image with zero-cache headers for email clients
    return new NextResponse(TRANSPARENT_1X1_GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Content-Length": String(TRANSPARENT_1X1_GIF.length),
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error: any) {
    // Return pixel even on error so recipient mail client doesn't show broken image icon
    return new NextResponse(TRANSPARENT_1X1_GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, trackingId } = body;
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = recordEmailOpened(leadId, trackingId, userAgent);
    return NextResponse.json({
      success: result.success,
      leadId: result.leadId || leadId,
      openCount: result.openCount,
      message: result.success ? `Email open recorded (${result.openCount}x)` : "Record not found"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to record open" }, { status: 500 });
  }
}
