#!/usr/bin/env bash
#
# Import MDT dungeon map textures into threechest tiles.
#
# Replicates the GIMP ofn-tiles-mdt.py workflow headlessly:
#   1. Stitch each dungeon's 15x10 grid of 128px source PNGs into one 1920x1280 image
#   2. Re-cut that image into a 6x4 grid of 320x320 JPGs named "<col>_<row>.jpg"
#
# Source: MythicDungeonTools/Midnight/Textures/<MdtFolder>/1_<N>.png  (N = 1..150)
# Output: public/maps/<key>/<col>_<row>.jpg  (24 tiles)
#
# Requires ImageMagick (montage + magick).
# Re-run whenever the MDT submodule map textures change.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEX="$REPO/MythicDungeonTools/Midnight/Textures"
OUT="$REPO/public/maps"

# MDT texture folder -> threechest dungeon key (MDT short names, lowercased)
MAPPINGS=(
  "MurderRow:murd"
  "DenOfNalorakk:nalo"
  "TheBlindingVale:vale"
  "VoidscarArena:void"
  "AltarOfFangs:fang"
  "RubyLifePools:rlp"
  "TempleOfSethraliss:tos"
  "KingsRest:kr"
)

SRC_COLS=15; SRC_ROWS=10   # source grid
OUT_COLS=6;  OUT_ROWS=4    # output grid
TILE=320                   # output tile size (1920/6 = 1280/4 = 320)

# montage always probes a font (even with no labels) and exits 1 if none is
# found; point it at a real font so the harmless warning doesn't abort the run.
FONT="/System/Library/Fonts/Helvetica.ttc"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

for pair in "${MAPPINGS[@]}"; do
  folder="${pair%%:*}"
  key="${pair##*:}"
  src="$TEX/$folder"
  dst="$OUT/$key"

  if [ ! -d "$src" ]; then
    echo "SKIP $folder -> $key (source missing: $src)"
    continue
  fi

  echo "==> $folder -> $key"
  mkdir -p "$dst"

  # Stitch source tiles in numeric filename order (1_1 .. 1_150), row-major.
  stitched="$tmp/$key.png"
  ( cd "$src" && montage $(ls *.png | sort -t_ -k2 -n) -font "$FONT" \
      -tile "${SRC_COLS}x${SRC_ROWS}" -geometry 128x128+0+0 \
      -background none "$stitched" )

  # Re-cut into OUT_COLS x OUT_ROWS tiles named <col>_<row>.jpg
  for ((col=0; col<OUT_COLS; col++)); do
    for ((row=0; row<OUT_ROWS; row++)); do
      magick "$stitched" \
        -crop "${TILE}x${TILE}+$((col*TILE))+$((row*TILE))" +repage \
        -quality 92 "$dst/${col}_${row}.jpg"
    done
  done

  echo "    wrote $((OUT_COLS*OUT_ROWS)) tiles to public/maps/$key/"
done

echo "Done."
