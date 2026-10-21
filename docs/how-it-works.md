# How Daisy works

The details behind [Daisy](../README.md): what it changes in a feed's content, and
how it handles text size and languages.

## What gets cleaned up

| What the feed sends | What you see |
| --- | --- |
| An author, a blog name and a timestamp | **Jason Kottke for kottke.org** on the left, the date on the right. With no author, or an author named the same as the blog, just the blog name. |
| A full timestamp, like "October 20, 2026 at 10:15 AM" | **12 minutes ago**, **3 hours ago**, **Yesterday**, **4 days ago**. After a week, the normal date. On Mac, hover for the full date. |
| A post with no title of its own: an empty title ([Micro.blog](https://micro.blog) and Manton Reece's posts), a title that's only the start of the post, cut off with "…" ([kottke.org](https://kottke.org)), a title that is the whole note, or just a web address | The title is hidden, since the post already opens with the same words. A **View original** line at the bottom keeps the original one tap away, and if the post has a link line, that link moves to it instead of showing at the top. |
| A link post with an address ([Daring Fireball](https://daringfireball.net) link posts) | **Source: manton.org/2026/10/17/in-john-grubers-…** under the title: just the domain and path, no `https://www.`, kept to one line. When the link points back to the same site, it reads **A follow-up to daringfireball.net/…** instead. |
| A link that points at the article's own page | Nothing. The row disappears instead of repeating the title. |
| Category tags at the start of a headline: `(Podcast) Clockwise 678…`, `App Report: Apps worth grabbing`, `The Talk Show: …`, `[Sponsor] Sunnny`, `(Sponsor) Magic Lasso Adblock: Effortlessly block ads…` | The tag moves to a small line above the title: **Podcast**, **App Report**, **Sponsor**. For a sponsor, the name goes up with it (**Sponsor: Magic Lasso Adblock**) and the title keeps just the headline. If the post also has a link line, the eyebrow itself becomes that link, and the separate line is dropped. |
| Blank spacer paragraphs and spacer blocks (WordPress, Blogger, Tumblr) | Hidden, so gaps between paragraphs, images and the title look even. |
| Centered intro blurbs, and paragraphs set entirely in italics | Left-aligned and upright. Emphasis inside normal sentences is kept. |
| Small-print caption paragraphs | Set smaller, like a caption. |
| A short paragraph right before a list ("Sponsored by:") | Treated as the list's label: it sits close to the list. |
| Footnotes (Daring Fireball and other Markdown-style footnotes) | Tap the number and the note opens under the paragraph, with a **Footnote 1** header and a close button. At the end of the article, a **Footnotes** heading and a **Footnote 1** label above each note; tap a label to jump back to that line. Return arrows and emoji that publishers add to their notes are hidden. |
| Images, galleries and video players | Full width of the column, with video at 16:9. |
| Tables, code and anything else wider than the screen | Only that element scrolls, never the whole article. A table that has to scroll is sized so a column is cut off by the screen edge, which shows there is more. |

## Text size and accessibility

Daisy follows your text size setting (Dynamic Type on iPhone and iPad, the text
size setting in NetNewsWire on Mac), including the accessibility sizes. When the
text gets large, the layout changes with it instead of just growing:

- the date moves onto its own line below the credit
- the title drops to body size and gets heavier, so it still stands apart
- line spacing and the gaps between blocks tighten
- rules and the quote bar get thicker to match the text
- page margins stay fixed and never grow with the text

Links in the text stay underlined, so color is never the only signal.

## Languages

The words Daisy adds itself follow your device language: "for", "View original",
"Just now", "Footnote", "Close", "Source:", "A follow-up to", and the relative
dates ("hace 3 horas", "3時間前", "vor 3 Stunden"). Labels start with a capital
letter where the language uses them, and numbers and spacing follow each
language's own conventions.

Covered: English, Spanish, French, German, Italian, Portuguese, Dutch, Swedish,
Danish, Norwegian, Finnish, Polish, Czech, Slovak, Hungarian, Romanian, Russian,
Ukrainian, Turkish, Greek, Hebrew, Arabic, Persian, Hindi, Thai, Vietnamese,
Indonesian, Malay, Japanese, Korean, and Simplified and Traditional Chinese. Other
languages fall back to English wording, and the date NetNewsWire provides is still
shown in your language.

Right-to-left languages (Arabic, Hebrew, Persian) mirror the layout, including the
quote bar and the position of the date.

## Known limits

- **Article JavaScript.** The dates, "View original", the footnote panels, the
  untitled-post handling, the link row, table sizing and the label cleanup use a
  small script. NetNewsWire runs it by default. With Article JavaScript turned off,
  you get the plain article: normal dates, the feed's own title, NetNewsWire's own
  footnote popovers and no cleanup.
- **System version.** Daisy needs macOS 13 or iOS 16 or later.
- **Languages.** The translations haven't been reviewed by native speakers. The
  relative dates need a Gregorian or Buddhist calendar, so with the Persian
  calendar the normal date is shown instead. The language follows your device, not
  the article.
- **Screen readers.** Daisy hasn't been tested with VoiceOver yet.
