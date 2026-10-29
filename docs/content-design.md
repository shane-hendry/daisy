# Content design

The thinking behind [Daisy](../README.md): what the theme shows, what it hides,
and why. For more on these ideas, visit [content-rules.md](content-rules.md), or select the ↗ to see that rule. For every publication and platform Daisy has a rule for, see [Publications and platforms](content-rules.md#publications-and-platforms).

## The idea

When authors and feeds use RSS data in
different ways, Daisy does its best to represent what they intended while giving
you a consistent experience across your mixed feed.

- Stay faithful to what each author intended, in their own conventions.
- Stay consistent for the reader, no matter whose feed it came from.
- No repeated titles, links, or names.
- Move labels out of headlines and into the [eyebrow](#the-eyebrow).
- Everything adapts to the reader's text size and language.

## The hero block

The top of every article is the hero block. Each part has a section below.
Parts marked *conditional* only show when a rule says they should.

- **[Byline](#bylines)**: who wrote the post, and where.
- **[Timestamp](#timestamp)**: when it was published.
- **[Title block](#title-block)**: the group under them.
  - **[Eyebrow](#the-eyebrow)** (conditional): a small label above the title.
  - **[Title](#titles)**: the headline.
  - **[Secondary link](#the-secondary-link)** (conditional): where the post points.

### Bylines

The byline is the top line of every article. It says who wrote the post and
where it was published.

- The byline is written as **Author for Publication**, like "Matilda Jeffries for Time". [↗](content-rules.md#author-and-publication)
- When there's no author, only the publication name is shown. [↗](content-rules.md#author-and-publication)
- When the author and the publication share a name, it's shown once. [↗](content-rules.md#author-and-publication)
- Debris in a credit is cleaned up: a leading "By", an affiliation after a pipe, an email address, a name given twice, the publication's name inside the author, a job description after a name, and a staff credit that is the publication itself. [↗](content-rules.md#email-and-staff-credits)
- Publication names lose their filler ("Latest Articles", "Local News -"), and long or address-like names shrink to the plain name. [↗](content-rules.md#email-and-staff-credits)
- An author that is only an agency's name, or an address and "by" or "via" that the link line already shows, is hidden. [↗](content-rules.md#email-and-staff-credits)
- A publication name that ends with the author's own name drops it, and GitHub feeds put the repository first. [↗](content-rules.md#email-and-staff-credits)
- A list of four or more authors always shows the first name and a count. [↗](content-rules.md#email-and-staff-credits)
- The [timestamp](#timestamp) sits at the other end of the same row.
- Social media bylines are written as **Name on Mastodon** or **Name on Bluesky**. See [Social posts](#social-posts).

**Why:** feeds send the author and the publication in all sorts of shapes. One simple,
sentence-like byline makes every article start the same way.

### Timestamp

- Recent timestamps are written as relative times, like "12 minutes ago", "3 hours ago", or "Yesterday". [↗](content-rules.md#relative-times)
- After a week, the normal date is shown instead. [↗](content-rules.md#relative-times)
- Selecting the timestamp shows the exact time. See [Interactivity](#interactivity).

**Why:** you mostly want to know how fresh a post is. The exact time is one selection
away for when you need it.

### Title block

The group under the byline and timestamp. It holds the eyebrow, the title, and
the secondary link. The eyebrow and the secondary link are conditional: they only
show when a rule says they should.

#### Titles

A title only shows when the author meant to give the post one.

- Some authors publish posts with no title of their own.
- Feeds fill one in from the post itself, and Daisy hides it. [↗](content-rules.md#hidden-titles)
- A title is treated as a stand-in when it's:
  - empty
  - only a web address
  - the whole post
  - the start of the post, cut off with "…"

**Why:** a stand-in title repeats the first line of the post, and reading it twice
adds nothing.

##### One place to go

Selecting the title always takes you to the same place: the landing page of
the post itself. That's a core principle of the design.

- Many feeds point the title somewhere else, like the article a post links to. Daisy moves that link to the [secondary link](#the-secondary-link), so the title only ever goes to the post. [↗](content-rules.md#secondary-link)
- You always know where selecting the title will take you.
- Posts with no title still need a clear way to reach the original post. The footer link at the bottom of the article is **View original** on articles with no title and **View post** on social media posts. [↗](content-rules.md#hidden-titles)

##### Who this helps

- [Kottke](https://kottke.org) quick links, whose titles are the start of the post, cut off with "…"
- [Manton Reece](https://manton.org) and [Micro.blog](https://micro.blog) posts, which have empty titles
- [Mastodon](https://joinmastodon.org) and [Bluesky](https://bsky.app) posts, where the post is the title

#### The eyebrow

The eyebrow is a small line that sits above the title. It's conditional: it only
appears when a rule finds a label in the headline, and Daisy pulls the label out
into it. [↗](content-rules.md#eyebrow)

- It holds the label, like **Sponsor**, **Podcast**, or **OS 34**.
- The title underneath keeps only the headline.

**Why:** publishers put labels in headlines because feeds have no other place for
them. "(Sponsor) Magic Lasso Adblock: Effortlessly block ads" is hard to scan.
Split in two, the label and the headline each read quickly.

##### What goes in the eyebrow

- **Sponsors.** The sponsor's name moves to the eyebrow too, like **Sponsor: Magic Lasso Adblock**, and the title keeps the headline. [↗](content-rules.md#sponsors)
- **Podcasts.** The show label moves to the eyebrow, like **Podcast** or **The Talk Show**. [↗](content-rules.md#podcasts-and-series)
- **Series.** Named series, like **App Report**. [↗](content-rules.md#podcasts-and-series)
- **Numbered issues.** A series name and number, like **OS 34** or **Obs 149.5**, plus any words before it. [↗](content-rules.md#numbered-series)
- **Podcast episodes.** A show name and episode number, like **Clockwise 679**. [↗](content-rules.md#numbered-series)
- **Bracketed tags.** Short tags in square brackets, like **Comment**, and a few known words in parentheses, like **Update**. [↗](content-rules.md#bracketed-tags)
- **Tags at the end.** A **[Gallery]**, **[Video]**, **[Poll]**, **(Updated)**, or **(Rebroadcast)** that closes a headline. [↗](content-rules.md#tags-at-the-end)
- **Editorial labels.** What kind of piece it is, like **Cartoon**, **Commentary**, **Review**, **Book Review**, **Watch**, or **Hands-on**. [↗](content-rules.md#editorial-labels)
- **Recurring sections.** A column or show a post belongs to, like **The Sunday Read** or **Hello Developer**. [↗](content-rules.md#recurring-sections)
- **The feed's own name.** A label that is exactly the feed's name, like **Nature** in the Nature feed. [↗](content-rules.md#the-feeds-own-name)
- **Paywall markers.** A marker like **heise+**. [↗](content-rules.md#paywall-markers)
- **Newsletters.** Any name that ends in "newsletter", like **The War Room newsletter**. [↗](content-rules.md#newsletters)
- **Opinion.** An **Opinion |** or **Opinion:** label at the start of a headline. [↗](content-rules.md#opinion-before-a-pipe)
- **Show names after a pipe.** A known show or section at the end of a headline, like **The Vergecast Livestream**. A name that is the post's author or the feed's name is dropped instead, since the byline shows it. [↗](content-rules.md#show-names-after-a-pipe)
- **Community posts.** A **Show HN**, **Ask HN**, or **Tell HN** at the start of a headline. [↗](content-rules.md#community-posts)
- **Live labels.** A label like **En direct** at the start of a headline. [↗](content-rules.md#live-labels)
- **Elections.** A label about an election, like **Live Election Results** or **Illinois Primary Election Results**, in any year. [↗](content-rules.md#elections)
- **Annual events and sales.** A yearly event or sale, like **Black Friday deals**, **Amazon Prime Day 2026** or **Labor Day sales**. [↗](content-rules.md#annual-events-and-sales)
- **Guides.** A short label ending in "Guide", like **November Culture Guide**. [↗](content-rules.md#guides)
- **Dash tags at the end.** A **– video** or **– live** that closes a headline. [↗](content-rules.md#dash-tags-at-the-end)

An author's name before a colon, like **Bengt Ohlsson: …** by Bengt Ohlsson, is dropped
instead of moved, since the byline already shows it. [↗](content-rules.md#author-names-before-a-colon)

Numbered series, editorial labels, recurring sections, and annual events are deliberately short
lists. "iOS 17: …", "Top 10: …", and "Breaking: …" are headlines, not labels, so
they stay put. To follow a new series, label, or section, add its name to the list
in `template.html`.

##### Star ratings

A star rating that closes a title after a dash, like **Resident Evil, 2026 - ★★★★**, is not a label for the eyebrow. It drops the dash and takes its own line under the title, so the rating reads at a glance. [↗](content-rules.md#star-ratings)

##### What stays in the title

Not every prefix is a label. Two kinds stay in the title, in every feed. [↗](content-rules.md#prefixes-that-stay-in-the-title)

- **Single symbols.** A star, an emoji, or any one symbol at the start of a title, like **★ The iPhone Duo**.
- **Acronyms.** A prefix that is only an acronym, like **CISA:**, **EU:**, or **PSA:**.

**Why:** a symbol is part of how a publication presents itself, and an acronym is
too short to read as a label on its own line. Moving either would take something
out of the headline that the author meant to be there.

#### The secondary link

Some posts carry a second link, apart from the title. The secondary link shows it
under the title. It's conditional: it only appears when a rule says the post has
one worth showing. [↗](content-rules.md#secondary-link)

- It's written as **Source: example.com/the-article**. [↗](content-rules.md#what-it-says)
- The address is kept short, with no `https://` or `www.`, and it stays on one line, cut with "…". [↗](content-rules.md#what-it-says)
- When the link points to the same site, it's written as **A follow-up to example.com/…**. [↗](content-rules.md#what-it-says)
- When the link goes where the title already goes, the secondary link is hidden. [↗](content-rules.md#when-its-hidden)

**Why:** a link post has two destinations, the post and the thing it talks about.
The secondary link tells you where the post points before you select it.

##### Where the link goes instead

- On sponsor posts, the [eyebrow](#the-eyebrow) becomes the link. **Sponsor: Mux** opens the sponsor's page, and the secondary link is dropped. [↗](content-rules.md#eyebrow)
- On posts with a hidden title, the secondary link is dropped and the footer link, **View original**, opens it. [↗](content-rules.md#hidden-titles)

## Daring Fireball

[Daring Fireball](https://daringfireball.net) gets the most special treatment.
Its writing conventions are the reason several of these ideas exist.

- **Link posts.** The headline is about the thing it links to, and the [secondary link](#the-secondary-link) shows that source. [↗](content-rules.md#secondary-link)
- **Follow-ups.** John Gruber often links back to his own earlier posts, and those are written as **A follow-up to daringfireball.net/…**. [↗](content-rules.md#what-it-says)
- **Sponsors.** Sponsor posts get the sponsor [eyebrow](#the-eyebrow), with the sponsor's name and link. [↗](content-rules.md#sponsors)
- **The Talk Show.** Episode titles move the show name to the [eyebrow](#the-eyebrow). [↗](content-rules.md#podcasts-and-series)
- **The star.** John Gruber's ★ is part of his brand, so it stays in the title. [↗](content-rules.md#prefixes-that-stay-in-the-title)

## Footnotes

Footnotes are a reading habit on some publications, so Daisy treats them as a feature.

- Selecting a number opens the note right under its paragraph. [↗](content-rules.md#opening-a-note)
- The note gets a **Footnote N** title and a **Close** button, where N is that note's number.
- If you want the whole list, there's a **Go to footnotes** link in the note.
- A note stays open until you close it or open a different one, so scrolling, selecting elsewhere, and following a link all leave it alone. [↗](content-rules.md#opening-a-note)
- At the end of the article, each note has a **Footnote N** label, and selecting it takes you back to that line. [↗](content-rules.md#the-list-at-the-end)
- Many publishers have their own conventions for return arrows. Daisy overrides them, so footnotes feel consistent across your mixed feed. [↗](content-rules.md#publisher-leftovers)

**Why:** jumping to the bottom and back loses your place. Reading the note where
you are keeps the thought together.

## Polishing key text

The most important text should always look nice: the [publication name](#bylines)
in the byline, the [title](#titles), and the headlines inside articles. Awkward
line endings stand out most there, since they're the first things you read.

- The publication name and the title use the CSS `text-wrap: pretty` property, which keeps the last line from being a lone word, called an orphan.
- Headlines inside articles use `text-wrap: balance` instead. It evens out all of a headline's lines, which avoids orphans too and looks better on short text, so `pretty` isn't needed there.
- `text-wrap: pretty` isn't used in the article body. Avoiding orphans there made the lines noticeably shorter overall, which hurt reading more than a short last line does.

## Link styles

Daisy uses three link styles, so you can tell what a link is without it
shouting. One rule sits above all three: the [hero block](#the-hero-block) is
clean at rest, with no underlines.

### Links in the text

Links inside the article body are underlined, and they change color on hover.
Footnote numbers work the same way.

- The underline is how you spot a link in a sentence, so color is never the only signal.

### Quiet links

Quiet links name a place. They have no underline until you hover, and
then they show an underline and change color.

- The footer link, **View original** or **View post**, at the bottom of the article.

### Even quieter links

These only change color on hover and never show an underline. They're headings
and controls, so their role is clear from where they sit.

- The author and publication links in the [byline](#bylines).
- The [title](#titles), the [eyebrow](#the-eyebrow) when it's a link, and the [secondary link](#the-secondary-link).
- The [timestamp](#timestamp), which reveals the exact time.
- Footnote controls: **Close**, **Go to footnotes**, and the **Footnote N** labels.
- Expandable blocks.

**Why:** the hero block is the first thing you see, so everything in it,
including the byline, is as clean as possible. Elsewhere, controls that show or
reveal something stay quiet too, since the layout already tells you what they do.

## Interactivity

RSS readers doesn't typically offer much interaction in articles, but Daisy
builds some in on purpose. It's all simple HTML, used to smooth over the
inconsistent conventions across a mixed feed. The goal is a consistent, more
modern feel. It's progressive disclosure: the page stays calm and simple at a
glance, and there's more underneath when you want it.

- **Timestamp.** The page shows "3 hours ago", and selecting it shows the exact time without moving anything. [↗](content-rules.md#reading-the-exact-time)
- **Footnotes.** The note opens right where you're reading, and a link takes you to the full list if you want it. [↗](content-rules.md#opening-a-note)
- **Expandable blocks.** Sections that publishers collapse stay collapsed until you open them.
- **Keyboard.** Escape closes whatever is open, and the timestamp opens with Enter or Space. [↗](content-rules.md#reading-the-exact-time)

The rule behind all of it is that nothing should shift or jump. Extra
information appears over or under what's already there, and it always leaves the
same way it came.

## Social posts

- The [byline](#bylines) is written as **Name on Mastodon** or **Name on Bluesky**, and the name links to the profile. [↗](content-rules.md#mastodon-and-bluesky)
- A Bluesky name of "@handle - Real Name" shows the real name. [↗](content-rules.md#mastodon-and-bluesky)
- The footer link is written as **View post**. [↗](content-rules.md#mastodon-and-bluesky)
- There's no title, since the post is the title.

## Cleaning up publishing tools

Publishing tools add things the author never chose, like spacers and buttons, and they get in the way of a consistent page. Daisy hides them.

- Blank spacer paragraphs and blocks from tools like WordPress, Blogger, and Tumblr. [↗](content-rules.md#blank-blocks)
- Small buttons that Substack puts on top of images. [↗](content-rules.md#substack)

## Text size and accessibility

- Daisy follows the reader's text size, including the largest accessibility sizes.
- At the largest sizes, the layout adapts so everything stays readable, including moving the [timestamp](#timestamp) to its own line.

## Languages

Daisy's written for readers all over the world, so it doesn't just swap English
words for translated ones. It rewrites whole phrases so they read the way a
native speaker would say them. [↗](content-rules.md#languages)

### Phrases, not words

- **The byline joiner changes.** "Author **for** Publication" becomes "Autor **para** Publicación" in Spanish and "Autor **für** Publikation" in German. Where there's no natural word, like Japanese, Korean, Chinese, Thai, Arabic, and Hindi, a simple "·" is used instead.
- **Social bylines are reworded.** "Name on Mastodon" becomes "Name sur Mastodon" in French and "Name auf Mastodon" in German.
- **The [secondary link](#the-secondary-link) is reworded.** "A follow-up to" becomes "Suite à" in French and "Weiterführend zu" in German, and each reads as a natural phrase instead of a word-for-word swap.
- **Footnote labels follow the language.** "Footnote N" becomes "Fußnote N" or "Nota al pie N", and Japanese and Chinese drop the space, as in "脚注N".

### Timestamps are rebuilt, not translated

- **Each language uses its own grammar for relative times.** "3 days ago" becomes "Hace 3 días" in Spanish and "Vor 3 Tagen" in German.
- **Wording is fixed where the built-in version sounds odd.** Norwegian's standard "døgn" reads strangely for days, so Daisy writes "for 3 dager siden" instead.
- **Daisy can read timestamps written in any of these languages.** It understands month names, native digits, 12- and 24-hour clocks, and the Buddhist calendar used in Thai, so the relative time is right even when the timestamp arrives in another script.

### Coverage

- More than 30 languages are supported, and anything else falls back to English.
