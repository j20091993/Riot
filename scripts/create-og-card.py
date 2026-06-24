#!/usr/bin/env python3
"""Create og-card.png: 1200x630 transparent canvas with centered logo."""

from pathlib import Path

try:
    from PIL import Image
except ImportError:
    import subprocess
    import sys

    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "--user"])
    from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / "assets" / "logo.png"
OUT_PATH = ROOT / "assets" / "og-card.png"

logo = Image.open(LOGO_PATH).convert("RGBA")
canvas = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
logo.thumbnail((512, 512), Image.Resampling.LANCZOS)
x = (1200 - logo.width) // 2
y = (630 - logo.height) // 2
canvas.paste(logo, (x, y), logo)
canvas.save(OUT_PATH, "PNG")
print("OK", OUT_PATH)
print("dimensions:", canvas.size)