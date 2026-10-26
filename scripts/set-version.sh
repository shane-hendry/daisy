#!/bin/sh
# Prepare a release: set the version the theme compares against, and publish the update
# sentence each theme shows to readers on older versions, in every language the theme
# supports. Keeps the template, Daisy Sans, docs/updates.json and the release tag in step.
# Usage: scripts/set-version.sh 0.5.0 notes.json
#        scripts/set-version.sh --check     (fails if template and updates.json disagree)
# notes.json: {"daisy": {"en": "...", "de": "...", ...}, "daisy-sans": {...}}, with a
# sentence for every language in the theme's STRINGS table (the script lists any missing).
set -eu
cd "$(dirname "$0")/.."

TEMPLATE=Daisy.nnwtheme/template.html
UPDATES=docs/updates.json

current() { sed -n 's/.*data-version="\([0-9.]*\)".*/\1/p' "$TEMPLATE" | head -1; }

# The languages the theme supports: the keys of its STRINGS table.
languages() { sed -n 's/^        "\{0,1\}\([A-Za-z-]*\)"\{0,1\}: \[" .*/\1/p' "$TEMPLATE" | tr '\n' ' '; }

if [ "${1:-}" = "--check" ]; then
  v=$(current)
  python3 - "$UPDATES" "$v" "$(languages)" <<'PY'
import json, sys
path, v, langs = sys.argv[1], sys.argv[2], sys.argv[3].split()
data = json.load(open(path))
for key in ("daisy", "daisy-sans"):
    entry = data.get(key, {})
    if entry.get("version") != v:
        sys.exit(f"{path}: {key} is {entry.get('version')}, but the template is {v}")
    note = entry.get("note")
    if isinstance(note, dict):
        missing = [l for l in langs if not note.get(l)]
        if missing:
            sys.exit(f"{path}: {key} has no sentence for: {' '.join(missing)}")
print(f"Version {v} matches docs/updates.json.")
PY
  exit 0
fi

[ $# -eq 2 ] || { echo "usage: $0 VERSION notes.json" >&2; exit 2; }
version=$1
echo "$version" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || { echo "version must look like 0.5.0" >&2; exit 2; }

python3 - "$UPDATES" "$version" "$2" "$(languages)" <<'PY'
import json, sys
path, version, notes_path, langs = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4].split()
notes = json.load(open(notes_path))
out = {}
for key in ("daisy", "daisy-sans"):
    note = notes.get(key)
    if not isinstance(note, dict):
        sys.exit(f"{notes_path}: {key} needs an object of sentences by language")
    missing = [l for l in langs if not str(note.get(l, "")).strip()]
    extra = [l for l in note if l not in langs]
    if missing or extra:
        sys.exit(f"{key}: missing {' '.join(missing) or 'none'}; unknown {' '.join(extra) or 'none'}")
    long = [l for l in langs if len(note[l].strip()) > 300]
    if long:
        sys.exit(f"{key}: over 300 characters in {' '.join(long)}")
    out[key] = {"version": version, "note": {l: note[l].strip() for l in langs}}
json.dump(out, open(path, "w"), indent=2, ensure_ascii=False)
open(path, "a").write("\n")
PY

sed "s|data-version=\"[0-9.]*\"|data-version=\"$version\"|" "$TEMPLATE" > "$TEMPLATE.tmp" && mv "$TEMPLATE.tmp" "$TEMPLATE"
scripts/build-sans.sh
echo "Set to $version. Next: npx nnw-theme@2 bump, npx nnw-theme@2 check, commit, push, then publish with tag v$version."
