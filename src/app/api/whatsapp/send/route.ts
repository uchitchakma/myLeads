import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { recordWhatsAppSent } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message, leadId } = body;

    if (!phone || !message) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: phone and message are mandatory.",
      }, { status: 400 });
    }

    const result = await sendWhatsAppMessage(phone, message);

    if (result.success) {
      if (leadId) {
        recordWhatsAppSent(leadId, message, phone);
      }
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        recipient: phone,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || "Failed to deliver WhatsApp message",
      }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to process WhatsApp dispatch",
    }, { status: 500 });
  }
}
