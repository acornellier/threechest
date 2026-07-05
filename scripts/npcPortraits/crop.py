#!/usr/bin/env python3
"""
Slice the in-game screenshot grid into per-NPC portraits.

Reads manifest.json (written by generate.py) for the tile order + layout, finds
the newest screenshot(s) in your WoW Screenshots folder, extracts each portrait,
and writes public/npc_portraits/<npcId>.png (64x64, opaque, creature-on-black --
identical in format to the existing portraits; the app clips them to a circle).

Robust to +/- a couple pixels of tile jitter: each tile sits on a black backdrop
with an 8px gap, and we recenter on the portrait's non-black bounding box rather
than trusting the nominal grid position.

Requires Pillow:  pip install Pillow

Usage:
  python3 crop.py                          # auto-detect Screenshots folder
  python3 crop.py --screenshots "/path"    # point at the folder explicitly
  python3 crop.py --out "/path"            # write portraits somewhere else
  python3 crop.py --dry-run                # report what it would do, write nothing
"""

import json
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  pip install Pillow")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
PORTRAITS_DIR = os.path.join(REPO_ROOT, "public", "npc_portraits")
MANIFEST_PATH = os.path.join(SCRIPT_DIR, "manifest.json")

IMAGE_EXTS = (".tga", ".png", ".jpg", ".jpeg", ".bmp")
BLACK_THRESHOLD = 18  # luminance above this counts as "portrait", not backdrop


def find_screenshots_dir(override):
    if override:
        if not os.path.isdir(override):
            sys.exit(f"--screenshots folder does not exist: {override}")
        return override
    bases = [
        "/Applications/World of Warcraft",
        os.path.expanduser("~/Applications/World of Warcraft"),
        "C:/Program Files (x86)/World of Warcraft",
        "C:/Program Files/World of Warcraft",
    ]
    products = ["_ptr_", "_xptr_", "_beta_", "_retail_"]  # PTR first: new-season work
    for base in bases:
        for product in products:
            path = os.path.join(base, product, "Screenshots")
            if os.path.isdir(path):
                return path
    sys.exit(
        "Could not auto-detect a WoW Screenshots folder. Pass it explicitly:\n"
        "  python3 crop.py --screenshots \"/Applications/World of Warcraft/_ptr_/Screenshots\""
    )


def grid_origin(img):
    """Top-left pixel of the portrait grid.

    The screenshot is all black except the grid, so the bounding box of non-black
    content starts at the grid's top-left. This makes cropping immune to UIParent
    being inset from the physical screen (which shifts the whole grid).
    """
    mask = img.convert("L").point(lambda p: 255 if p > BLACK_THRESHOLD else 0)
    bbox = mask.getbbox()
    return (bbox[0], bbox[1]) if bbox else (0, 0)


def newest_screenshots(folder, count):
    files = [
        os.path.join(folder, f)
        for f in os.listdir(folder)
        if f.lower().endswith(IMAGE_EXTS)
    ]
    if len(files) < count:
        sys.exit(
            f"Need {count} screenshot(s) but only found {len(files)} in {folder}.\n"
            f"Did the in-game script finish taking all its screenshots?"
        )
    files.sort(key=os.path.getmtime)          # oldest -> newest
    batch = files[-count:]                     # the most recent `count`
    return batch                              # already oldest-first within the batch


