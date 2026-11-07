import { promises as dns } from "dns";

export interface WebsiteVerificationResult {
  isOnline: boolean;
  status: "ONLINE" | "OFFLINE" | "NO_DNS" | "NO_WEBSITE";
  checkedUrl?: string;
  httpStatus?: number;
  reason?: string;
  latencyMs?: number;
}

/**
 * Live Website & DNS Verifier
 * 1. Checks if domain exists via real-time DNS resolution (detects fake / unregistered domains like bengalurusummitproptechstartup.com)
 * 2. Tests HTTP/HTTPS reachability with fast HEAD/GET ping
 */
export async function verifyWebsiteLive(rawUrl?: string): Promise<WebsiteVerificationResult> {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      isOnline: false,
      status: "NO_WEBSITE",
      reason: "No website listed"
    };
  }

  let cleanUrl = rawUrl.trim();
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = "https://" + cleanUrl;
  }

  let hostname = "";
  try {
    const parsed = new URL(cleanUrl);
    hostname = parsed.hostname.toLowerCase();
  } catch {
    return {
      isOnline: false,
      status: "NO_DNS",
      reason: "Invalid URL syntax"
    };
  }

  if (!hostname || !hostname.includes(".")) {
    return {
      isOnline: false,
      status: "NO_DNS",
      reason: "Invalid domain name"
    };
  }

  // 1. Fast DNS resolution check with 3-second hard timeout
  try {
    await Promise.race([
      dns.lookup(hostname),
      new Promise((_, reject) => setTimeout(() => reject(new Error("DNS_TIMEOUT")), 3000))
    ]);
  } catch (err: any) {
    const isEnonFound = err?.code === "ENOTFOUND" || err?.message?.includes("ENOTFOUND");
    return {
      isOnline: false,
      status: "NO_DNS",
      checkedUrl: cleanUrl,
      reason: isEnonFound
        ? "Domain not registered or dead DNS (NXDOMAIN)"
        : "DNS resolution timed out"
    };
  }

  // 2. HTTP/HTTPS Reachability ping
  const start = Date.now();
  try {
    const res = await fetch(cleanUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(3500),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      }
    });
    const latencyMs = Date.now() - start;

    // Any status 200..499 indicates the server is alive and actively answering
    if (res.status >= 200 && res.status < 500) {
      return {
        isOnline: true,
        status: "ONLINE",
        checkedUrl: cleanUrl,
        httpStatus: res.status,
        latencyMs
      };
    } else {
      return {
        isOnline: false,
        status: "OFFLINE",
        checkedUrl: cleanUrl,
        httpStatus: res.status,
        latencyMs,
        reason: `Server responded with HTTP ${res.status}`
      };
    }
  } catch {
    // If HEAD is blocked or fails (e.g. 405 Method Not Allowed), retry with GET
    try {
      const getRes = await fetch(cleanUrl, {
        method: "GET",
        signal: AbortSignal.timeout(3500),
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
      });
      const latencyMs = Date.now() - start;
      if (getRes.status >= 200 && getRes.status < 500) {
        return {
          isOnline: true,
          status: "ONLINE",
          checkedUrl: cleanUrl,
          httpStatus: getRes.status,
          latencyMs
        };
      }
      return {
        isOnline: false,
        status: "OFFLINE",
        checkedUrl: cleanUrl,
        httpStatus: getRes.status,
        latencyMs,
        reason: `Server responded with HTTP ${getRes.status}`
      };
    } catch {
      return {
        isOnline: false,
        status: "OFFLINE",
        checkedUrl: cleanUrl,
        reason: "Connection failed or timed out"
      };
    }
  }
}
