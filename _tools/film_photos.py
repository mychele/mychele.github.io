#!/usr/bin/env python3
"""Build web versions of the film photos and the data file behind /film/.

Originals live in assets/img/film-photos/ (black-and-white at the top level,
color in color/). They are large lab scans and TIFFs, so they are ignored by
git and excluded from the Jekyll build. This script writes, for each photo:

    assets/img/film/<name>-600.webp    grid thumbnail
    assets/img/film/<name>-1200.webp   grid thumbnail for high-density screens
    assets/img/film/<name>-2000.webp   full view in the lightbox

and rewrites _data/film_photos.json, newest first. Names are
<YYYY-MM-DD>-<bw|color>-<NN>, dated by the scan date in the lab's EXIF data,
falling back to a date in the filename, then to the file's modified time.
Existing names are kept for photos already in the data file, so URLs stay
stable when new rolls are added. Add a "caption" to any entry by hand; the
script preserves it.

Usage: python3 _tools/film_photos.py [--force]
"""
import datetime
import glob
import io
import json
import os
import re
import sys
import warnings

from PIL import Image, ImageCms, ImageOps

warnings.filterwarnings("ignore")
Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets/img/film-photos")
OUT = os.path.join(ROOT, "assets/img/film")
DATA = os.path.join(ROOT, "_data/film_photos.json")
SIZES = {600: 74, 1200: 74, 2000: 82}  # long edge in px: WebP quality
EXTS = (".jpg", ".jpeg", ".tif", ".tiff", ".png")


def load(path):
    im = Image.open(path)
    if im.mode in ("I;16", "I;16B", "I;16L", "I"):
        im = im.point(lambda x: x * (1 / 256)).convert("L")
    im = ImageOps.exif_transpose(im)
    icc = im.info.get("icc_profile")
    if icc and im.mode in ("RGB", "RGBA"):
        # Browsers treat untagged WebP as sRGB, so convert other profiles (e.g. Adobe RGB)
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        im = ImageCms.profileToProfile(im, src, ImageCms.createProfile("sRGB"), outputMode="RGB")
    return im.convert("RGB")


def photo_date(path):
    try:
        exif = Image.open(path).getexif()
        for value in (exif.get_ifd(0x8769).get(36867), exif.get(306)):
            if value and value.strip(": "):
                return datetime.datetime.strptime(value.strip()[:19], "%Y:%m:%d %H:%M:%S")
    except Exception:
        pass
    m = re.search(r"(20\d\d)(\d\d)(\d\d)_?(\d{6})?", os.path.basename(path))
    if m:
        t = m.group(4) or "000000"
        return datetime.datetime.strptime(m.group(1) + m.group(2) + m.group(3) + t, "%Y%m%d%H%M%S")
    return datetime.datetime.fromtimestamp(os.path.getmtime(path))


def main(force):
    os.makedirs(OUT, exist_ok=True)
    old = {}
    if os.path.exists(DATA):
        for e in json.load(open(DATA)):
            old[e["source"]] = e

    sources = []
    for path in glob.glob(os.path.join(SRC, "**", "*"), recursive=True):
        if os.path.isfile(path) and path.lower().endswith(EXTS):
            rel = os.path.relpath(path, SRC)
            kind = "color" if rel.split(os.sep)[0] == "color" else "bw"
            sources.append((photo_date(path), rel, kind, path))
    sources.sort()

    used = {e["name"] for e in old.values()}
    counters = {}
    entries = []
    for when, rel, kind, path in sources:
        prev = old.get(rel)
        if prev:
            name = prev["name"]
        else:
            day = when.strftime("%Y-%m-%d")
            n = counters.get((day, kind), 0)
            while True:
                n += 1
                name = "%s-%s-%02d" % (day, kind, n)
                if name not in used:
                    break
            counters[(day, kind)] = n
            used.add(name)

        targets = {s: os.path.join(OUT, "%s-%d.webp" % (name, s)) for s in SIZES}
        im = None
        if force or not all(os.path.exists(t) for t in targets.values()):
            im = load(path)
            for size, quality in SIZES.items():
                copy = im.copy()
                copy.thumbnail((size, size), Image.LANCZOS)
                copy.save(targets[size], "WEBP", quality=quality, method=6)
            print("built", name, "from", rel)
        with Image.open(targets[2000]) as full:
            w, h = full.size

        entry = {"name": name, "date": when.strftime("%Y-%m-%d"), "type": kind,
                 "width": w, "height": h, "source": rel}
        if prev and prev.get("caption"):
            entry["caption"] = prev["caption"]
        entries.append(entry)

    entries.sort(key=lambda e: e["name"], reverse=True)
    with open(DATA, "w") as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
        f.write("\n")

    keep = {"%s-%d.webp" % (e["name"], s) for e in entries for s in SIZES}
    for stale in set(os.listdir(OUT)) - keep:
        if stale.endswith(".webp"):
            os.remove(os.path.join(OUT, stale))
            print("removed", stale)
    print(len(entries), "photos")


if __name__ == "__main__":
    main("--force" in sys.argv)
