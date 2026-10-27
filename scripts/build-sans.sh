#!/bin/sh
# Generate Daisy Sans from the root Daisy bundle. Daisy is the single source of
# truth; Sans differs only in the --serif font stack and its Info.plist identity.
# Usage: scripts/build-sans.sh [--check]   (--check fails if the output is stale)
set -eu
cd "$(dirname "$0")/.."

SRC=Daisy.nnwtheme
OUT="Daisy-Sans/Daisy Sans.nnwtheme"
SANS='ui-sans-serif, -apple-system, "SF Pro Text", system-ui, sans-serif'

dest="$OUT"
[ "${1:-}" = "--check" ] && dest="$(mktemp -d)/Daisy Sans.nnwtheme"
mkdir -p "$dest"

cp "$SRC/LICENSE" "$dest/"
sed 's|data-update-key="daisy"|data-update-key="daisy-sans"|' "$SRC/template.html" > "$dest/template.html"
sed -e "s|^\(  --serif: \).*;|\1$SANS;|" \
    -e 's|^\(  font-size: calc(\[\[font-size\]\]px \* \)1\.05);|\11);|' \
    -e 's|^\(  --serif-scale: \)[0-9.]*;|\11;|' \
    -e 's|^\(  --title-weight: \)[0-9]*;|\1900;|' \
    -e 's|^\(  --title-axes: \).*$|\1"wght" 900, "wdth" 115;|' \
    -e 's|^\(  --eyebrow-weight: \)[0-9]*;|\1800;|' \
    -e 's|^\(  --eyebrow-axes: \).*$|\1"wght" 800, "wdth" 115;|' \
    -e 's|^\(  --link-weight: \)[0-9]*;|\1450;|' \
    -e 's|^\(  --link-axes: \).*$|\1"wght" 450, "wdth" 75;|' \
    -e 's|^\(  --meta-axes: \).*$|\1"wght" 400, "wdth" 75;|' \
    -e 's|^\(  --label-axes: \)[^;]*;|\1"wdth" 115;|' \
    -e 's|^\(  --h1-weight: \).*$|\1750;|' \
    -e 's|^\(  --h1-axes: \).*$|\1"wght" 750, "wdth" 115;|' \
    -e 's|^\(  --h2-weight: \).*$|\1700;|' \
    -e 's|^\(  --h2-axes: \).*$|\1"wght" 700, "wdth" 115;|' \
    -e 's|^\(  --h3-weight: \).*$|\1650;|' \
    -e 's|^\(  --h3-axes: \).*$|\1"wght" 650, "wdth" 115;|' \
    -e 's|^\(  --h4-weight: \).*$|\1600;|' \
    -e 's|^\(  --h4-axes: \).*$|\1"wght" 600, "wdth" 115;|' \
    -e 's|^\(  --h5-weight: \).*$|\1600;|' \
    -e 's|^\(  --h5-axes: \).*$|\1"wght" 600, "wdth" 115;|' \
    -e 's|^\(  --h6-weight: \).*$|\1500;|' \
    -e 's|^\(  --h6-axes: \).*$|\1"wght" 500, "wdth" 115;|' \
    -e 's|^\(  --title-wide: \).*;|\1clamp(2.15em, 0.52em + 4.6vw, 2.8em);|' \
    -e 's|^\(  --title-short-axes: \).*;|\1"wght" 780, "wdth" 43;|' \
    -e 's|^\(  --title-short-scale: \)[0-9.]*;|\11.7;|' \
    -e 's|^\(  --title-long-axes: \).*;|\1"wght" 780, "wdth" 43;|' \
    -e 's|^\(  --title-long-scale: \)[0-9.]*;|\11.3;|' \
    -e 's|^\(  --title-brief-scale: \)[0-9.]*;|\11.2;|' \
    -e 's|^\(  --title-phone: \).*;|\1clamp(1.7em, 1.36em + 1.92vw, 2.05em);|' \
    -e '1s|^/\* Daisy: New York,|/* Daisy Sans: system sans,|' "$SRC/stylesheet.css" > "$dest/stylesheet.css"
sed -e 's|com\.shanehendry\.daisy|com.shanehendry.daisy-sans|' \
    -e 's|<string>Daisy</string>|<string>Daisy Sans</string>|' "$SRC/Info.plist" > "$dest/Info.plist"

grep -q 'data-update-key="daisy-sans"' "$dest/template.html" || { echo "update key substitution failed" >&2; exit 1; }
grep -q "$SANS" "$dest/stylesheet.css" || { echo "font substitution failed" >&2; exit 1; }

if [ "${1:-}" = "--check" ]; then
  diff -r "$dest" "$OUT" >/dev/null || { echo "Daisy Sans is stale: run scripts/build-sans.sh" >&2; exit 1; }
fi

if [ "${1:-}" != "--check" ]; then scripts/build-install-css.sh; fi
