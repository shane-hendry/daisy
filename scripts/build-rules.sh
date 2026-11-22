#!/bin/sh
# Rebuild the rules script inside Daisy.nnwtheme/template.html from src/.
# The script sits between the "rules:begin" and "rules:end" markers and is
# src/rules.js (the content rules, shared with other themes) followed by
# src/update-notice.js (Daisy's own update notice). Then run scripts/build-sans.sh.
# Usage: scripts/build-rules.sh [--check]   (--check fails if the template is stale)
set -eu
cd "$(dirname "$0")/.."

template=Daisy.nnwtheme/template.html
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
{ echo "  <script>"; cat src/rules.js src/update-notice.js; echo "  </script>"; } > "$work/block.html"
awk -v block="$work/block.html" '
  /<!-- rules:begin -->/ { print; while ((getline line < block) > 0) print line; skip = 1; next }
  /<!-- rules:end -->/ { skip = 0 }
  !skip { print }
' "$template" > "$work/template.html"
if [ "${1:-}" = "--check" ]; then
  cmp -s "$work/template.html" "$template" || { echo "template.html is stale: run scripts/build-rules.sh" >&2; exit 1; }
else
  cp "$work/template.html" "$template"
fi
