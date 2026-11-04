import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findUserById, getLeads, recordEmailSent } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { leadIds, customSubject, customBody, useAiPitch = true } = await req.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: "Please select at least one lead to email." }, { status: 400 });
    }

    const user = findUserById(session.userId);
    const isAdmin = session.role === "ADMIN";
    const allLeads = getLeads(session.userId, isAdmin);
    const targetLeads = allLeads.filter(l => leadIds.includes(l.id));

    if (targetLeads.length === 0) {
      return NextResponse.json({ error: "No matching leads found." }, { status: 400 });
    }

    const smtpConfig = user?.smtpConfig;
    const hasRealSmtp = Boolean(smtpConfig?.host && smtpConfig?.user && smtpConfig?.pass);

    let transporter: any = null;
    if (hasRealSmtp) {
      transporter = nodemailer.createTransport({
        host: smtpConfig!.host,
        port: smtpConfig!.port || 587,
        secure: smtpConfig!.port === 465,
        auth: {
          user: smtpConfig!.user,
          pass: smtpConfig!.pass
        }
      });
    }

    const dispatchLogs: Array<{
      leadId: string;
      businessName: string;
      recipientEmail: string;
      subject: string;
      status: "SENT" | "SIMULATED_SENT" | "FAILED";
      error?: string;
    }> = [];

    for (const lead of targetLeads) {
      const recipient = lead.contactEmail || `contact@${lead.normalizedDomain || "client.com"}`;
      
      // Determine Subject & Body
      let subject = customSubject || lead.aiPitch?.subjects?.[0] || `Quick question regarding ${lead.businessName}'s website`;
      let body = useAiPitch && lead.aiPitch?.body 
        ? lead.aiPitch.body 
        : (customBody || "Hello {{ownerName}},\n\nI was looking at {{businessName}} and wanted to share a quick mobile performance audit...\n\nBest regards,\nUchit Chakma\nFounder & Technical Director | UCDREAMS\nhttps://ucdreams.com");

      // Replace template merge variables
      const mergeVars: Record<string, string> = {
        "{{businessName}}": lead.businessName || "Business",
        "{{ownerName}}": lead.ownerName && lead.ownerName !== "Business Owner" ? lead.ownerName : "Team",
        "{{websiteUrl}}": lead.websiteUrl || "",
        "{{city}}": lead.city || "your area",
        "{{speedScore}}": String(lead.speedScore || 45),
        "{{loadTime}}": lead.loadTime || "5.2s",
        "{{rating}}": String(lead.rating || "4.8"),
        "{{reviewCount}}": String(lead.reviewCount || "40")
      };

      for (const [tag, val] of Object.entries(mergeVars)) {
        subject = subject.replaceAll(tag, val);
        body = body.replaceAll(tag, val);
      }

      if (hasRealSmtp && transporter) {
        try {
          await transporter.sendMail({
            from: `"${smtpConfig!.senderName || user?.name || "Web Consultant"}" <${smtpConfig!.senderEmail || smtpConfig!.user}>`,
            to: recipient,
            subject,
            text: body
          });

          recordEmailSent(lead.id, subject, "SENT");
          dispatchLogs.push({
            leadId: lead.id,
            businessName: lead.businessName,
            recipientEmail: recipient,
            subject,
            status: "SENT"
          });
        } catch (mailErr: any) {
          dispatchLogs.push({
            leadId: lead.id,
            businessName: lead.businessName,
            recipientEmail: recipient,
            subject,
            status: "FAILED",
            error: mailErr.message
          });
        }
      } else {
        // Simulated Dispatch (Updates local CRM pipeline & records activity)
        recordEmailSent(lead.id, subject, "SIMULATED_SENT");
        dispatchLogs.push({
          leadId: lead.id,
          businessName: lead.businessName,
          recipientEmail: recipient,
          subject,
          status: "SIMULATED_SENT"
        });
      }
    }

    const successCount = dispatchLogs.filter(d => d.status !== "FAILED").length;

    return NextResponse.json({
      success: true,
      mode: hasRealSmtp ? "LIVE_SMTP" : "SIMULATION_MODE",
      sentCount: successCount,
      failedCount: dispatchLogs.length - successCount,
      logs: dispatchLogs,
      message: hasRealSmtp
        ? `Successfully dispatched ${successCount} cold emails via your custom SMTP server.`
        : `Dispatched ${successCount} personalized cold outreach emails (Simulation Mode). Configure your SMTP in Settings for 1-click live sending.`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Outreach dispatch failed" }, { status: 500 });
  }
}
