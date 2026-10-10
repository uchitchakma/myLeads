"""
AI Pitch Generator Module.
Transforms raw Google PageSpeed audit numbers into high-converting,
1-to-1 personalized cold email and WhatsApp/SMS pitches.
"""

import json
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional

def generate_pitch(
    business_name: str,
    audit_data: Dict[str, Any],
    sender_name: str = "Web Performance Specialist",
    gemini_api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates tailored email and WhatsApp pitches based on audit data.
    Uses Gemini AI if API key is provided, or uses proven high-converting direct response templates.
    """
    if not audit_data.get("success"):
        return {"error": "Cannot generate pitch for failed audit"}

    scores = audit_data.get("scores", {})
    metrics = audit_data.get("metrics", {})
    perf_score = scores.get("performance", 0)
    lcp = metrics.get("largest_contentful_paint", "N/A")
    speed_index = metrics.get("speed_index", "N/A")
    issues = audit_data.get("detected_issues", [])

    # If Gemini API key is available, generate dynamic AI copy
    if gemini_api_key:
        try:
            return _generate_with_gemini(business_name, audit_data, sender_name, gemini_api_key)
        except Exception as e:
            print(f"[Warning] Gemini API call failed ({e}), falling back to built-in high-converting template.")

    # High-converting Direct Response Template (Rule-based Fallback)
    issues_bullet_points = "\n".join([f"  • {issue}" for issue in issues[:3]]) or "  • Heavy assets delaying the main screen render on 4G/5G mobile networks"

    subject_options = [
        f"Quick note regarding {business_name}'s mobile site speed",
        f"Google speed score ({perf_score}/100) for {business_name}",
        f"3 quick website fixes for {business_name}"
    ]

    email_body = f"""Hi {business_name} team,

I was looking at your website ({audit_data.get('url')}) and ran a quick mobile performance audit using Google PageSpeed Insights.

Your current mobile speed score is {perf_score}/100 (taking ~{lcp} to fully load for mobile visitors). According to Google's data, pages taking over 3 seconds lose roughly 35-40% of potential inbound customers.

Here are the 2-3 main bottlenecks slowing it down right now:
{issues_bullet_points}

I specialize in building ultra-fast, modern websites that load in under 1.5 seconds and maximize local customer conversions.

Would you be open to a quick 2-minute video where I show you exactly how to fix these bottlenecks? No sales pressure at all—happy to share the findings either way.

Best regards,
{sender_name}
"""

    whatsapp_pitch = (
        f"Hi {business_name}! 👋 I noticed your website ({audit_data.get('url')}) has a mobile speed score of {perf_score}/100 "
        f"on Google's audit tool (loads in ~{lcp}). Fixing 2-3 image & code bottlenecks can cut your load time by half and get more customer call-ins. "
        f"Would you like me to send over a quick free breakdown?"
    )

    return {
        "business_name": business_name,
        "url": audit_data.get("url"),
        "performance_score": perf_score,
        "email_subjects": subject_options,
        "email_body": email_body,
        "whatsapp_pitch": whatsapp_pitch
    }

def _generate_with_gemini(
    business_name: str,
    audit_data: Dict[str, Any],
    sender_name: str,
    api_key: str
) -> Dict[str, Any]:
    """Calls Gemini API to generate hyper-personalized copy."""
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = f"""
    You are an expert cold email copywriter for a high-end web development and performance agency.
    Write a short, consultative, zero-fluff cold email and a WhatsApp message to {business_name}.
    
    Website Data:
    - URL: {audit_data.get('url')}
    - Google Mobile Performance Score: {audit_data.get('scores', {}).get('performance')}/100
    - Largest Contentful Paint (LCP): {audit_data.get('metrics', {}).get('largest_contentful_paint')}
    - Key Detected Bottlenecks: {json.dumps(audit_data.get('detected_issues', []))}
    - Sender Name: {sender_name}
    
    Requirements:
    1. Tone: Friendly, authoritative, respectful, helpful. Not spammy.
    2. Length: Under 120 words.
    3. Call to Action: Low friction (e.g. asking if they want a free 2-minute screen recording breakdown).
    4. Output strictly valid JSON with keys: 'email_subjects' (array of 3 strings), 'email_body' (string), 'whatsapp_pitch' (string).
    """

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        res_data = json.loads(resp.read().decode("utf-8"))
        candidate = res_data["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(candidate)
        parsed["business_name"] = business_name
        parsed["url"] = audit_data.get("url")
        parsed["performance_score"] = audit_data.get("scores", {}).get("performance")
        return parsed
