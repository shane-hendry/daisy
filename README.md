<!-- nnw-theme-identity:start -->
# Daisy & Daisy Sans

![Daisy in NetNewsWire](screenshots/daisy-hero.png)

Two [NetNewsWire](https://netnewswire.com/) themes by [Shane Hendry](https://shanehendry.com/), with a cohesive house style across every feed you follow. One design, two appearances:

- **Daisy** is set in New York, a refined serif
- **Daisy Sans** is set in SF Pro, a modern sans serif

Learn more at [daisyrss.com](https://daisyrss.com), and read about [how I designed them](https://shanehendry.com/daisy).
<!-- nnw-theme-identity:end -->

## Daisy's house style

What sets Daisy apart is its house style for article headers. Every post
opens the same way, so a mixed feed is easy to scan and predictable to swipe through.

It’s all done with built-in [JavaScript rules.](docs/content-rules.md) No AI is involved.
The rules mostly clean up bylines and titles, hiding duplicates and sloppy data.

* Simple, consistent bylines, even for multiple authors
* Consistent title blocks with conditional eyebrows and secondary links
* Better layouts for social media accounts
  
Feeds that inspired some special rules:
  
* Titles are deduped when the body begins with them, like [Kottke's](https://kottke.org/) quick links
* [Techmeme's](https://www.techmeme.com) titles are deduped from the body
* [Daring Fireball](https://daringfireball.net/) inspired styling back-links as "A follow-up to..." (I hope John approves)
  
Read more about [how the themes work,](https://shanehendry.com/daisy/) and it's all documented in [content design](docs/content-design.md) and [content rules](docs/content-rules.md).

### Other niceties

* Clear, interactive footnotes
* Relative datelines that reveal the exact time on tap
* Cleaner Wordpress, Substack, and Lemmy layouts
* Minimal UI so the words do all the work
* Support for 30+ languages, right-to-left languages, and XXXXXL font sizes

## Install

Daisy and Daisy Sans are in beta. [Version 0.7.0](https://github.com/shane-hendry/daisy/releases/tag/v0.7.0) is the latest release.

1. Download the theme (or both), then open the zip:
   - [Daisy](https://github.com/shane-hendry/daisy/releases/download/v0.7.0/Daisy.nnwtheme.zip)
   - [Daisy Sans](https://github.com/shane-hendry/daisy/releases/download/v0.7.0/Daisy.Sans.nnwtheme.zip)
2. On your Mac, drag the **.nnwtheme** file onto the NetNewsWire dock icon. On iPhone and iPad, save them to Files, then open NetNewsWire, go to **Settings → Theme → +**.
3. Select **Daisy** or **Daisy Sans** from the list.

## Update notices (experimental while in beta)

For 36 hours after a new release, a note to update your theme can appear at the end of an article.

To be as unobtrusive as possible, only articles less than 2 days old with over 500 words ever look for updates, by fetching updates.json from daisyrss.com. No cookies, referrer information, or feed/article information is sent, but like any website, it sees your IP address.

## Credits

I designed Daisy and Daisy Sans, using [Dave Marquard's](https://github.com/dave-atx) [NetNewsWire theme template](https://github.com/dave-atx/netnewswire-theme-template), with the help of claude code. They aren't affiliated with or endorsed by NetNewsWire or any of the authors or publications whose feeds the themes have rules for.
Learn more about 
[NetNewsWire's themes format](https://github.com/Ranchero-Software/NetNewsWire/blob/main/Technotes/Themes.md).

## License

Daisy and Daisy Sans are open source under [Apache 2.0](LICENSE). Use 'em, tweak 'em, make 'em your own.
