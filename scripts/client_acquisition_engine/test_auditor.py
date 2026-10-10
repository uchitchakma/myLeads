#!/usr/bin/env python3
import sys
import json
from auditor import audit_website
from pitch_generator import generate_pitch

def run_test(target_url: str, business_name: str):
    print(f"==================================================")
    print(f"🔍 1. Running Live Google PageSpeed Audit for: {target_url}")
    print(f"==================================================")
    
    audit = audit_website(target_url, strategy="mobile")
    
    if not audit.get("success"):
        print(f"❌ Audit Failed: {audit.get('error')}")
        return

    scores = audit.get("scores", {})
    metrics = audit.get("metrics", {})
    
    print(f"\n📊 AUDIT RESULTS (Mobile):")
    print(f"  • Performance Score:  {scores.get('performance')}/100")
    print(f"  • SEO Score:          {scores.get('seo')}/100")
    print(f"  • Accessibility:      {scores.get('accessibility')}/100")
    print(f"  • Largest Contentful Paint (LCP): {metrics.get('largest_contentful_paint')}")
    print(f"  • First Contentful Paint (FCP):   {metrics.get('first_contentful_paint')}")
    print(f"  • Speed Index:                    {metrics.get('speed_index')}")
    print(f"  • Mobile Friendly:                {'✅ Yes' if audit.get('is_mobile_friendly') else '❌ No'}")
    
    issues = audit.get("detected_issues", [])
    if issues:
        print(f"\n⚠️ Bottlenecks Detected:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print(f"\n✅ No critical bottlenecks detected (Site is already well-optimized).")

    print(f"\n==================================================")
    print(f"✍️ 2. Generating High-Converting Outreach Pitch")
    print(f"==================================================")
    
    pitch = generate_pitch(business_name, audit, sender_name="Alex | Modern Web Architect")
    
    print(f"\n📧 EMAIL SUBJECT OPTIONS:")
    for i, subj in enumerate(pitch.get("email_subjects", []), 1):
        print(f"  [{i}] {subj}")
        
    print(f"\n✉️ EMAIL BODY:")
    print("-" * 50)
    print(pitch.get("email_body"))
    print("-" * 50)
    
    print(f"\n💬 WHATSAPP / SMS INTRO:")
    print("-" * 50)
    print(pitch.get("whatsapp_pitch"))
    print("-" * 50)

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "https://www.google.com"
    name = sys.argv[2] if len(sys.argv) > 2 else "Google"
    run_test(url, name)
