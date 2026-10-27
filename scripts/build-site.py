#!/usr/bin/env python3
"""Build docs/index.html, the front page, from scripts/site/index.template.html.

The hero and the feature blocks (feed, rules, footnotes, niceties) are build/wordpress/new/*.html as they are,
with all of build/wordpress/daisy-examples.css, so there is one copy of each to keep up to date. The three
newest releases come from docs/release-notes.json (anchors like #v0-5-0); the newest also carries the update steps in scripts/site/howto.html.
Usage: python3 scripts/build-site.py
"""
import html
import json
import re
from datetime import datetime
from pathlib import Path

root = Path(__file__).resolve().parent.parent
wp = root / "build/wordpress"

def short(v):
    """A version as shown to readers: a trailing .0 is dropped (0.5.0 is 0.5, 1.2.0 is 1.2, 1.0.0 is 1.0)."""
    parts = v.split(".")
    while len(parts) > 2 and parts[-1] == "0":
        parts.pop()
    return ".".join(parts)

def version_key(v):
    return tuple(int(n) for n in v.split("."))

notes = json.loads((root / "docs/release-notes.json").read_text())
versions = sorted(notes, key=version_key, reverse=True)

HOWTO = (root / "scripts/site/howto.html").read_text()

def release(v, latest=False):
    entry = notes[v]
    when = datetime.fromisoformat(entry["published"].replace("Z", "+00:00"))
    pretty = f"{when:%b} {when.day}, {when.year}"
    items = "\n".join(
        f"        <li><strong>{html.escape(n['title'])}</strong> {html.escape(n['text'])}</li>"
        for n in entry.get("notes", [])
    )
    anchor = "v" + v.replace(".", "-")
    return (
        f'    <article class="release" id="{anchor}">\n'
        f'      <h3><a href="#{anchor}">Version {short(v)}</a></h3>\n'
        f'      <time datetime="{entry["published"]}">{pretty}</time>\n'
        + (HOWTO.replace("{{VERSION}}", v).replace("{{SHORT}}", short(v)) if latest else "")
        +
        f"      <details><summary>View release notes</summary>\n      <ul>\n{items}\n      </ul>\n      </details>\n"
        f"    </article>"
    )

css = (wp / "daisy-examples.css").read_text()
hero_css = css  # all of it, as pasted into WordPress, so every block below looks as it does there
hero = (wp / "new/hero.html").read_text()

page = (root / "scripts/site/index.template.html").read_text()
page = page.replace("{{LATEST}}", versions[0])
page = page.replace("{{RELEASES}}", "\n".join(release(v, i == 0) for i, v in enumerate(versions[:3])))
page = page.replace("{{HERO_CSS}}", hero_css)
page = page.replace("{{HERO}}", hero)
for name in ("FEED", "RULES", "FOOTNOTES"):
    page = page.replace("{{" + name + "}}", (wp / "new" / (name.lower() + ".html")).read_text())

def top_level_divs(text, start_tag):
    """The outer HTML of each <div> that opens with start_tag, found by counting nested divs."""
    found, pos = [], 0
    while (i := text.find(start_tag, pos)) != -1:
        depth, j = 0, i
        for m in re.finditer(r"<div\b|</div>", text[i:]):
            depth += 1 if m.group(0) != "</div>" else -1
            if depth == 0:
                j = i + m.end()
                break
        found.append(text[i:j])
        pos = j
    return found

# The niceties block is four cards in one row. The page sets them as two rows of two, each under the list it
# illustrates, so the block's cells go into two rows inside one root (its script finds the cards by what is
# inside the root) and its script comes once, after both.
nice = (wp / "new/niceties.html").read_text()
cells = top_level_divs(nice, '<div class="daisy-cards__cell">')
assert len(cells) == 4, len(cells)
row = lambda pair: '<div class="daisy-cards__row">\n' + "\n\n".join(pair) + "\n</div>"
page = page.replace("{{NICETIES_1}}", row(cells[:2])).replace("{{NICETIES_2}}", row(cells[2:]) + "\n" + nice[nice.index("<script"):])
(root / "docs/index.html").write_text(page)
print(f"docs/index.html: {len(page) // 1024} KB, releases {', '.join(versions[:3])}")
