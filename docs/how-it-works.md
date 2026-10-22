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
| A tag in brackets or parentheses at the end of a headline: `Clear the Clutter [Sponsor]`, `Everything new in Android 17 [Gallery]`, `Is Duolingo down? (Updated)` | The tag moves to the small line above the title (**Sponsor**, **Gallery**, **Updated**) and the headline keeps the rest. Only Gallery, Video, Poll, Updated, Live and the sponsor words are recognized, so asides like `(Again)`, `(So Far)` and `(Part 2)` stay in the headline. |
| An editorial label before a colon: `Cartoon: France's clean up`, `Commentary: …`, `Review: …`, `Hands-on: …`, `Exclusive: …`, `Interview: …`, `Deals: …`, `Bonus: …`, `Special Edition: …`, `Special Episode: …`, `Report: …` | The label moves to the small line above the title (**Cartoon**) and the title keeps just the headline. Only the labels in the list in `template.html` are recognized, so `Breaking: …` and `Top 10: …` stay as they are. |
| A recurring section name before a colon: `The Sunday Read: …` and `Sunday Special: …` (The New York Times), `Hello Developer: …` and `Version History: …` (Apple Developer), `Cover Story newsletter: …`, `Fragments: …`, `Solo Acts: …`, `The Latest: …`, `The Field: …`, `The Headlines: …` | The section name moves to the small line above the title (**The Sunday Read**) and the title keeps the headline. To follow another section, add its name to the list in `template.html`. |
| A label that repeats the feed's own name: `Pluralistic: Adversarial interoperability…`, `MacStories Weekly: Issue 533` | The label moves to the small line (**Pluralistic**, **MacStories Weekly**), with no list to maintain. A label that is only part of the feed name or that contains it also counts. |
| A paywall marker before a pipe: `heise+ | Deepfakes und Voyeurismus…` | The marker moves to the small line (**heise+**), keeping its own lowercase. |
| A short show name after a pipe at the end of a headline: `The folding iPhone Duo is finally here | The Vergecast Livestream` | The show name moves to the small line (**The Vergecast Livestream**). It has to be four words or fewer and contain no numbers, so a date ending like `| October 2026` stays. |
| A single symbol at the start of a headline: `★ The iPhone Duo` ([Daring Fireball](https://daringfireball.net)), `🔴 Live: …` | Nothing. A one-symbol prefix is part of the title, for every feed. |
| A prefix that is only an acronym: `CISA: …`, `EU: …`, `PSA: …`, `NFL: …` | Nothing. An acronym is too short to stand as a label, so it stays in the title. |
| Blank spacer paragraphs and spacer blocks (WordPress, Blogger, Tumblr) | Hidden, so gaps between paragraphs, images and the title look even. |
| Centered intro blurbs, and paragraphs set entirely in italics | Left-aligned and upright. Emphasis inside normal sentences is kept. |
| Small-print caption paragraphs | Set smaller, like a caption. |
| A numbered series at the start of a headline: `OS 34: …`, `Obs 149.5: …`, `Mostly free OS 32: …`, `Clockwise 679: …`, `The Sideload 048: …` | The series name and number, and any words before them, move to the small line above the title (**Mostly free OS 32**, **Clockwise 679**) and the title keeps just the headline. Only the series named in the list in `template.html` (OS, Obs, Observer, and the podcasts Clockwise, Upgrade, The Rebound, The Sideload, Pixelated, Overtime, Designed in California) are recognized, so `iOS 17: …`, `Part 2: …` and `Top 10: …` stay as they are. To follow another numbered series, add its name to that list. |
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

## Style names

The spacing and type styles are defined once, at the top of `stylesheet.css`, and reused everywhere. Change a value in one place and every area that uses it moves together.

**Spacing**
- **`--space-small`**: the tight gap between a label and what it labels, measured from the letters like `--space-large`: the sponsor label and the title, the title and the link below it, and an expandable block's label and its text.
- **`--space-medium`**: the gap between paragraphs. Also the space above and below the rule before the footnotes.
- **`--space-large`**: the title gap. Below the title block (or the credit row of an untitled post), and above the "View original" link. Above the title block it is 6% less, because space above a heading looks bigger than the same space below it.
- **`--indent`**: the space between the left bar and the text of a block quote or a footnote.

**Type**
- **Size**: `--text-small` (captions, code, tables, small print, h5 and h6) and `--text-medium` (body text and everything else). The title and headings keep their own sizes: `--text-h1`, `--text-h2`, `--text-h3`.
- **Weight**: `--weight-regular`, `--weight-medium` (headings, labels, buttons), `--weight-bold`.
- **Line height**: `--leading-body`, `--leading-tight` (headings), `--leading-compact` (tables, code, footnote popovers).
- **Letter spacing**: `--tracking-body`, `--tracking-heading`.
- **Lines**: `--line-thin` is the thickness of underlines and thin borders, and `--link-offset` is how far an underline sits below its text.

Links come in two kinds. A link inside the article is underlined and turns orange on hover. A quiet link (the credit, the link line under the title, the sponsor label, "View original") has no underline.

At accessibility text sizes the medium and large gaps, the indent and the body line height shrink.
