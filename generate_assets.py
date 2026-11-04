#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/Users/uchitchakma/Documents/ProgrammingProjects/myLeads/public"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. WRITE SVG LOGO ICON
logo_icon_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5A4F" />
      <stop offset="50%" stop-color="#C5453E" />
      <stop offset="100%" stop-color="#8F2520" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F2D6D4" />
    </linearGradient>
    <linearGradient id="flameGlow" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF9B38" />
      <stop offset="100%" stop-color="#FFD166" />
    </linearGradient>
    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#C5453E" flood-opacity="0.38" />
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background Squircle Container -->
  <rect x="10" y="10" width="100" height="100" rx="28" fill="url(#primaryGrad)" filter="url(#badgeShadow)" />

  <!-- Inner Soft Bevel Stroke -->
  <rect x="11" y="11" width="98" height="98" rx="27" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" />

  <!-- Geometric Modern Emblem: Interlocking M + L + Growth Flame Vector -->
  <g transform="translate(60, 60)">
    <!-- Radar Target Pulse Rings (Subtle tech overlay) -->
    <circle cx="0" cy="0" r="32" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="3,3" />
    <circle cx="0" cy="0" r="22" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1" />

    <!-- Center Monogram Rocket / Growth Arrow Icon -->
    <!-- Left Leg of 'M' -->
    <path d="M-22, 18 L-22, -8 C-22, -14 -16, -17 -11, -12 L0, -2 L11, -12 C16, -17 22, -14 22, -8 L22, 18 C22, 21 19, 23 16, 23 C13, 23 10, 21 10, 18 L10, -1 L3, 6 C1, 8 -1, 8 -3, 6 L-10, -1 L-10, 18 C-10, 21 -13, 23 -16, 23 C-19, 23 -22, 21 -22, 18 Z" 
          fill="url(#accentGrad)" />

    <!-- Dynamic Central Lead Core / Flame Spike (in Amber Glow) -->
    <path d="M-6, 12 C-6, 6 0, -18 0, -22 C0, -18 6, 6 6, 12 C6, 16 3, 19 0, 19 C-3, 19 -6, 16 -6, 12 Z" 
          fill="url(#flameGlow)" />
          
    <!-- Upward Spark Dot -->
    <circle cx="0" cy="-26" r="2.8" fill="#FFFFFF" />
  </g>
</svg>
"""

with open(os.path.join(OUTPUT_DIR, "logo-icon.svg"), "w") as f:
    f.write(logo_icon_svg)
print("✓ Created public/logo-icon.svg")

# 2. WRITE SVG FAVICON
favicon_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5A4F" />
      <stop offset="100%" stop-color="#C5453E" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#favGrad)" />
  <!-- Crisp Center Emblem -->
  <path d="M6,24 L6,14 C6,11 8,9 11,11 L16,15 L21,11 C24,9 26,11 26,14 L26,24 L22,24 L22,16 L18,19 C17,20 15,20 14,19 L10,16 L10,24 Z" fill="#FFFFFF" />
  <path d="M14,21 C14,17 16,7 16,5 C16,7 18,17 18,21 C18,23 17,24 16,24 C15,24 14,23 14,21 Z" fill="#FFD166" />
</svg>"""

with open(os.path.join(OUTPUT_DIR, "favicon.svg"), "w") as f:
    f.write(favicon_svg)
print("✓ Created public/favicon.svg")

