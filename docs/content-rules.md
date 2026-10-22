# Content rules

Every content rule in [Daisy](../README.md), in plain language. Each one covers
a case where the RSS data looks a certain way, and Daisy changes how it's
presented: hiding something, moving it, or showing it as a label. For the
thinking behind them, see [content-design.md](content-design.md).

## How to read this

- Each bullet is one rule: when something is detected, and what Daisy does.
- The version at the end of each rule is the release it first shipped in.
- v0.1.0 is the first beta, so everything up to it says v0.1.0.
- New rules go in the next release. That's v0.2.0.

## Contents

- [Hero block](#hero-block)
  - [Byline](#byline)
  - [Timestamp](#timestamp)
  - [Title block](#title-block)
    - [Titles](#titles)
    - [Secondary link](#secondary-link)
- [Footnotes](#footnotes)
- [Publisher clean-up](#publisher-clean-up)
- [Languages](#languages)
- [Publications and platforms](#publications-and-platforms)

## Hero block

The hero block is the top of every article. It holds the parts below, and
each has its own section. Parts marked *conditional* only show when a rule says
they should.

- **Byline**: who wrote the post, and for which publication.
- **Timestamp**: when it was published.
- **[Title block](#title-block)**: the group under them.
  - **[Eyebrow](#eyebrow)** (conditional): a small label above the title.
  - **Title**: the headline.
  - **[Secondary link](#secondary-link)** (conditional): where the post points.

### Byline

Part of the [hero block](#hero-block): who wrote the post, and for which publication.

#### Author and publication

- Author and publication are written as **Author for Publication**. (v0.1.0)
- No author: only the publication name shows. (v0.1.0)
- Author and publication have the same name: it shows once. (v0.1.0)

#### Mastodon and Bluesky

- A post from Mastodon or Bluesky is written as **Name on Mastodon** or **Name on Bluesky**. (v0.1.0)
- The name links to the profile. (v0.1.0)
- A Bluesky name of "@handle - Real Name" shows the real name. (v0.1.0)
- A Bluesky name ending in " - Bluesky" drops that ending. (v0.1.0)
- A Bluesky handle with no real name after it stays as the handle. (v0.1.0)
- The bottom line is written as **View post**. (v0.1.0)

### Timestamp

Part of the [hero block](#hero-block). It sits at the end of the same row as the byline.

#### Relative times

- Under a minute old: **Just now**. (v0.1.0)
- Under an hour: **12 minutes ago**. (v0.1.0)
- Under a day: **3 hours ago**. (v0.1.0)
- The day before: **Yesterday**. (v0.1.0)
- 2 to 6 days: **4 days ago**. (v0.1.0)
- A week or older: the normal date. (v0.1.0)
- A timestamp that can't be read, or sits in the future: left as it is. (v0.1.0)

#### Reading the exact time

- Selecting the timestamp shows the time, like "at 10:47 PM". (v0.2.0)
- The time replaces the full date that used to show on hover. (v0.2.0)

### Title block

The group under the byline and timestamp. It holds the eyebrow, the title, and
the secondary link. The eyebrow and the secondary link are conditional: they only
show when a rule says they should.

#### Titles

The title and the eyebrow above it, which together make up the title block.
A title only shows if the author meant it. Labels in a headline move to the
eyebrow.

##### Hidden titles

A title is hidden when it is:

- empty. (v0.1.0)
- only a web address. (v0.1.0)
- the whole post. (v0.1.0)
- the start of the post, cut off with "…". The part before the dots must be at least 8 characters. (v0.1.0)

When a title is hidden:

- The title block and its secondary link are removed from the top. (v0.1.0)
- A **View original** line goes at the bottom. (v0.1.0)
- If the post has a secondary link, **View original** opens that link instead. (v0.1.0)
- Mastodon and Bluesky posts say **View post** instead. (v0.1.0)
- Posts with titles never show **View original** or **View post**. (v0.1.0)

##### Eyebrow

- A label in a headline moves to the eyebrow, a small line above the title. (v0.1.0)
- The eyebrow only appears when there's text left for the title. (v0.1.0)
- The label always starts with a capital letter. (v0.1.0)
- If the post has a secondary link, the eyebrow becomes that link and the secondary link is dropped. (v0.1.0)

##### Sponsors

- **(Sponsor) Name: Headline** becomes **Sponsor: Name** over **Headline**. (v0.1.0)
- **[Sponsor] Headline** becomes **Sponsor** over **Headline**. (v0.1.0)
- **Sponsor: Headline** and **Sponsor - Headline** work the same way. (v0.1.0)
- The name is the text before the first colon, up to 60 characters. (v0.1.0)
- Sponsor words also include Sponsored, Advertisement, Ad, and Promoted. (v0.1.0)
- Sponsor words are also recognized in German, French, Spanish, Italian, Russian, Chinese, Japanese, Korean, and Arabic. (v0.1.0)
- **Headline [Sponsor]** becomes **Sponsor** over **Headline**. The tag can also be **(Sponsor)** and use any sponsor word. (v0.2.0)

##### Dated editions

- **Name: October 21, 2026 – Headline** moves **Name: October 21, 2026** to the eyebrow, so the title starts after the dash. (v0.2.0)
- The separator can be an en dash, an em dash, or a hyphen. (v0.2.0)

##### Podcasts and series

- **(Podcast) Title** becomes **Podcast** over **Title**. (v0.1.0)
- **Podcast: Title** works the same way. (v0.1.0)
- **App Report: Title** becomes **App Report** over **Title**. (v0.1.0)
- **The Talk Show: Title** becomes **The Talk Show** over **Title**. (v0.1.0)
- The separator can be a colon or a dash. (v0.1.0)

##### Numbered series

- **OS 34: Headline** becomes **OS 34** over **Headline**. (v0.1.0)
- **Obs 149.5: Headline** becomes **Obs 149.5** over **Headline**. (v0.1.0)
- Words before the series name come along: **Mostly free OS 32**. (v0.1.0)
- The label can be up to six words and 48 characters. (v0.1.0)
- Only OS, Obs, and Observer count as series. (v0.1.0)
- **iOS 17:**, **Part 2:**, **Top 10:**, and **Windows 11:** stay as they are. (v0.1.0)

##### Bracketed tags

- **(Tag) Title** and **[Tag] Title** move the tag to the eyebrow. (v0.1.0)
- Tags can be up to 24 characters. (v0.1.0)
- A tag must contain at least one letter. (v0.1.0)
- A tag with nothing after it is left alone. (v0.1.0)

##### Where the title goes

- The title always links to the post itself. (v0.1.0)

#### Secondary link

Part of the title block. The line under the title that shows where a post points.

##### What it says

- It's written as **Source: example.com/path**. (v0.1.0)
- If the link goes to the same site as the post or the publication, it's written as **A follow-up to example.com/path**. (v0.1.0)
- The address drops `https://`, `www.`, and a trailing slash. (v0.1.0)

##### When it's hidden

- The link goes where the title goes: hidden. (v0.1.0)
- The link has the same path as the post on the publication's own site: hidden. (v0.1.0)
- There's no address: hidden. (v0.1.0)
- The eyebrow became the link: hidden. (v0.1.0)
- The title is hidden: hidden, and **View original** takes the link. (v0.1.0)

## Footnotes

Footnotes from Markdown-style posts and other publishers.

### Opening a note

- A footnote number opens the note under its paragraph. (v0.1.0)
- The note has a **Footnote N** header and a **Close** button, where N is that note's number. (v0.1.0)
- A note inside a list item opens at the end of that item. (v0.1.0)
- A note inside a table opens right after the table. (v0.1.0)
- Opening another note closes the first. (v0.1.0)
- A note stays open when you select elsewhere or follow a link. (v0.2.0)
- A **Go to footnotes** link in the note scrolls to the footnotes list. (v0.2.0)

### The list at the end

- A **Footnotes** heading goes above the list. (v0.1.0)
- Each note gets a **Footnote N** label. (v0.1.0)
- Selecting the label goes back to that line. (v0.1.0)
- List numbers are hidden. (v0.1.0)
- A plain list of notes that superscript numbers point to counts as a footnotes list. (v0.1.0)
- A number with no id of its own gets one, so the label can link back. (v0.1.0)

### Substack footnotes

- Substack's numbered markers and notes get the same treatment as other footnotes. (v0.2.0)
- A **Footnotes** heading goes above the notes at the end. (v0.2.0)
- Each note is headed **Footnote N**, which links back to its line. The number link is hidden. (v0.2.0)
- The panel shows just the note's text, and **Go to footnotes** scrolls to the heading. (v0.2.0)

### Publisher leftovers

- Return arrows in a note are hidden. (v0.1.0)
- Return emoji in a note are hidden. (v0.1.0)
- Back links that point nowhere are hidden. (v0.1.0)

## Publisher clean-up

Things publishing tools add that the reader doesn't need.

### Blank blocks

- Empty paragraphs and blocks are hidden. (v0.1.0)
- Blocks with text or media stay. (v0.1.0)

### Google

- "Add as a preferred source on Google" buttons are hidden, and so is the paragraph around them when the button is all it holds. (v0.2.0)

### WordPress

- A WordPress embed (a post quoting another post) shows its preview card. The plain link above it, which says the same thing, is hidden. (v0.2.0)
- The plain link stays if there is no card after it. (v0.2.0)
- The "The post X appeared first on Y" line WordPress adds at the very end is hidden. It needs two links and must be the last paragraph. (v0.2.0)
- Spacer blocks are hidden. (v0.1.0)

### Substack

- The restack and expand buttons on images are hidden. (v0.1.0)
- Only buttons directly inside Substack's image box are hidden. (v0.1.0)

## Languages

- The phrases Daisy adds follow the system language: "for", "View original", "Source:", "A follow-up to", "View post", "Footnote", "Close", and "Footnotes". (v0.1.0)
- Phrases are rewritten for each language, not translated word for word. (v0.1.0)
- The word joining author and publication changes by language: "para", "für", "pour", and so on. (v0.1.0)
- Where a language has no natural joining word, a "·" is used instead. (v0.1.0)
- "Name on Mastodon" and "Name on Bluesky" use each language's own word for "on". (v0.1.0)
- **Go to footnotes** follows the system language too. (v0.2.0)
- Relative times use each language's own grammar, like "Hace 3 días" and "Vor 3 Tagen". (v0.1.0)
- Norwegian days are written as "for 3 dager siden", since the built-in wording reads oddly. (v0.1.0)
- Japanese and Chinese drop the space after a number, and labels start with a capital letter where the language has them. (v0.1.0)
- Timestamps written in the system language are read correctly, including native digits, 12- and 24-hour clocks, and the Buddhist calendar. (v0.1.0)
- Languages without a translation fall back to English. (v0.1.0)

## Publications and platforms

Every site Daisy has been reviewed against and has a rule for. Publications are
individual feeds. Platforms are the services and tools many feeds are built on.
New site-specific rules get a row here.

### Publications

| Publication | What Daisy does | Rules | Since |
| --- | --- | --- | --- |
| [Daring Fireball](https://daringfireball.net) | Moves sponsor and show labels to the eyebrow, and shows link posts and follow-ups in the secondary link | [Sponsors](#sponsors), [Podcasts and series](#podcasts-and-series), [Secondary link](#secondary-link) | v0.1.0 |
| [Kottke](https://kottke.org) | Hides titles that are the start of the post, cut off with "…" | [Hidden titles](#hidden-titles) | v0.1.0 |
| [Manton Reece](https://manton.org) | Hides empty titles, and shows the name once when author and publication match | [Hidden titles](#hidden-titles), [Author and publication](#author-and-publication) | v0.1.0 |
| [Six Colors](https://sixcolors.com) | Simplifies sponsor, podcast, and issue-number titles | [Sponsors](#sponsors), [Podcasts and series](#podcasts-and-series), [Numbered series](#numbered-series) | v0.1.0 |
| [Snake](https://snake.substack.com/) | Simplifies sponsor, podcast, and issue-number titles | [Sponsors](#sponsors), [Podcasts and series](#podcasts-and-series), [Numbered series](#numbered-series) | v0.1.0 |
| [MacStories](https://www.macstories.net) | Moves a "[Sponsor]" tag at the end of a title to the eyebrow | [Sponsors](#sponsors) | v0.2.0 |
| [9to5Mac](https://9to5mac.com) | Moves the name and date of a daily edition to the eyebrow, and hides the "Add as a preferred source on Google" button | [Dated editions](#dated-editions), [Google](#google) | v0.2.0 |
| [Jeffrey Zeldman Presents](https://zeldman.com) | Shows embedded posts as a preview card without the repeated link, and hides the "appeared first on" line | [WordPress](#wordpress) | v0.2.0 |

### Platforms and tools

| Platform | What Daisy does | Rules | Since |
| --- | --- | --- | --- |
| [Mastodon](https://joinmastodon.org) | Writes the byline as "Name on Mastodon" and hides the title | [Mastodon and Bluesky](#mastodon-and-bluesky), [Hidden titles](#hidden-titles) | v0.1.0 |
| [Bluesky](https://bsky.app) | Writes the byline as "Name on Bluesky" and hides the title | [Mastodon and Bluesky](#mastodon-and-bluesky), [Hidden titles](#hidden-titles) | v0.1.0 |
| [Micro.blog](https://micro.blog) | Hides empty titles | [Hidden titles](#hidden-titles) | v0.1.0 |
| [WordPress](https://wordpress.org) | Hides spacer blocks, and recognizes its footnote lists | [WordPress](#wordpress), [The list at the end](#the-list-at-the-end) | v0.1.0 |
| [Substack](https://substack.com) | Hides image buttons, and handles its footnotes | [Substack](#substack), [Substack footnotes](#substack-footnotes) | v0.1.0 |
| [Blogger](https://www.blogger.com) | Hides blank spacer blocks | [Blank blocks](#blank-blocks) | v0.1.0 |
| [Tumblr](https://www.tumblr.com) | Hides blank spacer blocks | [Blank blocks](#blank-blocks) | v0.1.0 |
| [Squarespace](https://www.squarespace.com) | Hides blank spacer blocks | [Blank blocks](#blank-blocks) | v0.1.0 |
| [Google](https://google.com) | Hides "Add as a preferred source" buttons | [Google](#google) | v0.2.0 |
