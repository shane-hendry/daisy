#!/bin/sh
# Generate Daisy Sans from the root Daisy bundle. Daisy is the single source of
# truth; Sans differs only in the --serif font stack and its Info.plist identity.
# Usage: scripts/build-sans.sh [--check]   (--check fails if the output is stale)
set -eu
cd "$(dirname "$0")/.."

SRC=Daisy.nnwtheme
OUT=Daisy-Sans/Daisy-Sans.nnwtheme
SANS='ui-sans-serif, -apple-system, "SF Pro Text", system-ui, sans-serif'

dest=$OUT
[ "${1:-}" = "--check" ] && dest=$(mktemp -d)/Daisy-Sans.nnwtheme
mkdir -p "$dest"

cp "$SRC/template.html" "$SRC/LICENSE" "$dest/"
sed -e "s|^\(  --serif: \).*;|\1$SANS;|" \
    -e '1s|^/\* Daisy: New York,|/* Daisy Sans: system sans,|' "$SRC/stylesheet.css" > "$dest/stylesheet.css"
sed -e 's|com\.shanehendry\.daisy|com.shanehendry.daisy-sans|' \
    -e 's|<string>Daisy</string>|<string>Daisy Sans</string>|' "$SRC/Info.plist" > "$dest/Info.plist"

grep -q "$SANS" "$dest/stylesheet.css" || { echo "font substitution failed" >&2; exit 1; }

if [ "${1:-}" = "--check" ]; then
  diff -r "$dest" "$OUT" >/dev/null || { echo "Daisy-Sans is stale: run scripts/build-sans.sh" >&2; exit 1; }
fi
