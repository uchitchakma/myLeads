import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSystemSettings } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Super Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const config = body.smtpConfig || getSystemSettings().systemSmtp;

    if (!config.host || !config.user || !config.pass) {
      return NextResponse.json({
        error: "Host, Username, and Password are required to test SMTP connection."
      }, { status: 400 });
    }

    const port = Number(config.port) || (config.secure ? 465 : 587);
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: port,
      secure: config.secure ?? (port === 465),
      auth: {
        user: config.user,
        pass: config.pass
      },
      connectionTimeout: 10000
    });

    // 1. Verify credentials and transport handshake
    await transporter.verify();

    // 2. Send actual test email to the configured notification recipient or the current admin
    const recipient = config.notificationEmail || session.email;
    const sender = config.senderEmail || config.user;
    const senderName = config.senderName || "myLeads System";

    const info = await transporter.sendMail({
      from: `"${senderName}" <${sender}>`,
      to: recipient,
      subject: "myLeads System — Global SMTP Gateway Test ✅",
      text: `Hello ${session.name || "Super Admin"},\n\nThis is a verified test email from your myLeads Global System SMTP configuration on https://myleads.ucdreams.com.\n\nConnection Details:\n- SMTP Host: ${config.host}:${port}\n- SSL/TLS: ${config.secure ? "Enabled (SSL)" : "TLS (STARTTLS)"}\n- Auth User: ${config.user}\n- Test Timestamp: ${new Date().toISOString()}\n\nYour outbound mail gateway is 100% operational and ready to send contact form notifications and client outreach.\n\nBest regards,\nmyLeads Autonomous Client Engine`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #0A0D14; color: #FFFFFF; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: #C5453E; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white;">mL</div>
            <h2 style="margin: 0; font-size: 18px; color: #FFFFFF;">myLeads System SMTP Test</h2>
          </div>
          <p style="color: #10B981; font-weight: 600; font-size: 14px;">✅ Outbound SMTP Gateway is 100% Operational!</p>
          <p style="color: #9CA3AF; font-size: 13px; line-height: 1.6;">
            Your global mail server has successfully authenticated and verified outbound deliverability.
          </p>
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; font-size: 12px; color: #E5E7EB; margin: 18px 0;">
            <div style="margin-bottom: 6px;"><strong>Host:</strong> ${config.host}:${port}</div>
            <div style="margin-bottom: 6px;"><strong>Protocol:</strong> ${config.secure ? "SSL Encrypted (Port 465)" : "STARTTLS (Port 587)"}</div>
            <div style="margin-bottom: 6px;"><strong>Auth User:</strong> ${config.user}</div>
            <div><strong>Timestamp:</strong> ${new Date().toUTCString()}</div>
          </div>
          <p style="font-size: 11px; color: #6B7280; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
            myLeads by UCDREAMS — https://myleads.ucdreams.com
          </p>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      message: `SMTP connection verified successfully! A test email was delivered to ${recipient}.`,
      messageId: info.messageId
    });
  } catch (error: any) {
    return NextResponse.json({
      error: `SMTP Connection Failed: ${error.message || error}`
    }, { status: 400 });
  }
}
