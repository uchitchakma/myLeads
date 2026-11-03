import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { runTechnique1Harvester } from "@/lib/scraper";
import { harvestGoogleMapsLeads } from "@/lib/google_maps_scraper";
import { harvestLinkedInLeads } from "@/lib/linkedin_xray_scraper";
import { harvestHiringLeads } from "@/lib/hiring_signals_scraper";
import { harvestYellowPagesLeads } from "@/lib/yellowpages_scraper";
import { harvestMetaWhatsAppLeads } from "@/lib/meta_whatsapp_scraper";
import { harvestClutchLeads } from "@/lib/clutch_scraper";
import { harvestBBBLeads } from "@/lib/bbb_scraper";
import { harvestYelpLeads } from "@/lib/yelp_scraper";
import { harvestAdSpendersLeads } from "@/lib/ad_spenders_scraper";
import { harvestContractorLeads } from "@/lib/contractors_scraper";
import { harvestShopifyLeads } from "@/lib/shopify_scraper";
import { harvestReputationLeads } from "@/lib/reputation_scraper";
import { harvestNewBusinessLeads } from "@/lib/new_business_scraper";
import { auditDomainDeliverability } from "@/lib/dns_deliverability";
import { createOrUpdateLead, findUserById } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = findUserById(session.userId);
    const body = await req.json();
    const { niche, niches, city, count, technique, campaign } = body;

    // Normalize niches to an array of trimmed strings
    let targetNiches: string[] = [];
    if (niches && Array.isArray(niches) && niches.length > 0) {
      targetNiches = niches.map((n: string) => n.trim()).filter(Boolean);
    } else if (niche && typeof niche === "string") {
      targetNiches = niche.split(",").map(n => n.trim()).filter(Boolean);
    }

    // Normalize cities to an array of trimmed strings
    let targetCities: string[] = [];
    if (body.cities && Array.isArray(body.cities) && body.cities.length > 0) {
      targetCities = body.cities.map((c: string) => c.trim()).filter(Boolean);
    } else if (city && typeof city === "string") {
      targetCities = city.split(",").map(c => c.trim()).filter(Boolean);
    }

    if (targetNiches.length === 0 || targetCities.length === 0) {
      return NextResponse.json({ error: "At least one Niche and a City are required." }, { status: 400 });
    }

    // Parse requested sources list
    const defaultSources = [
      "NEW_BUSINESS_REGISTRATIONS",
      "LOW_RATING_REPUTATION",
      "SHOPIFY_ECOMMERCE",
      "HIGH_TICKET_CONTRACTORS",
      "AD_SPENDERS",
      "GOOGLE_MAPS",
      "LINKEDIN_XRAY",
      "HIRING_SIGNALS",
      "YELLOW_PAGES",
      "META_WHATSAPP",
      "CLUTCH_B2B",
      "BBB_TRUST",
      "OPEN_STREET_MAP"
    ];

    let requestedSources: string[] = [];
    if (body.sources && Array.isArray(body.sources) && body.sources.length > 0) {
      requestedSources = body.sources;
    } else if (technique === "ALL_SOURCES") {
      requestedSources = defaultSources;
    } else if (technique) {
      requestedSources = [technique];
    } else {
      requestedSources = defaultSources;
    }

    const totalCombinations = targetNiches.length * targetCities.length;
    const perCombinationCount = Math.max(2, Math.ceil((count || 5) / totalCombinations));
    let allScrapedItems: any[] = [];

    for (const singleCity of targetCities) {
      for (const singleNiche of targetNiches) {
        const promises: Promise<any>[] = [];
        const sourceTags: string[] = [];

        if (requestedSources.includes("NEW_BUSINESS_REGISTRATIONS")) {
          promises.push(harvestNewBusinessLeads(singleNiche, singleCity, perCombinationCount, user?.googleMapsApiKey));
          sourceTags.push("NEW_BUSINESS_REGISTRATIONS");
        }
        if (requestedSources.includes("LOW_RATING_REPUTATION")) {
          promises.push(harvestReputationLeads(singleNiche, singleCity, perCombinationCount, user?.googleMapsApiKey));
          sourceTags.push("LOW_RATING_REPUTATION");
        }
        if (requestedSources.includes("SHOPIFY_ECOMMERCE")) {
          promises.push(harvestShopifyLeads(singleNiche, singleCity, perCombinationCount, user?.googleMapsApiKey));
          sourceTags.push("SHOPIFY_ECOMMERCE");
        }
        if (requestedSources.includes("HIGH_TICKET_CONTRACTORS")) {
          promises.push(harvestContractorLeads(singleNiche, singleCity, perCombinationCount, user?.googleMapsApiKey));
          sourceTags.push("HIGH_TICKET_CONTRACTORS");
        }
        if (requestedSources.includes("AD_SPENDERS")) {
          promises.push(harvestAdSpendersLeads(singleNiche, singleCity, perCombinationCount, user?.googleMapsApiKey));
          sourceTags.push("AD_SPENDERS");
        }
        if (requestedSources.includes("GOOGLE_MAPS")) {
          promises.push(harvestGoogleMapsLeads(singleNiche, singleCity, perCombinationCount, user?.googleMapsApiKey));
          sourceTags.push("GOOGLE_MAPS");
        }
        if (requestedSources.includes("LINKEDIN_XRAY")) {
          promises.push(harvestLinkedInLeads(singleNiche, singleCity, perCombinationCount));
          sourceTags.push("LINKEDIN_XRAY");
        }
        if (requestedSources.includes("HIRING_SIGNALS")) {
          promises.push(harvestHiringLeads(singleNiche, singleCity, perCombinationCount));
          sourceTags.push("HIRING_SIGNALS");
        }
        if (requestedSources.includes("YELLOW_PAGES")) {
          promises.push(harvestYellowPagesLeads(singleNiche, singleCity, perCombinationCount));
          sourceTags.push("YELLOW_PAGES");
        }
        if (requestedSources.includes("META_WHATSAPP")) {
          promises.push(harvestMetaWhatsAppLeads(singleNiche, singleCity, perCombinationCount));
          sourceTags.push("META_WHATSAPP");
        }
        if (requestedSources.includes("CLUTCH_B2B")) {
          promises.push(harvestClutchLeads(singleNiche, singleCity, perCombinationCount));
          sourceTags.push("CLUTCH_B2B");
        }
        if (requestedSources.includes("BBB_TRUST")) {
          promises.push(harvestBBBLeads(singleNiche, singleCity, perCombinationCount));
          sourceTags.push("BBB_TRUST");
        }
        if (requestedSources.includes("OPEN_STREET_MAP")) {
          promises.push(runTechnique1Harvester(singleNiche, singleCity, perCombinationCount));
          sourceTags.push("OPEN_STREET_MAP");
        }
        if (requestedSources.includes("YELP")) {
          promises.push(harvestYelpLeads(singleNiche, singleCity, perCombinationCount, user?.yelpApiKey));
          sourceTags.push("YELP");
        }

        const settledResults = await Promise.allSettled(promises);
        let scrapedForCombo: any[] = [];

        settledResults.forEach((res, idx) => {
          if (res.status === "fulfilled" && Array.isArray(res.value)) {
            const tag = sourceTags[idx] || "ALL_SOURCES";
            const tagged = res.value.map(item => ({
              ...item,
              sourceTechnique: tag,
              discoverySources: [tag]
            }));
            scrapedForCombo.push(...tagged);
          }
        });

        allScrapedItems.push(...scrapedForCombo);
      }
    }

    const leads = [];
    let newCount = 0;
    let duplicateCount = 0;

    for (const item of allScrapedItems) {
      // Run quick native DNS deliverability inspection
      let detectedIssues = Array.isArray(item.detectedIssues) ? [...item.detectedIssues] : [];
      if (item.websiteUrl) {
        try {
          const deliverability = await auditDomainDeliverability(item.websiteUrl);
          if (deliverability.isVulnerable) {
            detectedIssues.push(`Domain missing SPF/DMARC records (Client emails landing in spam)`);
          }
        } catch {
          // Ignore DNS errors
        }
      }

      const { lead, isDuplicate } = createOrUpdateLead({
        userId: session.userId,
        businessName: item.businessName,
        websiteUrl: item.websiteUrl,
        googleMapsUrl: item.googleMapsUrl,
        sourceUrl: item.sourceUrl,
        campaign: campaign || undefined,
        phoneNumber: item.phoneNumber,
        contactEmail: item.contactEmail,
        ownerName: item.ownerName,
        category: item.category,
        city: item.city,
        sourceTechnique: item.sourceTechnique || (requestedSources[0] || "ALL_SOURCES"),
        discoverySources: item.discoverySources || [item.sourceTechnique || (requestedSources[0] || "ALL_SOURCES")],
        status: "AUDITED",
        rating: (item as any).rating,
        reviewCount: (item as any).reviewCount,
        speedScore: item.speedScore,
        mobileFriendly: item.mobileFriendly,
        loadTime: item.loadTime,
        detectedIssues,
        aiPitch: item.aiPitch
      });

      if (isDuplicate) {
        duplicateCount++;
      } else {
        newCount++;
      }
      leads.push({ ...lead, isDuplicate });
    }

    return NextResponse.json({
      success: true,
      techniqueUsed: requestedSources.length > 1 ? "ALL_SOURCES" : (requestedSources[0] || "ALL_SOURCES"),
      hasUserApiKey: !!user?.googleMapsApiKey,
      totalHarvested: allScrapedItems.length,
      newLeadsSaved: newCount,
      duplicatesSkipped: duplicateCount,
      leads
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Scraping failed." }, { status: 500 });
  }
}