def extract_portrait(cell, size):
    """Recenter a fixed size x size window on the portrait inside a tile crop.

    The rendered portrait is always exactly `size` px; only its position drifts
    (tile jitter). So we find the non-black bounding box, take its geometric
    center, and crop a `size`-px window around it. We never crop to the bbox
    extent (that would zoom in on dark creatures whose edges fall below the
    threshold) -- we only translate.
    """
    cw, ch = cell.size
    mask = cell.convert("L").point(lambda p: 255 if p > BLACK_THRESHOLD else 0)
    bbox = mask.getbbox()
    if bbox:
        cx = (bbox[0] + bbox[2]) / 2.0
        cy = (bbox[1] + bbox[3]) / 2.0
    else:
        # Nothing bright found; fall back to the nominal top-left placement.
        cx = cy = size / 2.0

    left = int(round(cx - size / 2.0))
    top = int(round(cy - size / 2.0))
    left = max(0, min(left, cw - size)) if cw >= size else 0
    top = max(0, min(top, ch - size)) if ch >= size else 0

    crop = cell.crop((left, top, left + size, top + size)).convert("RGB")
    if crop.size != (size, size):  # only if the cell was smaller than a portrait
        crop = crop.resize((size, size), Image.LANCZOS)
    return crop


def main():
    argv = sys.argv[1:]
    dry_run = "--dry-run" in argv
    override = None
    if "--screenshots" in argv:
        i = argv.index("--screenshots")
        override = argv[i + 1] if i + 1 < len(argv) else None
    out_dir = PORTRAITS_DIR
    if "--out" in argv:
        i = argv.index("--out")
        out_dir = argv[i + 1] if i + 1 < len(argv) else out_dir

    if not os.path.isfile(MANIFEST_PATH):
        sys.exit("manifest.json not found - run generate.py first.")
    manifest = json.load(open(MANIFEST_PATH, encoding="utf-8"))
    portraits = manifest["portraits"]
    size = manifest["portraitSize"]
    cell_size = size + manifest["gap"]
    max_tiles = manifest["maxTiles"]

    folder = find_screenshots_dir(override)

    # Peek at the newest image to get the resolution, then derive the grid the
    # same way the in-game script did (floor(res / cellSize), capped at maxTiles).
    newest = max(
        (os.path.join(folder, f) for f in os.listdir(folder)
         if f.lower().endswith(IMAGE_EXTS)),
        key=os.path.getmtime, default=None,
    )
    if newest is None:
        sys.exit(f"No screenshots found in {folder}")
    with Image.open(newest) as im:
        res_x, res_y = im.size
    tiles_x = res_x // cell_size
    tiles_y = res_y // cell_size
    per_shot = min(max_tiles, tiles_x * tiles_y)
    num_shots = -(-len(portraits) // per_shot)

    print(f"Screenshots : {folder}")
    print(f"Resolution  : {res_x}x{res_y}  ->  grid {tiles_x}x{tiles_y}, "
          f"{per_shot}/screenshot")
    print(f"Portraits   : {len(portraits)}  ->  {num_shots} screenshot(s)")

    batch = newest_screenshots(folder, num_shots)
    print("Using screenshots (oldest->newest):")
    for p in batch:
        print(f"  {os.path.basename(p)}")

    if not dry_run:
        os.makedirs(out_dir, exist_ok=True)

    images = {}
    origins = {}
    written = 0
    for index, entry in enumerate(portraits):
        shot_index = index // per_shot
        tile_index = index % per_shot
        col = tile_index % tiles_x
        row = tile_index // tiles_x

        path = batch[shot_index]
        if path not in images:
            images[path] = Image.open(path).convert("RGB")
            origins[path] = grid_origin(images[path])
        img = images[path]
        ox, oy = origins[path]

        left, top = ox + col * cell_size, oy + row * cell_size
        cell = img.crop((left, top, left + cell_size, top + cell_size))
        portrait = extract_portrait(cell, size)

        out_path = os.path.join(out_dir, f"{entry['npcId']}.png")
        if dry_run:
            print(f"  [{index:3}] shot{shot_index} r{row}c{col} -> "
                  f"{entry['npcId']}.png ({entry['name']})")
        else:
            portrait.save(out_path, "PNG")
            written += 1

    if dry_run:
        print("\nDry run - nothing written.")
    else:
        print(f"\nWrote {written} portraits to {out_dir}")


if __name__ == "__main__":
    main()
