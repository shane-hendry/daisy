#!/bin/sh
# Rebuild the highlight.js bundle inside Daisy.nnwtheme/template.html.
# The bundle sits between the "highlight.js:begin" and "highlight.js:end" markers;
# edit scripts/highlight/entry.js to change the languages. Then run
# scripts/build-sans.sh, which copies the template into Daisy Sans.
# Usage: scripts/build-highlight.sh
set -eu
cd "$(dirname "$0")/.."

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cp scripts/highlight/entry.js "$work/"
(cd "$work" && npm init -y >/dev/null && npm i --silent highlight.js@11 esbuild >/dev/null)
"$work/node_modules/.bin/esbuild" "$work/entry.js" --bundle --minify --format=iife \
  --legal-comments=none --outfile="$work/bundle.js" >/dev/null

version="$(sed -n 's/.*"version": "\(.*\)".*/\1/p' "$work/node_modules/highlight.js/package.json" | head -1)"
{
  echo "<!-- highlight.js:begin -->"
  echo "<script>"
  echo "/*! highlight.js $version (https://highlightjs.org), BSD 3-Clause License. Copyright (c) 2006, Ivan Sagalaev. See Daisy.nnwtheme/LICENSE. */"
  cat "$work/bundle.js"
  echo "</script>"
  echo "<!-- highlight.js:end -->"
} > "$work/block.html"

template=Daisy.nnwtheme/template.html
awk -v block="$work/block.html" '
  /<!-- highlight.js:begin -->/ { while ((getline line < block) > 0) print line; skip = 1; next }
  /<!-- highlight.js:end -->/ { skip = 0; next }
  !skip { print }
' "$template" > "$work/template.html"
cp "$work/template.html" "$template"
echo "highlight.js $version inlined ($(wc -c < "$work/bundle.js") bytes)"
