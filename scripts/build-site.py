#!/usr/bin/env python3
"""Build docs/index.html, the front page, from scripts/site/index.template.html.

The hero is build/wordpress/new/hero.html as it is, with the hero section of
build/wordpress/daisy-examples.css, so there is one hero to keep up to date. The three
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
        f'      <h3><a href="#{anchor}">Version {v}</a></h3>\n'
        f'      <time datetime="{entry["published"]}">{pretty}</time>\n'
        + (HOWTO.replace("{{VERSION}}", v) if latest else "")
        +
        f"      <ul>\n{items}\n      </ul>\n"
        f"    </article>"
    )

css = (wp / "daisy-examples.css").read_text()
hero_css = css[css.index("/* Hero: a Mac window"):]
hero = (wp / "new/hero.html").read_text()

page = (root / "scripts/site/index.template.html").read_text()
page = page.replace("{{LATEST}}", versions[0])
page = page.replace("{{RELEASES}}", "\n".join(release(v, i == 0) for i, v in enumerate(versions[:3])))
page = page.replace("{{HERO_CSS}}", hero_css)
page = page.replace("{{HERO}}", hero)
(root / "docs/index.html").write_text(page)
print(f"docs/index.html: {len(page) // 1024} KB, releases {', '.join(versions[:3])}")