# 3. WRITE FULL HORIZONTAL LOGO SVG
full_logo_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 76" width="100%" height="100%">
  <defs>
    <linearGradient id="logoPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5A4F" />
      <stop offset="50%" stop-color="#C5453E" />
      <stop offset="100%" stop-color="#9E2A24" />
    </linearGradient>
    <linearGradient id="flameAccent" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF9B38" />
      <stop offset="100%" stop-color="#FFD166" />
    </linearGradient>
    <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#C5453E" flood-opacity="0.32" />
    </filter>
  </defs>

  <!-- Left Icon Mark -->
  <g transform="translate(6, 6)">
    <rect x="0" y="0" width="64" height="64" rx="18" fill="url(#logoPrimary)" filter="url(#logoShadow)" />
    <rect x="0.5" y="0.5" width="63" height="63" rx="17.5" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1" />
    
    <!-- Inner Emblem -->
    <g transform="translate(32, 32) scale(0.64)">
      <circle cx="0" cy="0" r="32" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="3,3" />
      <path d="M-22, 18 L-22, -8 C-22, -14 -16, -17 -11, -12 L0, -2 L11, -12 C16, -17 22, -14 22, -8 L22, 18 C22, 21 19, 23 16, 23 C13, 23 10, 21 10, 18 L10, -1 L3, 6 C1, 8 -1, 8 -3, 6 L-10, -1 L-10, 18 C-10, 21 -13, 23 -16, 23 C-19, 23 -22, 21 -22, 18 Z" fill="#FFFFFF" />
      <path d="M-6, 12 C-6, 6 0, -18 0, -22 C0, -18 6, 6 6, 12 C6, 16 3, 19 0, 19 C-3, 19 -6, 16 -6, 12 Z" fill="url(#flameAccent)" />
      <circle cx="0" cy="-26" r="2.8" fill="#FFFFFF" />
    </g>
  </g>

  <!-- Right Typography -->
  <g transform="translate(86, 14)">
    <!-- "my" text (clean grey/white depending on theme) -->
    <text x="0" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="34" font-weight="600" fill="#FFFFFF" letter-spacing="-0.5">my</text>
    
    <!-- "Leads" text (brand crimson with subtle glow) -->
    <text x="44" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="34" font-weight="800" fill="#E2584F" letter-spacing="-0.5">Leads</text>
    
    <!-- PRO Pill Badge -->
    <g transform="translate(142, 11)">
      <rect x="0" y="0" width="38" height="19" rx="5" fill="#C5453E" fill-opacity="0.18" stroke="#C5453E" stroke-opacity="0.4" stroke-width="1" />
      <text x="19" y="14" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10.5" font-weight="700" fill="#E2584F" text-anchor="middle" letter-spacing="0.5">PRO</text>
    </g>

    <!-- Subtitle: "AUTONOMOUS CLIENT ENGINE" -->
    <text x="1" y="49" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="9" font-weight="600" fill="#9BA3AF" letter-spacing="1.8">AUTONOMOUS CLIENT ENGINE</text>
  </g>
