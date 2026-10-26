#!/bin/sh
# Copy each theme's stylesheet next to the install page, so the page is set in the real
# theme styles (title, link line, body, footer, sizes, spacing) and cannot drift from them.
# NetNewsWire replaces [[font-size]] with the reader's text size; a web page has no such
# macro, so the one rule that uses it is ignored and the last rule below stands in for it
# on touch devices (iOS's default text size, 17px, times the theme's scale).
# Usage: scripts/build-install-css.sh   (run by scripts/build-sans.sh)
set -eu
cd "$(dirname "$0")/.."
for pair in "Daisy.nnwtheme/stylesheet.css:docs/install/daisy.css" "Daisy-Sans/Daisy Sans.nnwtheme/stylesheet.css:docs/install/daisy-sans.css"; do
  src=${pair%%:*}; out=${pair#*:}
  {
    cat "$src"
    printf '\n/* Install page: stands in for [[font-size]] (see scripts/build-install-css.sh). */\n'
    printf '@media (hover: none) {\n  :root { font-size: calc(17px * var(--serif-scale)); }\n}\n'
  } > "$out"
done
