"""Trace the Sartorial Dhaka logo into SVG paths: one per letter, plus the tiger.

    pip install potracer numpy pillow
    python scripts/trace-logo.py assets/brand/sartorial-dhaka-logo.jpg src/components/brand/logo.generated.json

Every element is traced from the supplied logo itself (no fonts, no redrawn artwork)
and keeps its original position, so the assembled SVG reproduces the composition
exactly. Coordinates are source-image pixels, shifted so the logo's top-left is (0, 0).
Paths are written with relative commands at 0.1 px precision.
"""

import json
import sys

import numpy as np
import potrace
from PIL import Image, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]

im = Image.open(SRC).convert("L")
ink = np.asarray(im) < 128

ys, xs = np.nonzero(ink)
X0, X1, Y0, Y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1


def runs(flags):
    """[start, end) runs of truthy values."""
    out, start = [], None
    for i, v in enumerate(flags):
        if v and start is None:
            start = i
        if not v and start is not None:
            out.append((start, i))
            start = None
    if start is not None:
        out.append((start, len(flags)))
    return out


def fmt(v):
    s = f"{v:.1f}".rstrip("0").rstrip(".")
    if s in ("-0", ""):
        return "0"
    return s.replace("0.", ".", 1) if s.lstrip("-").startswith("0.") else s


def trace_box(x0, y0, x1, y1, *, scale, blur, tolerance, thin=None, turd=6, pad=4):
    """Trace the ink inside a box. Returns one relative-command path per contour."""
    bx0, by0 = x0 - pad, y0 - pad
    crop = im.crop((bx0, by0, x1 + pad, y1 + pad))
    if blur:
        crop = crop.filter(ImageFilter.GaussianBlur(blur))  # quiets JPEG ringing on the edges
    big = crop.resize((crop.width * scale, crop.height * scale), Image.BICUBIC)
    arr = np.asarray(big)
    if thin:
        # Fine lines (whiskers, fur) are thinner than a source pixel, so they only survive
        # as light greys. Find dark valleys narrower than ~2 source px (a black top-hat)
        # and keep those at a more permissive level; everything else stays at 50%.
        level, contrast = thin
        size = 2 * scale + 1
        closed = np.asarray(big.filter(ImageFilter.MaxFilter(size)).filter(ImageFilter.MinFilter(size))).astype(int)
        mask = (arr < 128) | ((arr < level) & (closed - arr.astype(int) > contrast))
        arr = np.where(mask, 0, 255).astype(np.uint8)
    path = potrace.Bitmap(arr, blacklevel=0.5).trace(turdsize=turd * scale * scale, alphamax=1.0, opticurve=True, opttolerance=tolerance)

    def absolute(pt):
        return (round(pt.x / scale + bx0 - X0, 1), round(pt.y / scale + by0 - Y0, 1))

    contours = []
    for curve in path:
        cur = absolute(curve.start_point)
        pts = [cur]
        d = [f"M{fmt(cur[0])} {fmt(cur[1])}"]

        def rel(p):
            return f"{fmt(p[0] - cur[0])} {fmt(p[1] - cur[1])}"

        for seg in curve.segments:
            if seg.is_corner:
                c, e = absolute(seg.c), absolute(seg.end_point)
                pts += [c, e]
                d.append(f"l{rel(c)}")
                cur = c
                d.append(f"l{rel(e)}")
                cur = e
            else:
                c1, c2, e = absolute(seg.c1), absolute(seg.c2), absolute(seg.end_point)
                pts.append(e)
                d.append(f"c{rel(c1)} {rel(c2)} {rel(e)}")
                cur = e
        d.append("z")
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        box = [round(min(xs), 1), round(min(ys), 1), round(max(xs) - min(xs), 1), round(max(ys) - min(ys), 1)]
        contours.append({"d": "".join(d).replace(" -", "-"), "box": box})
    return contours


def letters(band, chars):
    y0, y1 = band
    segs = runs(ink[y0:y1].sum(0) > 0)
    assert len(segs) == len(chars), (len(segs), chars)
    out = []
    for (x0, x1), ch in zip(segs, chars):
        rows = np.nonzero(ink[y0:y1, x0:x1].sum(1))[0]
        ly0, ly1 = y0 + int(rows.min()), y0 + int(rows.max()) + 1
        out.append({
            "char": ch,
            "d": "".join(c["d"] for c in trace_box(x0, ly0, x1, ly1, scale=3, blur=0.6, tolerance=0.4)),
            "box": [x0 - X0, ly0 - Y0, x1 - x0, ly1 - ly0],
        })
    return out


bands = runs(ink.sum(1) > 0)
assert len(bands) == 4, bands  # tiger head, tiger chin, SARTORIAL, DHAKA
tiger_band = (bands[0][0], bands[1][1])
tiger_cols = runs(ink[tiger_band[0]:tiger_band[1]].sum(0) > 0)
tx0, tx1 = tiger_cols[0][0], tiger_cols[-1][1]

data = {
    "source": {"width": im.width, "height": im.height, "origin": [X0, Y0]},
    "width": X1 - X0,
    "height": Y1 - Y0,
    "word": letters(bands[2], "SARTORIAL"),
    "city": letters(bands[3], "DHAKA"),
    "tiger": {
        "box": [tx0 - X0, tiger_band[0] - Y0, tx1 - tx0, tiger_band[1] - tiger_band[0]],
        "contours": trace_box(tx0, tiger_band[0], tx1, tiger_band[1], scale=5, blur=0.35, tolerance=0.3, thin=(185, 30), turd=2),
    },
}

with open(OUT, "w") as fh:
    json.dump(data, fh, separators=(",", ":"))

size = sum(len(l["d"]) for l in data["word"] + data["city"]) + sum(len(c["d"]) for c in data["tiger"]["contours"])
print(f"logo {data['width']}x{data['height']}, {len(data['tiger']['contours'])} tiger contours, {size / 1024:.1f} KB of path data")
