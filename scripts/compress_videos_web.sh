#!/usr/bin/env bash
set -euo pipefail

# Compress videos for web backgrounds without touching originals.
# Output keeps the same folder structure under videos-web/.
#
# Usage:
#   ./scripts/compress_videos_web.sh
#   ./scripts/compress_videos_web.sh /path/to/input /path/to/output

INPUT_DIR="${1:-/Users/charlesgrenier/Sites/charles-portfolio/videos}"
OUTPUT_DIR="${2:-/Users/charlesgrenier/Sites/charles-portfolio/videos-web}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found in PATH."
  exit 1
fi

if [[ ! -d "$INPUT_DIR" ]]; then
  echo "Input directory not found: $INPUT_DIR"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "Input : $INPUT_DIR"
echo "Output: $OUTPUT_DIR"
echo "Starting compression..."

find "$INPUT_DIR" -type f \( -iname '*.mp4' -o -iname '*.mov' -o -iname '*.m4v' -o -iname '*.webm' \) -print0 |
while IFS= read -r -d '' src; do
  rel="${src#"$INPUT_DIR"/}"
  out="${OUTPUT_DIR}/${rel%.*}.mp4"
  out_dir="$(dirname "$out")"
  mkdir -p "$out_dir"

  if [[ -f "$out" ]]; then
    echo "-> $rel (skip, already compressed)"
    continue
  fi

  echo "-> $rel"
  ffmpeg -nostdin -y -hide_banner -loglevel error -i "$src" \
    -map 0:v:0 \
    -an \
    -vf "scale='if(gte(iw,ih),min(iw,1280),-2)':'if(gte(iw,ih),-2,min(ih,1280))':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=24" \
    -c:v libx264 \
    -preset medium \
    -profile:v high \
    -level 4.1 \
    -pix_fmt yuv420p \
    -crf 27 \
    -maxrate 3M \
    -bufsize 6M \
    -movflags +faststart \
    "$out"
done

echo "Done."
