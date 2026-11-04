const https = require('https');
const http = require('http');
const { URL } = require('url');

const BASE_URL = 'https://myleads.ucdreams.com';

// Helper to make fetch with cookie
async function fetchWithCookie(url, options = {}, cookie = '') {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { 'Cookie': cookie } : {}),
      ...(options.headers || {})
    }
  });
}

// Helper to test website availability and title
async function checkWebsite(urlStr) {
  if (!urlStr || !urlStr.startsWith('http')) {
    return { ok: false, error: 'No valid URL' };
  }
  try {
    const res = await fetch(urlStr, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'No Title Tag';
    return {
      ok: res.ok || res.status < 400,
      status: res.status,
      title: title.substring(0, 80)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Helper to check profile/source link
async function checkSourceUrl(urlStr) {
  if (!urlStr || !urlStr.startsWith('http')) {
    return { ok: false, error: 'No valid URL' };
  }
  try {
    const res = await fetch(urlStr, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });
    return { ok: res.status < 400 || res.status === 403 || res.status === 429, status: res.status };
  } catch (err) {
    // try GET fallback
    try {
      const res2 = await fetch(urlStr, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(6000)
      });
      return { ok: res2.status < 400 || res2.status === 403, status: res2.status };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}

async function main() {
  console.log('--- 1. AUTHENTICATING AS uchitchakmas@gmail.com ---');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'uchitchakmas@gmail.com', password: 'Uchir@123' })
  });

  const rawCookies = loginRes.headers.get('set-cookie');
  if (!rawCookies) {
    console.error('Failed to get cookies:', await loginRes.text());
    return;
  }
  const cookie = rawCookies.split(';')[0];
  console.log('✓ Successfully authenticated! Cookie:', cookie.substring(0, 20) + '...');

  const methods = [
    { id: 'AD_SPENDERS', niche: 'Dental Clinic', city: 'New York, NY' },
    { id: 'HIGH_TICKET_CONTRACTORS', niche: 'Roofing Contractor', city: 'Dallas, TX' },
    { id: 'SHOPIFY_ECOMMERCE', niche: 'Apparel', city: 'Los Angeles, CA' },
    { id: 'LOW_RATING_REPUTATION', niche: 'Auto Repair', city: 'Miami, FL' },
    { id: 'NEW_BUSINESS_REGISTRATIONS', niche: 'Consulting', city: 'Austin, TX' },
    { id: 'GOOGLE_MAPS', niche: 'Plumber', city: 'Chicago, IL' },
    { id: 'LINKEDIN_XRAY', niche: 'Marketing Agency', city: 'San Francisco, CA' },
    { id: 'HIRING_SIGNALS', niche: 'Software', city: 'Seattle, WA' },
    { id: 'YELLOW_PAGES', niche: 'Electrician', city: 'Atlanta, GA' },
    { id: 'META_WHATSAPP', niche: 'Fitness Gym', city: 'San Diego, CA' },
    { id: 'CLUTCH_B2B', niche: 'App Development', city: 'New York, NY' },
    { id: 'BBB_TRUST', niche: 'HVAC Services', city: 'Phoenix, AZ' },
    { id: 'OPEN_STREET_MAP', niche: 'Bakery', city: 'Boston, MA' }
  ];

  console.log(`\n--- TESTING ${methods.length} DISCOVERY METHODS ---`);

  const results = [];

  for (const m of methods) {
    console.log(`\n======================================================`);
    console.log(`TESTING METHOD: [${m.id}] (${m.niche} in ${m.city})`);
    console.log(`======================================================`);

    const start = Date.now();
    try {
      const res = await fetchWithCookie(`${BASE_URL}/api/scrape`, {
        method: 'POST',
        body: JSON.stringify({
          technique: m.id,
          niches: [m.niche],
          cities: [m.city],
          count: 2
        })
      }, cookie);

      const duration = ((Date.now() - start) / 1000).toFixed(1);
      const data = await res.json();

      if (!data.success || !data.leads || data.leads.length === 0) {
        console.log(`❌ Method ${m.id} returned no leads or error:`, data.error || 'Empty results');
        results.push({ id: m.id, status: 'FAILED', error: data.error || 'No leads returned' });
        continue;
      }

      console.log(`✓ Scrape API responded in ${duration}s. Returned ${data.leads.length} leads.`);
      const methodVerification = { id: m.id, leadsVerified: [] };

      for (let i = 0; i < Math.min(2, data.leads.length); i++) {
        const lead = data.leads[i];
        console.log(`\n--- Lead #${i + 1}: ${lead.businessName} ---`);
        console.log(`  - Category: ${lead.category || m.niche}`);
        console.log(`  - Location: ${lead.city}`);
        console.log(`  - Phone: ${lead.phoneNumber || 'None'}`);
        console.log(`  - Email: ${lead.contactEmail || 'None'}`);
        console.log(`  - Website: ${lead.websiteUrl || 'None'}`);
        console.log(`  - Source URL: ${lead.sourceUrl || 'None'}`);
        console.log(`  - Issues Detected: ${(lead.detectedIssues || []).length} issues`);

        // 1. Verify Website live
        console.log(`  🔍 Visiting website to verify live status...`);
        const webCheck = await checkWebsite(lead.websiteUrl);
        if (webCheck.ok) {
          console.log(`  ✅ Website verified! Status: ${webCheck.status}, Title: "${webCheck.title}"`);
        } else {
          console.log(`  ⚠️ Website check note: ${webCheck.error || ('Status ' + webCheck.status)}`);
        }

        // 2. Verify Source / Profile URL
        console.log(`  🔍 Checking channel profile URL...`);
        const srcCheck = await checkSourceUrl(lead.sourceUrl);
        if (srcCheck.ok) {
          console.log(`  ✅ Source URL verified live (Status: ${srcCheck.status})`);
        } else {
          console.log(`  ⚠️ Source URL check note: ${srcCheck.error || ('Status ' + srcCheck.status)}`);
        }

        // 3. Email Check
        const hasValidEmailFormat = Boolean(lead.contactEmail && lead.contactEmail.includes('@') && lead.contactEmail.includes('.'));
        console.log(`  ${hasValidEmailFormat ? '✅' : '❌'} Email Format: ${lead.contactEmail} (${hasValidEmailFormat ? 'Valid Format' : 'Invalid'})`);

        // 4. Phone Check
        const hasPhone = Boolean(lead.phoneNumber && lead.phoneNumber.length >= 7);
        console.log(`  ${hasPhone ? '✅' : '❌'} Phone: ${lead.phoneNumber} (${hasPhone ? 'Present' : 'Missing'})`);

        methodVerification.leadsVerified.push({
          name: lead.businessName,
          website: lead.websiteUrl,
          webOk: webCheck.ok,
          webTitle: webCheck.title,
          phone: lead.phoneNumber,
          email: lead.contactEmail,
          emailOk: hasValidEmailFormat,
          sourceUrl: lead.sourceUrl,
          sourceOk: srcCheck.ok
        });
      }

      results.push({ id: m.id, status: 'PASSED', data: methodVerification });

    } catch (err) {
      console.log(`❌ Error testing ${m.id}:`, err.message);
      results.push({ id: m.id, status: 'ERROR', error: err.message });
    }
  }

  console.log('\n======================================================');
  console.log('SUMMARY OF ALL VERIFICATIONS');
  console.log('======================================================');
  console.table(results.map(r => ({
    Method: r.id,
    Status: r.status,
    LeadsVerified: r.data?.leadsVerified?.length || 0,
    WebsitesOk: r.data?.leadsVerified?.filter(l => l.webOk).length || 0,
    EmailsOk: r.data?.leadsVerified?.filter(l => l.emailOk).length || 0
  })));
}

main().catch(console.error);
