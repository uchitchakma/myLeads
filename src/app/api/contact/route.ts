import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, createLead, getAllUsers } from "@/lib/db";
import nodemailer from "nodemailer";

// Enable CORS for contact forms embedded on external websites
function setCorsHeaders(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  return setCorsHeaders(res);
}

export async function POST(req: NextRequest) {
  try {
    const settings = getSystemSettings();
    const config = settings.contactFormConfig;

    if (!config.enabled) {
      const res = NextResponse.json({ error: "Contact form submissions are currently disabled." }, { status: 403 });
      return setCorsHeaders(res);
    }

    const body = await req.json();
    const { name, email, phone, message, company, website } = body;

    if (!name || (!email && !phone)) {
      const res = NextResponse.json({ error: "Name and at least an email or phone number are required." }, { status: 400 });
      return setCorsHeaders(res);
    }

    // 1. Auto-save as an Inbound Lead if enabled
    let savedLead = null;
    if (config.saveAsLead) {
      // Find the super admin user id to assign the inbound lead to
      const users = getAllUsers();
      const adminUser = users.find(u => u.role === "ADMIN") || users[0];
      const adminId = adminUser ? adminUser.id : "usr_admin_master";

      try {
        savedLead = createLead({
          userId: adminId,
          businessName: company || `${name}'s Inquiry`,
          websiteUrl: website || "https://direct-contact.inbound",
          ownerName: name,
          contactEmail: email || "",
          phoneNumber: phone || "",
          city: "Inbound Web",
          category: "Inbound Inquiry",
          sourceTechnique: "CONTACT_FORM",
          discoverySources: ["CONTACT_FORM"],
          status: "DISCOVERED",
          speedScore: 100,
          mobileFriendly: true,
          loadTime: "0.1s",
          detectedIssues: [],
          tags: ["Contact Form", "Inbound Lead"],
          aiPitch: {
            subjects: [`Inbound inquiry from ${name}`],
            body: message || "Submitted via external contact form.",
            whatsapp: phone ? `Hi ${name}, thank you for reaching out through our contact form!` : ""
          }
        });
      } catch (e) {
        console.error("Failed to auto-save lead from contact form:", e);
      }
    }

    // 2. Dispatch email notification to Super Admin if configured
    let emailDispatched = false;
    const smtp = settings.systemSmtp;
    if (config.forwardToEmail && smtp.host && smtp.user && smtp.pass && smtp.notificationEmail) {
      try {
        const port = Number(smtp.port) || (smtp.secure ? 465 : 587);
        const transporter = nodemailer.createTransport({
          host: smtp.host,
          port: port,
          secure: smtp.secure ?? (port === 465),
          auth: {
            user: smtp.user,
            pass: smtp.pass
          },
          connectionTimeout: 8000
        });

        await transporter.sendMail({
          from: `"${smtp.senderName || "myLeads Contact Alert"}" <${smtp.senderEmail || smtp.user}>`,
          to: smtp.notificationEmail,
          replyTo: email || undefined,
          subject: `🔔 New Contact Form Submission from ${name} ${company ? `(${company})` : ""}`,
          text: `You have received a new contact form submission:\n\nName: ${name}\nEmail: ${email || "N/A"}\nPhone: ${phone || "N/A"}\nCompany: ${company || "N/A"}\nWebsite: ${website || "N/A"}\n\nMessage:\n${message || "No message content provided."}\n\nTimestamp: ${new Date().toISOString()}\nView in Master Leads: https://myleads.ucdreams.com/admin/leads`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0A0D14; color: #FFFFFF; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <div style="width: 36px; height: 36px; border-radius: 10px; background: #C5453E; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white;">mL</div>
                <h2 style="margin: 0; font-size: 18px; color: #FFFFFF;">New Inbound Contact Form Lead</h2>
              </div>
              <p style="color: #9CA3AF; font-size: 13px; line-height: 1.5;">
                A new prospect submitted an inquiry through your connected contact form:
              </p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
                <tr>
                  <td style="padding: 8px 12px; color: #9CA3AF; border-bottom: 1px solid rgba(255,255,255,0.06); width: 120px;"><strong>Name:</strong></td>
                  <td style="padding: 8px 12px; color: #FFFFFF; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 600;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #9CA3AF; border-bottom: 1px solid rgba(255,255,255,0.06);"><strong>Email:</strong></td>
                  <td style="padding: 8px 12px; color: #38BDF8; border-bottom: 1px solid rgba(255,255,255,0.06);"><a href="mailto:${email}" style="color: #38BDF8; text-decoration: none;">${email || "N/A"}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #9CA3AF; border-bottom: 1px solid rgba(255,255,255,0.06);"><strong>Phone:</strong></td>
                  <td style="padding: 8px 12px; color: #FFFFFF; border-bottom: 1px solid rgba(255,255,255,0.06);">${phone || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #9CA3AF; border-bottom: 1px solid rgba(255,255,255,0.06);"><strong>Company:</strong></td>
                  <td style="padding: 8px 12px; color: #FFFFFF; border-bottom: 1px solid rgba(255,255,255,0.06);">${company || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #9CA3AF; border-bottom: 1px solid rgba(255,255,255,0.06);"><strong>Website:</strong></td>
                  <td style="padding: 8px 12px; color: #38BDF8; border-bottom: 1px solid rgba(255,255,255,0.06);">${website ? `<a href="${website}" style="color: #38BDF8; text-decoration: none;">${website}</a>` : "N/A"}</td>
                </tr>
              </table>

              <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; margin: 16px 0;">
                <div style="font-size: 11px; text-transform: uppercase; color: #9CA3AF; font-weight: 600; margin-bottom: 6px;">Message Inquiry</div>
                <div style="font-size: 13px; color: #E5E7EB; white-space: pre-wrap; line-height: 1.6;">${message || "No text provided."}</div>
              </div>

              <div style="margin-top: 24px; text-align: center;">
                <a href="https://myleads.ucdreams.com/admin/leads" style="display: inline-block; padding: 10px 20px; background: #C5453E; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; border-radius: 10px;">
                  Open in Master Leads Database →
                </a>
              </div>
            </div>
          `
        });
        emailDispatched = true;
      } catch (emailErr) {
        console.error("Failed to forward contact form email:", emailErr);
      }
    }

    const res = NextResponse.json({
      success: true,
      message: "Your message has been received! We will be in touch shortly.",
      savedAsLead: Boolean(savedLead),
      emailDispatched
    });
    return setCorsHeaders(res);
  } catch (error: any) {
    const res = NextResponse.json({ error: error.message || "Failed to process contact submission" }, { status: 500 });
    return setCorsHeaders(res);
  }
}