</svg>
"""

with open(os.path.join(OUTPUT_DIR, "logo.svg"), "w") as f:
    f.write(full_logo_svg)
print("✓ Created public/logo.svg")

# 4. RENDER PNG ASSETS VIA PILLOW
def draw_rounded_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale helper
    s = size / 120.0
    
    # Draw soft shadow
    shadow_margin = int(4 * s)
    radius = int(28 * s)
    
    # Background gradient approximation
    # Draw rounded rectangle with #C5453E
    box = [int(10 * s), int(10 * s), int(110 * s), int(110 * s)]
    
    # Draw squircle
    draw.rounded_rectangle(box, radius=radius, fill=(197, 69, 62, 255))
    
    # Draw subtle top-left highlight
    inner_box = [int(11 * s), int(11 * s), int(109 * s), int(109 * s)]
    draw.rounded_rectangle(inner_box, radius=radius-1, outline=(255, 255, 255, 60), width=max(1, int(1.5 * s)))
    
    # Center emblem
    cx, cy = size // 2, size // 2
    
    # Pulse rings
    r32 = int(32 * s)
    draw.ellipse([cx - r32, cy - r32, cx + r32, cy + r32], outline=(255, 255, 255, 30), width=max(1, int(s)))
    r22 = int(22 * s)
    draw.ellipse([cx - r22, cy - r22, cx + r22, cy + r22], outline=(255, 255, 255, 45), width=max(1, int(s)))
    
    # Draw M shape
    # Coordinates in 120 base
    m_pts = [
        (-22, 18), (-22, -8), (-11, -12), (0, -2), (11, -12), (22, -8),
        (22, 18), (14, 18), (14, 0), (0, 14), (-14, 0), (-14, 18)
    ]
    scaled_m = [(int(cx + x * s), int(cy + y * s)) for x, y in m_pts]
    draw.polygon(scaled_m, fill=(255, 255, 255, 255))
    
    # Draw central amber core
    flame_pts = [
        (-5, 10), (-3, 0), (0, -22), (3, 0), (5, 10), (0, 14)
    ]
    scaled_flame = [(int(cx + x * s), int(cy + y * s)) for x, y in flame_pts]
    draw.polygon(scaled_flame, fill=(255, 209, 102, 255))
    
    # Top dot
    dot_r = int(2.8 * s)
    dot_y = int(cy - 26 * s)
    draw.ellipse([cx - dot_r, dot_y - dot_r, cx + dot_r, dot_y + dot_r], fill=(255, 255, 255, 255))
    
    return img

# Generate 512x512 icon.png
icon512 = draw_rounded_icon(512)
icon512.save(os.path.join(OUTPUT_DIR, "icon.png"), "PNG")
print("✓ Created public/icon.png (512x512)")

# Generate 180x180 apple-touch-icon.png
icon180 = draw_rounded_icon(180)
icon180.save(os.path.join(OUTPUT_DIR, "apple-touch-icon.png"), "PNG")
print("✓ Created public/apple-touch-icon.png (180x180)")

# Generate multi-size favicon.ico
fav16 = draw_rounded_icon(16)
fav32 = draw_rounded_icon(32)
fav48 = draw_rounded_icon(48)
fav48.save(os.path.join(OUTPUT_DIR, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("✓ Created public/favicon.ico")

# 5. GENERATE HIGH-IMPACT OPEN GRAPH SOCIAL SHARE IMAGE (1200x630)
def generate_og_image():
    W, H = 1200, 630
    og = Image.new("RGBA", (W, H), (8, 12, 20, 255)) # Dark navy background
    draw = ImageDraw.Draw(og)
    
    # Background subtle glowing radial mesh
    # Red-coral glow at top-right
    for r in range(400, 0, -20):
        alpha = int(35 * (1 - r / 400.0))
        draw.ellipse([W - 350 - r, -100 - r, W - 350 + r, -100 + r], fill=(197, 69, 62, alpha))
        
    # Blue/slate glow at bottom-left
    for r in range(350, 0, -20):
        alpha = int(25 * (1 - r / 350.0))
        draw.ellipse([-50 - r, H - 50 - r, -50 + r, H - 50 + r], fill=(30, 58, 138, alpha))
        
    # Grid lines / tech texture
    for x in range(0, W, 60):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 8), width=1)
    for y in range(0, H, 60):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, 8), width=1)
        
    # Card container in glassmorphism
    card_x0, card_y0 = 60, 50
    card_x1, card_y1 = W - 60, H - 50
    draw.rounded_rectangle([card_x0, card_y0, card_x1, card_y1], radius=28, fill=(15, 22, 36, 210), outline=(255, 255, 255, 28), width=1)
    
    # Top Tag: "AUTONOMOUS CLIENT ENGINE"
    draw.rounded_rectangle([110, 95, 335, 128], radius=8, fill=(197, 69, 62, 35), outline=(197, 69, 62, 90), width=1)
    
    # Load fonts
    font_bold_path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    font_reg_path = "/System/Library/Fonts/Supplemental/Arial.ttf"
    
    font_tag = ImageFont.truetype(font_bold_path, 13)
    font_title = ImageFont.truetype(font_bold_path, 54)
    font_sub = ImageFont.truetype(font_reg_path, 22)
    font_badge = ImageFont.truetype(font_bold_path, 14)
    font_footer = ImageFont.truetype(font_reg_path, 15)

    draw.text((125, 103), "⚡ AUTONOMOUS B2B HARVESTER", fill=(255, 110, 102), font=font_tag)

    # Big Logo & Title
    # Paste logo icon
    icon120 = draw_rounded_icon(110)
    og.paste(icon120, (110, 150), icon120)
    
    # Headline text
    draw.text((245, 152), "my", fill=(255, 255, 255), font=font_title)
    draw.text((325, 152), "Leads", fill=(226, 88, 79), font=font_title)
    draw.rounded_rectangle([485, 162, 542, 194], radius=6, fill=(197, 69, 62, 45), outline=(197, 69, 62, 120), width=1)
    draw.text((497, 168), "PRO", fill=(255, 130, 120), font=ImageFont.truetype(font_bold_path, 16))
    
    # Subheading
    draw.text((248, 222), "Find, Audit & Cold Outreach High-Ticket Clients Daily", fill=(203, 213, 225), font=font_sub)
    
    # Separator
    draw.line([(110, 290), (W - 110, 290)], fill=(255, 255, 255, 24), width=1)
    
    # Feature Pills Grid
    features = [
        ("📢 Meta & Google Ad Spenders", (239, 68, 68)),
        ("🔨 High-Ticket Contractors ($10k+)", (245, 158, 11)),
        ("🛍️ Shopify & DTC Stores", (16, 185, 129)),
        ("⭐ Reputation & Low-Rating Targets", (244, 63, 94)),
        ("🏢 Brand New Entity Filings", (59, 130, 246)),
        ("✉️ Automated 1-Click Cold Email", (168, 85, 247))
    ]
    
    col_w = 460
    start_x = 110
    start_y = 315
    for idx, (feat, color) in enumerate(features):
        col = idx % 2
        row = idx // 2
        px = start_x + (col * (col_w + 30))
        py = start_y + (row * 50)
        
        # Pill box
        draw.rounded_rectangle([px, py, px + col_w, py + 40], radius=10, fill=(24, 34, 53, 220), outline=(255, 255, 255, 20), width=1)
        draw.text((px + 16, py + 11), feat, fill=(241, 245, 249), font=font_badge)
        
    # Footer Info Bar
    draw.text((112, 535), "🌐 myleads.ucdreams.com", fill=(255, 255, 255, 180), font=font_footer)
    draw.text((W - 460, 535), "100% Free Public Data • Zero Paid API Required", fill=(148, 163, 184), font=font_footer)
    
    og.save(os.path.join(OUTPUT_DIR, "og-image.png"), "PNG")
    print("✓ Created public/og-image.png (1200x630)")

generate_og_image()
print("🎉 ALL BRAND ASSETS SUCCESSFULLY GENERATED!")
