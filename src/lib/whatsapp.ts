import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  WASocket,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export type WhatsAppConnectionStatus = "DISCONNECTED" | "CONNECTING" | "SCAN_QR" | "CONNECTED" | "ERROR";

export interface WhatsAppStatusInfo {
  status: WhatsAppConnectionStatus;
  phoneNumber?: string;
  userName?: string;
  qrCode?: string; // Base64 data URL
  connectedAt?: string;
  lastError?: string;
}

interface WhatsAppManager {
  sock: WASocket | null;
  status: WhatsAppConnectionStatus;
  qrCode: string | null;
  phoneNumber: string | null;
  userName: string | null;
  connectedAt: string | null;
  lastError: string | null;
  isConnecting: boolean;
}

// Global singleton to persist across Next.js API requests
const globalForWA = globalThis as unknown as {
  __whatsapp_manager__?: WhatsAppManager;
};

const waManager: WhatsAppManager = globalForWA.__whatsapp_manager__ || {
  sock: null,
  status: "DISCONNECTED",
  qrCode: null,
  phoneNumber: null,
  userName: null,
  connectedAt: null,
  lastError: null,
  isConnecting: false,
};

globalForWA.__whatsapp_manager__ = waManager;

const AUTH_DIR = path.join(process.cwd(), "whatsapp_auth");

function ensureAuthDir() {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
}

export function hasSavedSession(): boolean {
  try {
    const credsPath = path.join(AUTH_DIR, "creds.json");
    return fs.existsSync(credsPath);
  } catch {
    return false;
  }
}

export function getWhatsAppStatus(): WhatsAppStatusInfo {
  return {
    status: waManager.status,
    phoneNumber: waManager.phoneNumber || undefined,
    userName: waManager.userName || undefined,
    qrCode: waManager.qrCode || undefined,
    connectedAt: waManager.connectedAt || undefined,
    lastError: waManager.lastError || undefined,
  };
}

export async function initWhatsApp(forceNew: boolean = false): Promise<WhatsAppStatusInfo> {
  if (waManager.isConnecting) {
    return getWhatsAppStatus();
  }

  if (waManager.sock && waManager.status === "CONNECTED" && !forceNew) {
    return getWhatsAppStatus();
  }

  waManager.isConnecting = true;
  waManager.lastError = null;
  waManager.status = "CONNECTING";

  try {
    ensureAuthDir();

    if (forceNew) {
      if (waManager.sock) {
        try {
          waManager.sock.end(new Error("Force restart requested"));
        } catch (_) {}
        waManager.sock = null;
      }
      try {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        ensureAuthDir();
      } catch (_) {}
      waManager.qrCode = null;
      waManager.phoneNumber = null;
      waManager.userName = null;
      waManager.connectedAt = null;
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }) as any,
      browser: ["myLeads Web Outbox", "Chrome", "122.0.0"],
      syncFullHistory: false,
      generateHighQualityLinkPreview: false,
    });

    waManager.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qr, {
            errorCorrectionLevel: "M",
            margin: 2,
            scale: 7,
            color: {
              dark: "#1e293b",
              light: "#ffffff",
            },
          });
          waManager.qrCode = qrDataUrl;
          waManager.status = "SCAN_QR";
          waManager.isConnecting = false;
        } catch (err: any) {
          console.error("Failed to generate QR Data URL:", err);
          waManager.lastError = "Failed to render QR Code";
        }
      }

      if (connection === "open") {
        waManager.status = "CONNECTED";
        waManager.qrCode = null;
        waManager.isConnecting = false;
        waManager.lastError = null;
        waManager.connectedAt = new Date().toISOString();

        if (sock.user) {
          const rawId = sock.user.id || "";
          const phone = rawId.split(":")[0].replace("@s.whatsapp.net", "");
          waManager.phoneNumber = phone;
          waManager.userName = sock.user.name || "WhatsApp Business";
        }
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;

        waManager.isConnecting = false;

        if (isLoggedOut) {
          waManager.status = "DISCONNECTED";
          waManager.qrCode = null;
          waManager.phoneNumber = null;
          waManager.userName = null;
          waManager.sock = null;
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch (_) {}
        } else {
          // Automatic reconnect if connection dropped but session is still valid
          waManager.status = "DISCONNECTED";
          if (hasSavedSession() && !forceNew) {
            setTimeout(() => {
              initWhatsApp(false).catch(console.error);
            }, 3000);
          }
        }
      }
    });

    return getWhatsAppStatus();
  } catch (error: any) {
    waManager.isConnecting = false;
    waManager.status = "ERROR";
    waManager.lastError = error.message || "Failed to initialize WhatsApp connection";
    return getWhatsAppStatus();
  }
}

export async function disconnectWhatsApp(): Promise<boolean> {
  try {
    if (waManager.sock) {
      try {
        await waManager.sock.logout();
      } catch (_) {
        waManager.sock.end(new Error("Manual logout"));
      }
    }
  } catch (_) {}

  waManager.sock = null;
  waManager.status = "DISCONNECTED";
  waManager.qrCode = null;
  waManager.phoneNumber = null;
  waManager.userName = null;
  waManager.connectedAt = null;
  waManager.isConnecting = false;
  waManager.lastError = null;

  try {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  } catch (_) {}

  return true;
}

export async function sendWhatsAppMessage(
  toPhone: string,
  messageText: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!waManager.sock || waManager.status !== "CONNECTED") {
    // Attempt auto-reconnect if session exists
    if (hasSavedSession()) {
      await initWhatsApp(false);
      // Wait up to 4s for open connection
      for (let i = 0; i < 8; i++) {
        if (waManager.status === "CONNECTED" && waManager.sock) break;
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  if (!waManager.sock || waManager.status !== "CONNECTED") {
    return {
      success: false,
      error: "WhatsApp is not connected. Please scan the QR code in Settings first.",
    };
  }

  try {
    let clean = toPhone.replace(/[^\d]/g, "");
    if (clean.length === 10) {
      clean = "1" + clean; // Default US/Canada or adjust
    }
    const jid = `${clean}@s.whatsapp.net`;

    // Verify number is on WhatsApp
    try {
      const checkResults = await waManager.sock.onWhatsApp(jid);
      if (checkResults && checkResults.length > 0 && !checkResults[0].exists) {
        return {
          success: false,
          error: `Phone number ${clean} is not registered on WhatsApp.`,
        };
      }
    } catch (_) {
      // Non-blocking fallback
    }

    // Humanized typing presence simulation
    try {
      await waManager.sock.sendPresenceUpdate("composing", jid);
      await new Promise((r) => setTimeout(r, 1200));
      await waManager.sock.sendPresenceUpdate("paused", jid);
    } catch (_) {}

    const result = await waManager.sock.sendMessage(jid, {
      text: messageText,
    });

    return {
      success: true,
      messageId: result?.key?.id || undefined,
    };
  } catch (error: any) {
    console.error("sendWhatsAppMessage error:", error);
    return {
      success: false,
      error: error.message || "Failed to dispatch WhatsApp message",
    };
  }
}
