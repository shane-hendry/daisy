    // Shared by the scripts below: the reader's language and the words for it.
    var daisy = { lang: "en", words: null };
    // Reader view hands over the whole article inside one or two wrapper divs
    // (<div><div class="page">…</div></div>). The stylesheet's rules for full-width pictures
    // and spacing look at the article's direct children, so the wrappers are removed and
    // their content takes their place.
    (function () {
      var body = document.querySelector(".articleBody");
      for (var depth = 0; body && depth < 3; depth++) {
        var only = body.firstElementChild;
        if (!only || body.childElementCount !== 1 || only.tagName !== "DIV" || only.classList.contains("image-text")) return;
        var stray = Array.prototype.some.call(body.childNodes, function (n) {
          return n.nodeType === 3 && n.nodeValue.trim();
        });
        if (stray) return;
        while (only.firstChild) body.insertBefore(only.firstChild, only);
        body.removeChild(only);
      }
    })();
    // A short single paragraph followed by a list is almost always that list's label
    // ("Sponsored by:"), so it sits close to the list instead of a paragraph away.
    document.querySelectorAll(".articleBody p").forEach(function (p) {
      var next = p.nextElementSibling;
      if (!next || !/^(UL|OL)$/.test(next.tagName) || p.classList.contains("blank")) return;
      var text = p.textContent.replace(/\s+/g, " ").trim();
      if (!text || text.length > 90 || p.querySelector("img, video, audio, iframe, br")) return;
      p.classList.add("list-label");
    });
    // Table alignment. A cell the author aligned (align attribute or inline style) keeps
    // that alignment, and the header cell above it follows its column. A column of numbers
    // the author left alone is aligned to the right, header included, so digits line up.
    (function () {
      var numeric = /^[\s$€£¥+\-−–~]*\d[\d.,]*\s*(%|[a-zA-Z]{1,3})?$/;
      function explicit(cell) {
        return cell.hasAttribute("align") || !!cell.style.textAlign;
      }
      function aligned(cell) {
        return cell.getAttribute("align") || cell.style.textAlign;
      }
      document.querySelectorAll(".articleBody table").forEach(function (table) {
        if (table.querySelector("[colspan], [rowspan]")) return;
        var cols = 0;
        for (var r = 0; r < table.rows.length; r++) cols = Math.max(cols, table.rows[r].cells.length);
        for (var c = 0; c < cols; c++) {
          var cells = [], body = [];
          for (var i = 0; i < table.rows.length; i++) {
            var cell = table.rows[i].cells[c];
            if (!cell) continue;
            cells.push(cell);
            if (cell.tagName === "TD" && cell.parentNode.parentNode.tagName === "TBODY") body.push(cell);
          }
          if (!body.length) continue;
          var given = null;
          body.forEach(function (cell) { if (!given && explicit(cell)) given = aligned(cell); });
          var side = given;
          if (!side) {
            var filled = body.filter(function (cell) { return cell.textContent.trim() !== ""; });
            if (filled.length && filled.every(function (cell) { return numeric.test(cell.textContent.trim()); })) side = "right";
          }
          if (!side || /^(left|start)$/.test(side)) continue;
          cells.forEach(function (cell) {
            if (explicit(cell)) return;
            if (/^(right|end)$/.test(side)) cell.classList.add("col-end");
            else cell.style.textAlign = side;
          });
        }
      });
    })();
    // Wide content scrolls on its own, never the page. Tables that need to scroll are
    // sized so a column is cut off by the screen edge, which shows there is more.
    // Anything else wider than the screen is wrapped so it scrolls by itself.
    (function () {
      var root = document.documentElement;
      var running = false;
      function cutFraction(wrapper, row) {
        var edge = wrapper.clientWidth;
        var left0 = wrapper.getBoundingClientRect().left;
        for (var i = 0; i < row.cells.length; i++) {
          var r = row.cells[i].getBoundingClientRect();
          var l = r.left - left0, rr = r.right - left0;
          if (l < edge && rr > edge) return (edge - l) / (rr - l);
        }
        return 0;
      }
      function tuneTable(wrapper) {
        var table = wrapper.querySelector("table");
        if (!table || !table.rows.length) return;
        table.style.fontSize = "";
        var edge = wrapper.clientWidth;
        var tableRight = function () { return table.getBoundingClientRect().right - wrapper.getBoundingClientRect().left; };
        if (tableRight() <= edge + 1) return;
        var row = table.rows[0];
        for (var i = 0; i < table.rows.length; i++) {
          if (table.rows[i].cells.length > row.cells.length) row = table.rows[i];
        }
        var good = function () { var f = cutFraction(wrapper, row); return f >= 0.3 && f <= 0.7; };
        if (good()) return;
        var base = parseFloat(getComputedStyle(table).fontSize);
        var large = edge / parseFloat(getComputedStyle(root).fontSize) < 14;
        for (var step = 1; step <= 14; step++) {
          var factors = large ? [1 + step * 0.01] : [1 + step * 0.01, 1 - step * 0.01];
          for (var k = 0; k < factors.length; k++) {
            table.style.fontSize = (base * factors[k]) + "px";
            if (tableRight() > edge + 1 && good()) return;
          }
        }
        table.style.fontSize = "";
      }
      function containOverflow() {
        var limit = root.clientWidth;
        var offenders = [];
        document.querySelectorAll(".articleBody *, .article-header *").forEach(function (el) {
          if (el.closest(".nnw-overflow, .scroll-x, .newsfoot-footnote-popover")) return;
          // Skip anything inside an element that already scrolls (a code block, say).
          for (var up = el.parentElement; up && up !== document.body; up = up.parentElement) {
            if (getComputedStyle(up).overflowX !== "visible") return;
          }
          if (/^(PRE)$/.test(el.tagName) && getComputedStyle(el).overflowX !== "visible") return;
          if (el.getBoundingClientRect().right <= limit + 1) return;
          for (var i = 0; i < offenders.length; i++) if (offenders[i].contains(el)) return;
          offenders.push(el);
        });
        offenders.forEach(function (el) {
          var wrap = document.createElement("div");
          wrap.className = "scroll-x";
          el.parentNode.insertBefore(wrap, el);
          wrap.appendChild(el);
        });
      }
      function layout() {
        if (running) return;
        running = true;
        try {
          document.querySelectorAll(".nnw-overflow").forEach(tuneTable);
          containOverflow();
        } finally {
          running = false;
        }
      }
      layout();
      window.addEventListener("load", layout);
      var timer;
      window.addEventListener("resize", function () { clearTimeout(timer); timer = setTimeout(layout, 50); });
    })();
    // The footnotes section at the end: a "Footnotes" heading, and each note headed
    // "Footnote 1", a link back to that line in the article. The numbered list
    // markers and the original return arrows are hidden by the stylesheet.
    (function () {
      var words = daisy.words || ["", "", "", "Footnote", "Close", "Footnotes"];
      var joiner = /^(ja|zh)/i.test(daisy.lang) ? "" : " ";
      var headed = [];
      // A plain list of notes (a WordPress list block, say) whose items are the targets
      // of superscript markers in the text is a footnotes list too.
      document.querySelectorAll("sup a[href^='#'], a.footnote[href^='#']").forEach(function (marker) {
        var note = document.getElementById(decodeURIComponent(marker.hash.slice(1)));
        var list = note && note.closest("li") && note.closest("li").closest("ol, ul");
        if (list && !list.contains(marker) && !list.closest(".footnotes, .wp-block-footnotes")) {
          list.classList.add("wp-block-footnotes");
        }
      });
      function referenceFor(id) {
        var links = document.querySelectorAll("a[href*='#']");
        for (var i = 0; i < links.length; i++) {
          var a = links[i];
          if (a.closest(".footnotes, .wp-block-footnotes") || !a.hash) continue;
          if (decodeURIComponent(a.hash.slice(1)) === id) return a;
        }
        return null;
      }
      document.querySelectorAll(".footnotes li[id], .wp-block-footnotes li[id]").forEach(function (li, index) {
        var marker = referenceFor(li.id);
        if (!marker) return;
        var anchor = marker.closest("sup") || marker;
        // Some publishers give the marker no id even though the note's return arrow
        // points at one ("fnref:1"); give the marker an id so the label can link to it.
        if (!anchor.id && !marker.id) anchor.id = "daisy-fnref-" + (index + 1);
        var refId = anchor.id || marker.id;
        var guess = li.id.replace(/^fn/, "fnref");
        var holder = li.closest(".footnotes, .wp-block-footnotes");
        if (headed.indexOf(holder) < 0) {
          headed.push(holder);
          var list = li.closest("ol, ul");
          var title = document.createElement("h2");
          title.className = "footnotes-title";
          title.textContent = words[5];
          list.parentNode.insertBefore(title, list);
          // Some publishers (Kottke) give the list no rule above it. Add one so the section
          // looks like every other: the stylesheet spaces an hr directly before the heading.
          var before = title.previousElementSibling;
          if (!before || before.tagName !== "HR") {
            // A short paragraph right before the list was tagged as the list's label and
            // sits tight to it; with the rule between them it takes normal spacing again.
            var rule = document.createElement("hr");
            title.parentNode.insertBefore(rule, title);
            Array.prototype.forEach.call(document.querySelectorAll("p.list-label"), function (label) {
              if (label.nextElementSibling === rule || label.parentNode.nextElementSibling === rule.parentNode) {
                label.classList.remove("list-label");
              }
            });
          }
        }
        var number = marker.textContent.trim() || String(index + 1);
        var label = document.createElement("a");
        label.className = "footnote-label footnote-return";
        label.href = "#" + refId;
        label.textContent = words[3] + joiner + number;
        // Take the reader to that line, leaving it a third of the way down the screen
        // so it isn't hidden under the app's top bar.
        label.addEventListener("click", function (ev) {
          var line = document.getElementById(refId);
          if (!line) return;
          ev.preventDefault();
          ev.stopImmediatePropagation();
          window.scrollTo({ top: Math.max(0, line.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3) });
          // A tinted circle appears on the marker at once, holds, then fades, so the
          // reader can find it. It sits in the page (not on the marker), so it never
          // shifts the text.
          var r = line.getBoundingClientRect();
          var size = Math.round((Math.max(r.width, r.height) + 14) * 0.85);
          var dot = document.createElement("div");
          dot.className = "footnote-locator";
          dot.setAttribute("aria-hidden", "true");
          dot.style.width = dot.style.height = size + "px";
          dot.style.left = (r.left + window.scrollX + r.width / 2 - size / 2) + "px";
          dot.style.top = (r.top + window.scrollY + r.height / 2 - size / 2) + "px";
          dot.addEventListener("animationend", function () { dot.remove(); });
          document.documentElement.appendChild(dot);
        });
        li.insertBefore(label, li.firstChild);
        // Any other link in the note that leads back to the reference (a return arrow
        // or emoji, whatever the publisher uses) is hidden: the label does that job.
        li.querySelectorAll("a[href*='#']").forEach(function (a) {
          if (a === label || !a.hash) return;
          var target = decodeURIComponent(a.hash.slice(1));
          if (target === refId || target === marker.id || target === anchor.id || target === guess) {
            a.classList.add("footnote-backlink");
          }
        });
      });
    })();
    // Substack's footnotes: each note is a <div class="footnote"> at the end holding a
    // numbered link (a.footnote-number) and its text (.footnote-content). They get the same
    // "Footnotes" heading, rule and "Footnote 1" labels as a list, and the number link is hidden.
    (function () {
      var words = daisy.words || ["", "", "", "Footnote", "Close", "Footnotes"];
      var joiner = /^(ja|zh)/i.test(daisy.lang) ? "" : " ";
      var notes = document.querySelectorAll(".articleBody div.footnote");
      var first = null;
      Array.prototype.forEach.call(notes, function (note) {
        var number = note.querySelector(":scope > a.footnote-number[id]");
        var content = note.querySelector(":scope > .footnote-content");
        if (!number || !content) return;
        var marker = document.getElementById(decodeURIComponent((number.hash || "").slice(1)));
        if (!marker) return;
        if (!first) {
          first = note;
          var rule = document.createElement("hr");
          var title = document.createElement("h2");
          title.className = "footnotes-title";
          title.textContent = words[5];
          note.parentNode.insertBefore(rule, note);
          note.parentNode.insertBefore(title, note);
        }
        var label = document.createElement("a");
        label.className = "footnote-label footnote-return";
        label.href = "#" + marker.id;
        label.textContent = words[3] + joiner + number.textContent.trim();
        label.addEventListener("click", function (ev) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          window.scrollTo({ top: Math.max(0, marker.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3) });
        });
        number.classList.add("footnote-backlink");
        // The label sits just before the note, not inside it, so the note's own text stays clean.
        note.parentNode.insertBefore(label, note);
      });
    })();
    // Return links left in a note, whatever the publisher built them from: an arrow or
    // emoji glyph alone, or a link to a spot that isn't in the article. The "Footnote 1"
    // header does that job, so they're hidden.
    (function () {
      document.querySelectorAll(".footnotes li a[href*='#'], .wp-block-footnotes li a[href*='#']").forEach(function (a) {
        if (a.classList.contains("footnote-label") || !a.hash) return;
        var glyph = /^[\s\u2190-\u21ff\u2934\u2935\u2b05-\u2b07\u23ce\ufe0e\ufe0f\u{1f519}\u{1f51d}]+$/u.test(a.textContent);
        var title = /return|back/i.test(a.getAttribute("title") || "");
        var dead = !document.getElementById(decodeURIComponent(a.hash.slice(1)));
        if (glyph || (title && dead) || (title && !a.textContent.trim().replace(/\W/g, ""))) {
          a.classList.add("footnote-backlink");
        }
      });
    })();
    // A footnote marker never wraps onto a line of its own: it is glued to the character
    // before it with a word joiner (so "September." and its marker move together, and the
    // whole last word comes with them). A space left between the text and the marker is
    // removed first, since the line could break there. A marker that starts its block, or
    // follows another element or a line break, is left as it is.
    (function () {
      var markers = document.querySelectorAll(".articleBody sup a[href*='#'], .articleBody a.footnote, .articleBody a.footnote-anchor, .articleBody a[id^='footnote-anchor-']");
      markers.forEach(function (a) {
        if (a.closest(".footnotes, .wp-block-footnotes, .footnote-panel") || a.matches(".footnote-label, .footnote-backlink, a.footnote-number")) return;
        var unit = a.closest("sup") || a;
        var before = unit.previousSibling;
        if (!before || before.nodeType !== 3) return;
        before.data = before.data.replace(/[ \t\r\n]+$/, "");
        if (!before.data) return;
        unit.parentNode.insertBefore(document.createTextNode("⁠"), unit);
      });
    })();
    // A block quote that fits on one line gets the class "single-line", so its bar can run
    // the full height of the line (a bar only as tall as the letters looks like a typed
    // pipe). CSS can't tell how many lines a block quote has. It is measured again when
    // the column changes width or the text size changes.
    (function () {
      var quotes = document.querySelectorAll(".articleBody blockquote");
      if (!quotes.length) return;
      function measure() {
        quotes.forEach(function (q) {
          var line = parseFloat(getComputedStyle(q).lineHeight);
          if (!line) return;
          q.classList.toggle("single-line", q.getBoundingClientRect().height < line * 1.5);
        });
      }
      measure();
      window.addEventListener("resize", measure);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    })();
    // Footnotes open as a note panel under the paragraph, in the style of a block
    // quote, with a "Footnote 1" header and a close button. It shows and hides
    // instantly, and stays open until the reader closes it (its marker or its Close
    // button) or opens another footnote; tapping elsewhere or following a link leaves it open. This replaces NetNewsWire's floating popover; the note text lives in
    // .newsfoot-footnote-popover so NetNewsWire's own checks still find it.
    (function () {
      var words = daisy.words || ["", "", "", "Footnote", "Close", "Footnotes", "", "", "", "", "Go to footnotes"];
      var opened = [];
      var MARKER = "a.footnote, sup > a[href*='#fn'], sup > div > a[href*='#fn'], a[id^='footnote-anchor-']";

      function noteFor(marker) {
        if (!marker.hash) return null;
        var target = document.getElementById(decodeURIComponent(marker.hash.slice(1)));
        if (!target) return null;
        if (target.matches("a.footnote-number")) {
          var text = target.parentNode.querySelector(".footnote-content");
          return text ? text.innerHTML : null;
        }
        if (marker.matches("a[id^='footnote-anchor-']")) {
          var html = "";
          for (var node = target.nextElementSibling; node && !node.matches("a[id^='footnote-']"); node = node.nextElementSibling) {
            html += node.outerHTML;
          }
          return html;
        }
        return target.innerHTML;
      }

      function place(panel, marker) {
        var block = marker.closest("p, li, blockquote, h2, h3, h4, h5, h6, dt, dd, figcaption, td, th");
        if (!block) block = marker.parentElement;
        if (block.matches("li")) {
          block.appendChild(panel);
        } else if (block.matches("td, th")) {
          var table = block.closest("table");
          var holder = table.closest(".nnw-overflow") || table;
          holder.parentNode.insertBefore(panel, holder.nextSibling);
        } else {
          block.parentNode.insertBefore(panel, block.nextSibling);
        }
      }

      function close(entry) {
        opened.splice(opened.indexOf(entry), 1);
        entry.marker.setAttribute("aria-expanded", "false");
        entry.panel.remove();
      }

      function open(marker, html) {
        var number = marker.textContent.trim();
        var label = words[3] + (/^(ja|zh)/i.test(daisy.lang) ? "" : " ") + number;
        var panel = document.createElement("section");
        panel.className = "footnote-panel";
        panel.setAttribute("role", "note");
        panel.setAttribute("aria-label", label);
        panel.innerHTML = '<div class="footnote-panel-header">' +
          '<span class="footnote-panel-title"></span>' +
          '<button type="button" class="footnote-panel-close"></button></div>' +
          '<div class="footnote-panel-body newsfoot-footnote-popover"></div>' +
          '<a class="footnote-panel-goto" href="#"></a>';
        panel.querySelector(".footnote-panel-title").textContent = label;
        var button = panel.querySelector(".footnote-panel-close");
        button.textContent = words[4];
        var entry = { marker: marker, panel: panel };
        button.addEventListener("click", function (ev) { ev.stopPropagation(); close(entry); });
        var body = panel.querySelector(".footnote-panel-body");
        body.innerHTML = html;
        // "Go to footnotes" takes the reader down to the footnotes section, leaving its
        // heading a third of the way down the screen like the "Footnote 1" links do.
        var goto = panel.querySelector(".footnote-panel-goto");
        var note = marker.hash && document.getElementById(decodeURIComponent(marker.hash.slice(1)));
        var holder = note && note.closest(".footnotes, .wp-block-footnotes");
        var destination = holder ? (holder.querySelector(".footnotes-title") || holder) :
          note && note.matches("a.footnote-number") ? document.querySelector(".footnotes-title") || note : note;
        if (destination) {
          goto.textContent = words[10] || "Go to footnotes";
          goto.addEventListener("click", function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            window.scrollTo({ top: Math.max(0, destination.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3) });
          });
        } else {
          goto.remove();
        }
        place(panel, marker);
        marker.setAttribute("aria-expanded", "true");
        opened.push(entry);
      }

      document.addEventListener("click", function (ev) {
        var anchor = ev.target instanceof Element ? ev.target.closest("a") : null;
        if (anchor && anchor.matches(MARKER)) {
          var html = noteFor(anchor);
          if (html !== null) {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            var shown = opened.filter(function (entry) { return entry.marker === anchor; })[0];
            opened.slice().forEach(close);
            if (!shown) open(anchor, html);
          }
        }
      }, true);

      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape" && opened.length) close(opened[opened.length - 1]);
      });
    })();
    // Stray spacing publishers leave in the markup. A line break at the very start or end of a
    // block ("<p><br><a>See Plans</a></p>") would add an empty line, so it is removed. A
    // non-breaking space or other invisible text loose between blocks ("</p> &nbsp; <p>")
    // would add a blank line of its own, so it is removed too. Three or more line breaks in a
    // row are cut back to two. Only invisible leftovers go: text and media are never touched.
    (function () {
      var blocks = "p, div, li, blockquote, h1, h2, h3, h4, h5, h6, dt, dd, figcaption, td, th, summary";
      var invisible = /^[\s\u00a0\u200b\u200c\u200d\u2060\ufeff]*$/;
      var isBlank = function (n) { return n.nodeType === 3 && invisible.test(n.data); };
      document.querySelectorAll(".articleBody").forEach(function (body) {
        body.querySelectorAll(blocks).forEach(function (el) {
          var kids = function (fromEnd) {
            var n = fromEnd ? el.lastChild : el.firstChild;
            while (n && (isBlank(n) || (n.nodeType === 8))) n = fromEnd ? n.previousSibling : n.nextSibling;
            return n;
          };
          var edge;
          while ((edge = kids(false)) && edge.nodeType === 1 && edge.tagName === "BR") edge.remove();
          while ((edge = kids(true)) && edge.nodeType === 1 && edge.tagName === "BR") edge.remove();
        });
        body.querySelectorAll("br + br + br").forEach(function (br) { br.remove(); });
        body.querySelectorAll("*").forEach(function (el) {
          if (!el.querySelector(":scope > :is(p, div, ul, ol, blockquote, h1, h2, h3, h4, h5, h6, table, figure, pre, hr, section, nav)")) return;
          Array.prototype.slice.call(el.childNodes).forEach(function (n) {
            if (n.nodeType === 3 && /[\u00a0\u200b\u200c\u200d\u2060\ufeff]/.test(n.data) && invisible.test(n.data)) n.remove();
          });
        });
      });
    })();
    // WordPress ends each feed item with "The post <title> appeared first on <blog>.", a
    // line the blog never shows and the author didn't write. The last paragraph is tagged so
    // the stylesheet can hide it. The wording differs by site language, so the common
    // translations are matched too. It needs two links (the post and the blog).
    (function () {
      var last = document.querySelector(".articleBody > p:last-of-type");
      if (!last || last.nextElementSibling && last.nextElementSibling.textContent.trim()) return;
      var credit = /^\s*(The post|Der Beitrag|L[\u2019']article|La entrada|Il post|O post|Het bericht|Inl\u00e4gget|Indl\u00e6gget)\b[\s\S]{1,300}\b(appeared first on|erschien zuerst auf|est apparu en premier sur|apareci\u00f3 primero en|\u00e8 apparso per primo su|apareceu primeiro em|verscheen eerst op|dök upp först på|dukkede op f\u00f8rst p\u00e5)\b[\s\S]{1,200}$/i;
      if (credit.test(last.textContent) && last.querySelectorAll("a").length >= 2) {
        last.classList.add("feed-credit");
      }
    })();
    // Medium repeats the title at the top of the body ("Stories by Name on Medium" feeds): when one of
    // the first blocks says exactly the title, it is removed. Sample: fixtures/medium-feed.toml.
    (function () {
      var feedEl = document.querySelector(".attribution .feed");
      var heading = document.querySelector(".article-header h1");
      var body = document.querySelector(".articleBody");
      if (!feedEl || !heading || !body) return;
      if (!/\son\s+medium\s*$/i.test(feedEl.textContent) && !/(^|\.)medium\.com\//i.test((feedEl.getAttribute("href") || "").replace(/^https?:\/\//, ""))) return;
      var norm = function (t) { return t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""); };
      var title = norm(heading.textContent);
      if (!title) return;
      var seen = 0;
      Array.prototype.some.call(body.children, function (el) {
        if (!el.textContent.trim()) return false;
        if (norm(el.textContent) === title && !el.querySelector("img, video, iframe")) { el.remove(); return true; }
        return ++seen >= 3;
      });
    })();
    // Fonts In Use opens with "Contributed by <a>Name</a><br><a><img></a>" as loose text in the body.
    // The text before the first line break becomes a paragraph of its own when an image follows it, so
    // it is spaced like any paragraph. Sample: fixtures/contributed-by-images.toml.
    (function () {
      var body = document.querySelector(".articleBody");
      if (!body) return;
      var run = [], n = body.firstChild;
      while (n && n.nodeName !== "BR" && !(n.nodeType === 1 && /^(P|DIV|FIGURE|UL|OL|BLOCKQUOTE|H[1-6]|TABLE|PRE|IMG)$/.test(n.nodeName))) { run.push(n); n = n.nextSibling; }
      if (!n || n.nodeName !== "BR" || !run.some(function (r) { return r.textContent.trim(); })) return;
      var next = n.nextSibling;
      while (next && next.nodeType === 3 && !next.nodeValue.trim()) next = next.nextSibling;
      if (!next || !(next.nodeName === "IMG" || (next.nodeName === "A" && next.querySelector("img")))) return;
      var para = document.createElement("p");
      body.insertBefore(para, run[0]);
      run.forEach(function (r) { para.appendChild(r); });
      body.removeChild(n);
    })();
    // Blank paragraphs and divs (publishers' spacers) are hidden; anything with text
    // or media stays.
    document.querySelectorAll(".articleBody p, .articleBody div").forEach(function (el) {
      if (!el.textContent.trim() &&
          !el.querySelector("img, video, audio, iframe, svg, picture, canvas, object, embed, hr, table, input")) {
        el.classList.add("blank");
      }
    });
    // The first block that is left is .lead: the stylesheet spaces it from the title.
    Array.prototype.some.call(document.querySelectorAll(".articleBody > *"), function (el) {
      if (el.classList.contains("blank")) return false;
      el.classList.add("lead");
      return true;
    });
    // A leading non-breaking space (an editor's way of indenting) would shift the first line.
    document.querySelectorAll(".articleBody p, .articleBody div").forEach(function (p) {
      var first = p.firstChild;
      if (first && first.nodeType === 3) first.nodeValue = first.nodeValue.replace(/^[\s\u00a0]+/, "");
    });
    // A paragraph or div holding an image and text (a caption written into the same block)
    // is tagged for the stylesheet. Non-breaking spaces and blanks around the image are
    // removed first, since they would indent the first line.
    document.querySelectorAll(".articleBody p, .articleBody div").forEach(function (p) {
      var kids = Array.prototype.slice.call(p.childNodes);
      var isMedia = function (n) {
        return n && n.nodeType === 1 &&
          (n.tagName === "IMG" || (n.tagName === "A" && n.children.length === 1 && n.firstElementChild.tagName === "IMG"));
      };
      if (!kids.some(isMedia)) return;
      kids.forEach(function (n, i) {
        if (n.nodeType !== 3) return;
        var near = isMedia(kids[i - 1]) || isMedia(kids[i + 1]) || i === 0;
        if (near) n.nodeValue = n.nodeValue.replace(i === 0 ? /^[\s\u00a0]+/ : /^[\s\u00a0]+|[\s\u00a0]+$/g, "");
        if (!n.nodeValue) p.removeChild(n);
      });
      var rest = p.cloneNode(true);
      rest.querySelectorAll("img").forEach(function (img) { img.remove(); });
      if (!rest.textContent.replace(/[\s\u00a0]+/g, "")) return;
      p.classList.add("image-text");
      Array.prototype.forEach.call(p.childNodes, function (n) {
        if (isMedia(n) && n.previousSibling && !isMedia(n.previousSibling)) n.classList.add("after-text");
      });
      if (isMedia(p.firstChild)) p.classList.add("media-first");
      if (isMedia(p.lastChild)) p.classList.add("media-last");
    });
    // A short text-only div right after an image-only div is that image's caption.
    document.querySelectorAll(".articleBody > div").forEach(function (div) {
      var text = div.textContent.replace(/[\s\u00a0]+/g, " ").trim();
      if (!text || text.length > 100 || div.querySelector("img, video, iframe, p, div, ul, ol, blockquote, table, pre, figure, hr, h1, h2, h3, h4, h5, h6")) return;
      var prev = div.previousElementSibling;
      while (prev && prev.classList.contains("blank")) prev = prev.previousElementSibling;
      if (prev && prev.tagName === "DIV" && !prev.textContent.trim() && prev.querySelector("img")) div.classList.add("media-caption");
    });
    // Arabic, Indic, Thai and CJK articles: switch off letter-spacing (see the stylesheet).
    (function () {
      var article = document.querySelector(".article");
      var title = document.querySelector(".article-header h1");
      var body = document.querySelector(".articleBody");
      if (!article || !body) return;
      var sample = ((title ? title.textContent : "") + " " + body.textContent)
        .replace(/\s+/g, "").slice(0, 400);
      if (!sample) return;
      var other = sample.match(/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿ऀ-෿฀-๿぀-ヿ㐀-䶿一-鿿가-힯]/g);
      if (other && other.length / sample.length >= 0.2) {
        article.classList.add("no-tracking");
      }
    })();
    // Posts with no title of their own are "untitled": the title is hidden and a "View
    // original" line goes at the bottom. That means a title that is empty, only the
    // start of the body ("First sentence of the post…"), the whole body, or just a
    // web address. (A link line that would sit under the title moves down too: below.)
    (function () {
      var article = document.querySelector(".article");
      var title = document.querySelector(".article-header h1 a");
      var body = document.querySelector(".articleBody");
      if (!article || !title || !body) return;
      function normalize(text) {
        return text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
          .replace(/\s+/g, " ").trim().toLowerCase();
      }
      var raw = title.textContent;
      var shown = normalize(raw);
      var bodyText = normalize(body.textContent);
      var untitled = false;
      if (!shown) {
        untitled = true;
      } else if (/^https?:\/\/\S+$/.test(shown)) {
        untitled = true;
      } else if (shown === bodyText) {
        untitled = true;
      } else {
        var match = raw.match(/^(.*?)\s*(…|\.\.\.)\s*$/);
        if (match) {
          var stem = normalize(match[1]);
          untitled = stem.length >= 8 && bodyText.indexOf(stem) === 0;
        }
      }
      if (untitled) article.classList.add("untitled");
    })();
    // Language: the words the theme adds itself ("for", "View original", relative dates)
    // follow the reader's system language. NetNewsWire already localizes the date
    // and the "Link:" label. Languages not listed here fall back to English.
    (function () {
      // [joins "Author" and "Blog", "View original", "just now", "Footnote", "Close", "Footnotes", "Source:", "A follow-up to", "on", "View post", "Go to footnotes"]
      var STRINGS = {
        en: [" for ", "View original", "Just now", "Footnote", "Close", "Footnotes", "Source:", "A follow-up to", " on ", "View post", "Go to footnotes"],
        es: [" para ", "Ver original", "Ahora mismo", "Nota al pie", "Cerrar", "Notas al pie", "Fuente:", "En seguimiento de", " en ", "Ver publicación", "Ir a las notas al pie"],
        fr: [" pour ", "Voir l’original", "À l’instant", "Note", "Fermer", "Notes", "Source :", "Suite à", " sur ", "Voir la publication", "Aller aux notes"],
        de: [" für ", "Original ansehen", "Gerade eben", "Fußnote", "Schließen", "Fußnoten", "Quelle:", "Weiterführend zu", " auf ", "Beitrag ansehen", "Zu den Fußnoten"],
        it: [" per ", "Vedi originale", "Adesso", "Nota", "Chiudi", "Note", "Fonte:", "Seguito di", " su ", "Vedi post", "Vai alle note"],
        pt: [" para ", "Ver original", "Agora mesmo", "Nota de rodapé", "Fechar", "Notas de rodapé", "Fonte:", "Em seguimento a", " no ", "Ver publicação", "Ir para as notas de rodapé"],
        nl: [" voor ", "Origineel bekijken", "Zojuist", "Voetnoot", "Sluiten", "Voetnoten", "Bron:", "Vervolg op", " op ", "Bericht bekijken", "Naar de voetnoten"],
        sv: [" för ", "Visa originalet", "Nyss", "Fotnot", "Stäng", "Fotnoter", "Källa:", "Uppföljning av", " på ", "Visa inlägg", "Gå till fotnoter"],
        da: [" for ", "Se originalen", "Lige nu", "Fodnote", "Luk", "Fodnoter", "Kilde:", "Opfølgning på", " på ", "Se indlæg", "Gå til fodnoter"],
        nb: [" for ", "Se originalen", "Akkurat nå", "Fotnote", "Lukk", "Fotnoter", "Kilde:", "Oppfølging av", " på ", "Se innlegg", "Gå til fotnoter"],
        no: [" for ", "Se originalen", "Akkurat nå", "Fotnote", "Lukk", "Fotnoter", "Kilde:", "Oppfølging av", " på ", "Se innlegg", "Gå til fotnoter"],
        nn: [" for ", "Sjå originalen", "Akkurat no", "Fotnote", "Lat att", "Fotnotar", "Kjelde:", "Oppfølging av", " på ", "Sjå innlegg", "Gå til fotnotar"],
        fi: [" · ", "Näytä alkuperäinen", "Juuri nyt", "Alaviite", "Sulje", "Alaviitteet", "Lähde:", "Jatkoa aiheelle", " · ", "Näytä julkaisu", "Siirry alaviitteisiin"],
        pl: [" dla ", "Zobacz oryginał", "Przed chwilą", "Przypis", "Zamknij", "Przypisy", "Źródło:", "W nawiązaniu do", " na ", "Zobacz wpis", "Przejdź do przypisów"],
        cs: [" pro ", "Zobrazit originál", "Právě teď", "Poznámka", "Zavřít", "Poznámky", "Zdroj:", "Navazuje na", " na ", "Zobrazit příspěvek", "Přejít na poznámky"],
        sk: [" pre ", "Zobraziť originál", "Práve teraz", "Poznámka", "Zavrieť", "Poznámky", "Zdroj:", "Nadväzuje na", " na ", "Zobraziť príspevok", "Prejsť na poznámky"],
        hu: [" · ", "Eredeti megtekintése", "Az imént", "Lábjegyzet", "Bezárás", "Lábjegyzetek", "Forrás:", "Folytatás:", " · ", "Bejegyzés megtekintése", "Ugrás a lábjegyzetekhez"],
        ro: [" pentru ", "Vezi originalul", "Chiar acum", "Notă", "Închide", "Note", "Sursa:", "În continuarea", " pe ", "Vezi postarea", "Mergi la note"],
        ru: [" для ", "Открыть оригинал", "Только что", "Сноска", "Закрыть", "Сноски", "Источник:", "В продолжение", " в ", "Открыть запись", "К сноскам"],
        uk: [" для ", "Переглянути оригінал", "Щойно", "Виноска", "Закрити", "Виноски", "Джерело:", "У продовження", " у ", "Переглянути допис", "До виносок"],
        tr: [" · ", "Orijinali görüntüle", "Az önce", "Dipnot", "Kapat", "Dipnotlar", "Kaynak:", "Devamı:", " · ", "Gönderiyi görüntüle", "Dipnotlara git"],
        el: [" για ", "Προβολή πρωτοτύπου", "Μόλις τώρα", "Υποσημείωση", "Κλείσιμο", "Υποσημειώσεις", "Πηγή:", "Συνέχεια του", " στο ", "Προβολή ανάρτησης", "Μετάβαση στις υποσημειώσεις"],
        he: [" עבור ", "הצג את המקור", "ממש עכשיו", "הערת שוליים", "סגור", "הערות שוליים", "מקור:", "המשך:", " · ", "הצג פוסט", "עבור להערות השוליים"],
        ar: [" · ", "عرض الأصل", "الآن", "حاشية", "إغلاق", "الحواشي", "المصدر:", "متابعة:", " على ", "عرض المنشور", "انتقل إلى الحواشي"],
        fa: [" · ", "مشاهده نسخه اصلی", "همین الان", "پانویس", "بستن", "پانویس‌ها", "منبع:", "پیگیری:", " در ", "مشاهده نوشته", "رفتن به پانویس‌ها"],
        hi: [" · ", "मूल देखें", "अभी अभी", "पाद-टिप्पणी", "बंद करें", "पाद-टिप्पणियाँ", "स्रोत:", "अनुवर्ती:", " पर ", "पोस्ट देखें", "पाद-टिप्पणियों पर जाएँ"],
        th: [" · ", "ดูต้นฉบับ", "เมื่อสักครู่นี้", "เชิงอรรถ", "ปิด", "เชิงอรรถ", "แหล่งที่มา:", "ต่อจาก", " บน ", "ดูโพสต์", "ไปที่เชิงอรรถ"],
        vi: [" cho ", "Xem bản gốc", "Vừa xong", "Chú thích", "Đóng", "Chú thích", "Nguồn:", "Tiếp nối", " trên ", "Xem bài viết", "Đến phần chú thích"],
        id: [" untuk ", "Lihat aslinya", "Baru saja", "Catatan kaki", "Tutup", "Catatan kaki", "Sumber:", "Menindaklanjuti", " di ", "Lihat postingan", "Buka catatan kaki"],
        ms: [" untuk ", "Lihat asal", "Baru sahaja", "Nota kaki", "Tutup", "Nota kaki", "Sumber:", "Susulan kepada", " di ", "Lihat hantaran", "Pergi ke nota kaki"],
        ja: [" · ", "元のページを表示", "たった今", "脚注", "閉じる", "脚注", "出典:", "続報:", " · ", "投稿を表示", "脚注へ移動"],
        ko: [" · ", "원문 보기", "방금", "각주", "닫기", "각주", "출처:", "후속:", " · ", "게시물 보기", "각주로 이동"],
        "zh-Hans": [" · ", "查看原文", "刚刚", "脚注", "关闭", "脚注", "来源:", "跟进:", " · ", "查看帖子", "前往脚注"],
        "zh-Hant": [" · ", "查看原文", "剛剛", "註腳", "關閉", "註腳", "來源:", "後續:", " · ", "查看貼文", "前往註腳"]
      };
      var lang = String(navigator.language || "en").replace("_", "-");
      var base = lang.toLowerCase().split("-")[0];
      var key = base === "zh" ? (/hant|tw|hk|mo/i.test(lang) ? "zh-Hant" : "zh-Hans") : base;
      var words = STRINGS[key] || STRINGS.en;
      daisy.lang = lang;
      daisy.words = words;

      var joiner = document.querySelector(".byline-for");
      if (joiner) joiner.textContent = words[0];
      var viewPost = document.querySelector(".view-post a");
      if (viewPost) viewPost.textContent = words[1];

      // Read the date NetNewsWire formatted in the system language (long date, medium
      // time) by learning that language's month names, digits and field order.
      function parseLocalized(formatted) {
        var raw = formatted.replace(/[‎‏؜]/g, "")
          .replace(/[  ]/g, " ").replace(/\s+/g, " ").trim();
        var dtf = new Intl.DateTimeFormat(lang, { dateStyle: "long", timeStyle: "medium" });
        var options = dtf.resolvedOptions();
        if (options.calendar !== "gregory" && options.calendar !== "buddhist") return NaN;
        var nf = new Intl.NumberFormat(lang, { useGrouping: false });
        var digits = {};
        for (var i = 0; i < 10; i++) digits[nf.format(i)] = String(i);
        function ascii(text) {
          return text.replace(/\p{Nd}/gu, function (d) { return digits[d] === undefined ? d : digits[d]; });
        }
        var text = ascii(raw);
        var months = [];
        var order = [];
        for (var m = 0; m < 12; m++) {
          var parts = dtf.formatToParts(new Date(2021, m, 14, 15, 9, 26));
          for (var p = 0; p < parts.length; p++) {
            if (parts[p].type === "month") months.push(ascii(parts[p].value));
            if (m === 0 && /^(day|year|hour|minute|second)$/.test(parts[p].type)) order.push(parts[p].type);
          }
        }
        var found = -1;
        for (var k = 0; k < 12; k++) {
          if (months[k] && text.indexOf(months[k]) >= 0 &&
              (found < 0 || months[k].length > months[found].length)) found = k;
        }
        if (found < 0) return NaN;
        text = text.replace(months[found], " ");
        var numbers = text.match(/\d+/g);
        if (!numbers || numbers.length !== order.length) return NaN;
        var values = {};
        for (var n = 0; n < order.length; n++) values[order[n]] = parseInt(numbers[n], 10);
        var hour = values.hour % 24;
        if (options.hourCycle === "h12" || options.hourCycle === "h11") {
          // Day-period words ("PM", "下午", "凌晨"): learn which hours each covers.
          var periods = {};
          for (var h = 0; h < 24; h++) {
            dtf.formatToParts(new Date(2021, 2, 14, h, 9, 9)).forEach(function (x) {
              if (x.type !== "dayPeriod") return;
              var entry = periods[x.value] || (periods[x.value] = { am: false, pm: false });
              entry[h >= 12 ? "pm" : "am"] = true;
            });
          }
          var chosen = null;
          Object.keys(periods).forEach(function (word) {
            if (text.indexOf(word) >= 0 && (chosen === null || word.length > chosen.length)) chosen = word;
          });
          if (chosen === null) return NaN;
          var entry = periods[chosen];
          var afternoon = entry.pm && !entry.am ? true : entry.am && !entry.pm ? false :
            (values.hour === 12 || values.hour <= 6);
          hour = (values.hour % 12) + (afternoon ? 12 : 0);
        }
        var year = options.calendar === "buddhist" ? values.year - 543 : values.year;
        if (year < 1990 || year > 2100 || values.day < 1 || values.day > 31 ||
            hour > 23 || values.minute > 59 || values.second > 59) return NaN;
        return new Date(year, found, values.day, hour, values.minute, values.second);
      }

      // Recent dates read relative: "12 minutes ago", "3 hours ago", "Yesterday",
      // "4 days ago". Seven days and older keep the normal date. The full date stays
      // in the tooltip. If the date can't be read, nothing changes.
      var time = document.querySelector(".dateline");
      if (!time) return;
      var attr = time.getAttribute("datetime") || "";
      if (!attr) return;
      var then;
      try {
        if (base === "en") {
          then = new Date(attr.replace(/[  ]/g, " ").replace(/\s+at\s+/i, " ").trim());
        } else {
          then = parseLocalized(attr);
          if (isNaN(then)) then = new Date(attr);
        }
      } catch (error) {
        return;
      }
      if (isNaN(then)) return;
      daisy.published = then;
      var now = new Date();
      var ms = now - then;
      if (ms < -5 * 60000) return;
      var rtf = null;
      if (base !== "en") {
        try { rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" }); } catch (error) { rtf = null; }
      }
      // Labels stand alone in the header, so they start with a capital letter
      // ("Hace 3 días"), and Japanese and Chinese drop the space after the number.
      function finish(text) {
        text = text.replace(/\s*\(1\)/, "");
        if (/^(ja|zh)/i.test(lang)) text = text.replace(/(\d) (?=[\u3040-\u30FF\u3400-\u9FFF])/g, "$1");
        return text.charAt(0).toLocaleUpperCase(lang) + text.slice(1);
      }
      // Norwegian's built-in "døgn" (24-hour period) reads oddly for days.
      function norwegianDays(count) {
        return "for " + count + (count === 1 ? " dag" : " dager") + " siden";
      }
      function english(count, unit) {
        return count + " " + unit + (count === 1 ? "" : "s") + " ago";
      }
      var minutes = Math.floor(ms / 60000);
      var hours = Math.floor(ms / 3600000);
      var label;
      if (minutes < 1) {
        label = words[2];
      } else if (minutes < 60) {
        label = rtf ? finish(rtf.format(-minutes, "minute")) : english(minutes, "minute");
      } else if (hours < 24) {
        label = rtf ? finish(rtf.format(-hours, "hour")) : english(hours, "hour");
      } else {
        var startOfDay = function (d) {
          return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        };
        var days = Math.round((startOfDay(now) - startOfDay(then)) / 86400000);
        if (days === 1) label = rtf ? finish(rtf.format(-1, "day")) : "Yesterday";
        else if (days < 7) label = !rtf ? english(days, "day") :
          (/^(nb|nn|no)$/.test(base) ? finish(norwegianDays(days)) : finish(rtf.format(-days, "day")));
        else return;
      }
      time.title = time.textContent;
      time.textContent = label;
    })();
    // Tapping the date shows the time ("at 10:47 PM") just below it, laid over the page
    // so nothing moves. Tapping anywhere else (or pressing Escape) hides it again.
    (function () {
      var time = document.querySelector(".dateline");
      if (!time) return;
      var text = "";
      if (daisy.published) {
        // The localized "at 10:47 PM": the date and time together, less the date.
        try {
          var dateOnly = new Intl.DateTimeFormat(daisy.lang, { dateStyle: "long" }).format(daisy.published);
          var both = new Intl.DateTimeFormat(daisy.lang, { dateStyle: "long", timeStyle: "short" }).format(daisy.published);
          if (both.indexOf(dateOnly) !== -1) text = both.replace(dateOnly, "").replace(/\s+/g, " ").trim();
          if (!text) text = new Intl.DateTimeFormat(daisy.lang, { timeStyle: "short" }).format(daisy.published);
        } catch (error) {
          text = "";
        }
      }
      if (!text) text = (time.getAttribute("datetime") || "").replace(/[  ]/g, " ").trim();
      if (!text) return;
      time.removeAttribute("title");
      time.setAttribute("role", "button");
      time.setAttribute("tabindex", "0");
      time.setAttribute("aria-expanded", "false");
      var full = document.createElement("span");
      full.className = "dateline-full";
      full.textContent = text;
      full.hidden = true;
      time.appendChild(full);
      function show(open) {
        full.hidden = !open;
        time.setAttribute("aria-expanded", open ? "true" : "false");
      }
      time.addEventListener("click", function (event) {
        event.stopPropagation();
        show(full.hidden);
      });
      time.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          show(full.hidden);
        }
      });
      document.addEventListener("click", function () { show(false); });
      window.addEventListener("resize", function () { show(false); });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") show(false);
      });
    })();
    // Daring Fireball's XML feed gives every post a df4.us short link, and NetNewsWire files
    // it in the link line. It only repeats the post's own address, so the row is hidden.
    (function () {
      var row = document.querySelector(".external-link");
      var link = row && row.querySelector("a");
      if (!link) return;
      try {
        if (new URL(link.getAttribute("href")).hostname.toLowerCase() === "df4.us") row.classList.add("same-page");
      } catch (error) {}
    })();
    // Hide the "Link:" row when it points at the same page as the title.
    (function () {
      var row = document.querySelector(".external-link");
      var title = document.querySelector(".article-header h1 a");
      var link = row && row.querySelector("a");
      if (!title || !link) return;
      function normalize(href) {
        try {
          var url = new URL(href);
          // Tracking parameters (utm_source=RSS and the like) do not make another page.
          Array.from(url.searchParams.keys()).forEach(function (key) { if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key); });
          return url.hostname.replace(/^www\./i, "").toLowerCase() +
            url.pathname.replace(/\/+$/, "") + url.search;
        } catch (error) {
          return "";
        }
      }
      var a = normalize(title.getAttribute("href"));
      if (a && a === normalize(link.getAttribute("href"))) {
        row.classList.add("same-page");
        return;
      }
      // A site can publish one post under two of its own hosts (the title links to the
      // guid on micro.blog, the link line to the custom domain): same path, same page.
      var parts = function (href) {
        try { var u = new URL(href); return { host: u.hostname.replace(/^www\./i, "").toLowerCase(), rest: u.pathname.replace(/\/+$/, "") + u.search }; } catch (error) { return null; }
      };
      var own = parts(title.getAttribute("href"));
      var out = parts(link.getAttribute("href"));
      var feed = parts((document.querySelector(".feed") || {}).href || "");
      // A post whose title links to an id-style address on the site's own host ("hypebeast.com/?post=6808464")
      // while the link line has the article's real address: the same post. Sample: fixtures/id-permalink.toml.
      if (own && out && out.host === own.host && /^\?(?:p|post|post_id|page_id|id|article)=\d+$/i.test(own.rest) && out.rest && !/^\?/.test(out.rest)) {
        row.classList.add("same-page");
        return;
      }
      if (own && out && own.rest && own.rest === out.rest &&
          (out.host === own.host || (feed && out.host === feed.host))) {
        row.classList.add("same-page");
      }
    })();
    // Show the link without a leading "www." or a trailing slash. Only the display
    // changes; the link itself is untouched.
    document.querySelectorAll(".external-link-url").forEach(function (span) {
      span.textContent = span.textContent.replace(/^www\./i, "").replace(/\/$/, "");
    });
    // Category tags in headlines move to a small line above the title (the eyebrow):
    // "(Podcast) Title", "[Update] Title", and the known series and sponsor forms
    // "App Report: Title", "The Talk Show: Title" and "Sponsor: Title". A sponsor's name moves up with it:
    // "(Sponsor) Name: Headline" becomes "Sponsor: Name" over "Headline". Numbered series
    // move too, along with any words before the number: "OS 34: Headline", "Obs 149.5: Headline"
    // and "Mostly free OS 32: Headline" become "OS 34", "Obs 149.5" and "Mostly free OS 32"
    // over "Headline". Only the numbered series named in the list below move.
    // Also moved: a known editorial or section label before a colon ("Cartoon: Headline",
    // "The Sunday Read: Headline"), a label that is exactly the feed's own name ("Nature: Headline" in the Nature feed),
    // a paywall marker ("heise+ | Headline"), a bracketed tag at the end ("Headline [Gallery]"),
    // and a known show name after a pipe ("Headline | The Vergecast Livestream"). Also moved:
    // "Opinion | Headline", any newsletter name before a colon ("The War Room newsletter: Headline")
    // and a closing "- video" or "- live" after a dash. A name after a pipe that is the post's
    // author ("Headline | Margaret Sullivan") is dropped instead, since the byline shows it. The
    // same goes for an author's name before a colon ("Bengt Ohlsson: Headline"). Also moved:
    // "EN DIRECT - Headline". Tags at the start: any short tag in square brackets, but in parentheses
    // only a known word, so "(Almost) Everything" stays in the title.
    // Left in the title: a prefix that is a single symbol ("★ Headline", "🔴 Live: Headline")
    // and a prefix that is only an acronym ("CISA: Headline"). A source credit closing a headline
    // ("Headline (Minsoo Kang/Counterpoint Research)") moves to the eyebrow as "Minsoo Kang for Counterpoint Research".
    // A feed name that ends in "feed" ("Wikipedia featured articles feed") drops the word, and a
    // title that ends with the feed's own name ("October 23 Wikipedia featured article") drops
    // that part, since the credit already says it. Singular and plural count as the same.
    // The feed "A List Apart: The Full" shows as "A List Apart".
    (function () {
      var feedEl = document.querySelector(".attribution .feed");
      if (!feedEl) return;
      var trimmed = feedEl.textContent.replace(/\s+feed\s*$/i, "");
      if (trimmed.trim() && trimmed !== feedEl.textContent) feedEl.textContent = trimmed;
      // A List Apart names its full-text feed "A List Apart: The Full"; the credit shows just "A List Apart".
      if (/^a list apart:\s*the full$/i.test(trimmed.trim())) { trimmed = "A List Apart"; feedEl.textContent = trimmed; }
      // A feed name that closes with "on Medium" drops it ("Stories by Kinny Cheng on Medium" shows as
      // "Stories by Kinny Cheng"). Jekyll's feed name shows as just "Jekyll", dropping what follows the word.
      var cleaned = trimmed.replace(/\s+on\s+medium\s*$/i, "").replace(/^(jekyll)\b.*$/i, "$1");
      if (cleaned.trim() && cleaned !== trimmed) { trimmed = cleaned; feedEl.textContent = trimmed; }
      // A feed name made of a publication and a description around a pipe or a dash ("Atlas Obscura - Latest
      // Articles and Places", "Travel | The Guardian", "Latest articles | smithsonianmag.com") shows only the
      // part that is the site's own name: the one that matches the domain of the feed's link. Then a closing
      // "Articles" goes ("The Points Guy Articles"), and Bring a Trailer is written out.
      // Samples: fixtures/feed-domain-suffix.toml, fixtures/feed-domain-prefix.toml, fixtures/feed-articles.toml.
      (function () {
        var host = "";
        try { host = new URL(feedEl.getAttribute("href") || "").hostname.replace(/^www\./i, "").toLowerCase(); } catch (error) {}
        var squash = function (t) { return t.toLowerCase().replace(/\.(?:com|org|net|co|io|dev|blog)$/i, "").replace(/[^\p{L}\p{N}]/gu, ""); };
        var labels = host ? host.split(".").slice(0, -1).map(squash) : [];
        var isDomain = function (part) {
          var key = squash(part);
          if (key.length < 3) return false;
          return labels.some(function (label) { return label === key || label === key.replace(/^the/, "") || label.replace(/^the/, "") === key; });
        };
        if (host === "bringatrailer.com") {
          trimmed = "Bring a Trailer";
          feedEl.textContent = trimmed;
          var by = document.querySelector(".attribution .byline");
          if (by && squash(by.textContent) === "bringatrailer") by.textContent = trimmed;
          return;
        }
        var pieces = trimmed.split(/\s+[|\-\u2013\u2014\u2022\u00b7]\s+/);
        if (pieces.length > 1) {
          var match = pieces.filter(isDomain);
          if (match.length === 1) { trimmed = match[0].trim(); feedEl.textContent = trimmed; }
        }
        var bare = trimmed.replace(/\s+articles\s*$/i, "");
        if (bare.trim() && bare !== trimmed) { trimmed = bare.trim(); feedEl.textContent = trimmed; }
      })();
      // "Simon Willison for Simon Willison's Weblog": a blog named for its author ("<author>'s weblog" or
      // "<author>'s blog") shows as the author's name, linked to the feed. The credit shows it once
      // (see "same-name" below).
      var ownerEl = document.querySelector(".attribution .byline");
      var owned = trimmed.trim().match(/^(.+?)['\u2019]s\s+(?:weblog|blog)$/i);
      var plainName = function (t) { return t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""); };
      if (owned && ownerEl && plainName(owned[1]).length > 2 && plainName(owned[1]) === plainName(ownerEl.textContent)) {
        trimmed = ownerEl.textContent.trim();
        feedEl.textContent = trimmed;
      }
      var link = document.querySelector(".article-header h1 a");
      var node = link && link.firstChild;
      if (!node || node.nodeType !== 3) return;
      var words = function (s) { return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/).filter(Boolean).map(function (w) { return w.replace(/s$/, ""); }); };
      var name = words(trimmed);
      var title = node.data.trim().split(/\s+/);
      if (name.length < 2 || title.length <= name.length) return;
      var tail = words(title.slice(-name.length).join(" "));
      if (tail.join(" ") === name.join(" ")) node.data = title.slice(0, -name.length).join(" ");
    })();
    document.querySelectorAll(".article-header h1 a").forEach(function (a) {
      var node = a.firstChild;
      if (!node || node.nodeType !== 3) return;
      var text = node.data;
      var sponsorWords = "sponsor|sponsored|advertisement|advert|ad|promoted|promotion|anzeige|werbung|gesponsert|sponsorisée?|publicité|patrocinado|patrocinador|publicidad|sponsorizzato|pubblicità|реклама|广告|廣告|広告|광고|إعلان";
      var series = "app report|podcast|the talk show";
      // Editorial formats and recurring sections. Only a label before a colon counts, and only
      // the names listed here. Add a name to follow another section.
      var labels = "cartoon|commentary|review|hands-on|exclusive|interview|deals|bonus|special edition|special episode|report|the sunday read|sunday special|the latest|the field|hello developer|version history|fragments|solo acts|the headlines|opinion|daily cartoon|transcript|the download|the pulse|popinfo weekly|brickbat|today in supreme court history|following|best of|extra|pivot extra|pluralistic|macstories weekly|homekit weekly|magsafe monday|apple @ work|apple @ work podcast|indie app spotlight|monthly log|new theme|show hn|ask hn|tell hn|launch hn|watch|book review|restaurant review|roundup|feature|revealed|special|live|tested|archive|the interview|modern love|the run-up|the argument|interesting times|today in apple history|price cut|price drop|poll|livestream|early addition|early edition|psa|the editors[\\u2019']? cut|kitchen of the week|new & noteworthy|extra, extra|current obsessions|\\d+ easy pieces";
      // Tags that may close a headline in brackets or parentheses: "Headline [Gallery]".
      var closingWords = "rebroadcast|repeat|replay|from the archive|bonus|exclusive|update|throwback|repost";
      var trailingTags = "gallery|video|poll|updated|live|" + closingWords + "|" + sponsorWords;
      var tagged = text.match(/^\s*[\[(]\s*([^\[\]()]{1,24}?)\s*[\])]\s+/);
      // Square brackets take any short tag, unless a lowercase word follows ("[Part of] the
      // problem"). Parentheses are how people write asides, so only these tag words count:
      // "(Podcast) Title" moves, "(Almost) Everything" stays.
      if (tagged) {
        var parenTags = "podcast|update|updated|video|gallery|poll|live|exclusive|review|interview|opinion|breaking|bonus|" + sponsorWords;
        if (/^\s*\(/.test(tagged[0])) {
          if (!new RegExp("^(" + parenTags + ")$", "i").test(tagged[1].trim())) tagged = null;
        } else if (/\p{Ll}/u.test(text.charAt(tagged[0].length))) {
          tagged = null;
        }
      }
      var plain = text.match(new RegExp("^\\s*(" + sponsorWords + "|" + series + ")\\s*[:\\u2014\\u2013-]\\s+", "i"));
      // A show name may sit in quotes, as in the NYT's "‘The Interview’: ...".
      var named = text.match(new RegExp("^\\s*[\\u2018\\u201c'\"]?(" + labels + ")[\\u2019\\u201d'\"]?\\s*[:\\uff1a]\\s+", "i"));
      // A label that is exactly the feed's own name ("Nature: ..." in the Nature feed), so a
      // feed that repeats its name in its titles is covered without a list. A partial match
      // does not count, so "Science: ..." stays in the title of the Science Magazine feed.
      var echo = null;
      var feedEl = document.querySelector(".attribution .feed");
      var simple = function (s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""); };
      // The post's author, for names that repeat it. Only a whole name counts: the byline as
      // a whole, or any one author when it lists several ("A, B", "A and B").
      var authorEl = document.querySelector(".attribution .byline");
      var authors = authorEl ? [authorEl.textContent].concat(authorEl.textContent.split(/\s*(?:[,;&]|\band\b)\s*/i)).map(simple) : [];
      var isAuthor = function (name) { var n = simple(name); return n.length > 2 && authors.indexOf(n) >= 0; };
      var feedName = feedEl ? simple(feedEl.textContent) : "";
      var colon = text.match(/^\s*([^:：]{1,40}?)\s*[:：]\s+/);
      if (colon && feedName.length > 3 && colon[1].trim().split(/\s+/).length <= 4) {
        var echoName = simple(colon[1]);
        if (echoName.length > 3 && echoName === feedName) echo = colon;
      }
      // A paywall marker before a pipe or a colon: "heise+ | ...", "STAT+: ...".
      var paywall = text.match(/^\s*([\p{L}\p{N}.\-]{2,20}\+)\s*[|:]\s+/u);
      // "Opinion | Headline": the label comes first, before the pipe.
      var opinion = text.match(/^\s*(opinion)\s*\|\s+/i);
      // A newsletter name before a colon, up to four words: "The War Room newsletter: ...".
      var newsletter = text.match(/^\s*([^:\uff1a|]{1,40}?\snewsletter)\s*[:\uff1a]\s+/i);
      if (newsletter && newsletter[1].trim().split(/\s+/).length > 4) newsletter = null;
      // A numbered series: a short label that ends in one of the series names below, a number
      // and a colon: "OS 34: ...", "Obs 149.5: ...", "Mostly free OS 32: ...",
      // "Clockwise 679: ...". Any words before the series name come along (at most six words
      // in all). Only the names listed here count, so "iOS 17:", "Part 2:" and "Windows 11:"
      // are left alone. Add a name to follow another numbered series.
      var numberedSeries = "os|obs|observer|clockwise|upgrade|the rebound|the sideload|pixelated|overtime|designed in california";
      var numbered = text.match(/^\s*([^:：]{1,48}?\s\d+(?:\.\d+)?)\s*[:：]\s+/);
      if (numbered) {
        var parts = numbered[1].trim().split(/\s+/);
        parts.pop();
        if (parts.length > 5 || !new RegExp("(^|\\s)(" + numberedSeries + ")\\.?$", "i").test(parts.join(" "))) numbered = null;
      }
      // A dated edition: "9to5Mac Daily: October 21, 2026 \u2013 Headline". The name and date
      // move up together, so the title starts after the dash.
      var dated = text.match(/^\s*([^:\uff1a]{1,40}?:\s+\p{Lu}\p{L}+\.?\s+\d{1,2},?\s+\d{4})\s*[\u2014\u2013-]\s+/u);
      // A live label that stands first: "EN DIRECT - Headline", "EN DIRECT, topic : Headline".
      var live = text.match(/^\s*(en direct)\s*[,:\uff1a\u2014\u2013-]\s+/i);
      // An election label before a colon, in any of its forms: "Live Election Results:",
      // "Election Results:", "Election 2026:", "2026 Election Night:", "Election Day Live Updates:".
      // The word "election" (or "elections") may take up to three words before it (a place, a kind
      // of election, a year, "live") and, after it, a year, "live" or one of results, night, day,
      // coverage, updates or live blog, in any order. A colon or a spaced dash ends the label.
      // Samples: fixtures/election-label.toml, fixtures/election-place.toml.
      var election = text.match(/^\s*((?:(?:live|\d{4}|midterms?|general|primary|runoff|special|[\p{L}'’.-]+)\s+){0,3}elections?(?:\s+(?:\d{4}|live|results?|night|day|coverage|updates?|blog|live\s*blog))*)\s*(?:[:：]\s+|\s[–—-]\s+)/iu);
      // Annual events and seasons before a colon or a spaced dash: "Black Friday deals: ...",
      // "Cyber Monday 2026 - Best ...", "Prime Day live blog: ...". Shopping events stand alone or
      // take words such as deals, a year or live blog, and an opener before the name (a year,
      // Amazon, Early, Best, Top, Our, Biggest): "2026 Black Friday deals:", "Amazon Prime Day 2026:". A holiday or season (Thanksgiving,
      // Christmas, Back to School) only counts with such a word after it, so "Christmas: a
      // ghost story" stays in the title. Add a name to the lists to follow another event.
      // A short label that ends in "Guide" moves too ("November Culture Guide: ...", "Gift Guide: ...").
      // Samples: fixtures/black-friday.toml, fixtures/cyber-monday.toml, fixtures/guide-label.toml.
      var shopEvents = "amazon prime day|green monday|big spring sale|spring sale|way day|target circle week|deal days|black friday|cyber monday|cyber week|prime day|prime big deal days|big deal days|prime early access sale|singles['\\u2019]? day|small business saturday|giving tuesday|boxing day|super bowl|march madness|nfl draft|nba draft|world series|oscars|emmys|grammys|golden globes|met gala";
      var seasons = "thanksgiving|christmas|holiday|halloween|easter|valentine['\\u2019]?s(?: day)?|mother['\\u2019]?s day|father['\\u2019]?s day|memorial day|labor day|presidents['\\u2019]? day|4th of july|fourth of july|july 4th|new year['\\u2019]?s(?: eve)?|back[- ]to[- ]school|cinco de mayo|hanukkah|st\\.? patrick['\\u2019]?s day|earth day";
      var eventWords = "(?:\\d{4}|[ivxlc]{1,6}|deals?|sales?|discounts?|savings|offers?|live|live\\s*blog|blog|updates?|coverage|guides?|gift\\s+guides?|gifts?|ideas|recipes|tips|hours|specials?|predictions?|previews?|picks|roundup|early|best|top)";
      var openers = "(?:(?:the|our|amazon|early|best|top|biggest|new|official|last-minute|final|\\d{4})\\s+)*";
      var recurring = text.match(new RegExp("^\\s*(" + openers + "(?:(?:" + shopEvents + ")(?:\\s+" + eventWords + ")*|(?:" + seasons + ")(?:\\s+" + eventWords + ")+))\\s*(?:[:\\uff1a]\\s+|\\s[\\u2013\\u2014-]\\s+)", "i"));
      var guide = text.match(/^\s*((?:[\p{L}\p{N}'’&.-]+\s+){0,3}guides?)\s*[:：]\s+/iu);
      // "How I AI: ..." with a few characters of decoration before it ("\ud83c\udf99\ufe0f How I AI: ..."): the symbol comes along.
      // Sample: fixtures/how-i-ai.toml.
      var howIAi = text.match(/^\s*((?:[^:\uff1a]{1,8}?\s+)?how i ai)\s*[:\uff1a]\s+/i);
      // "Roundup #89: Headline": a numbered roundup. Sample: fixtures/roundup-number.toml.
      var roundup = text.match(/^\s*(roundup\s*#\s*\d+)\s*[:\uff1a]\s+/i);
      // "Politics Chat, October 27, 2026" and "Essential Releases, October 30, 2026": the label stands
      // before a comma and the rest is the title. Samples: fixtures/politics-chat.toml, fixtures/essential-releases.toml.
      var politicsChat = text.match(/^\s*(politics chat|essential releases)\s*,\s+/i);
      var found = tagged || plain || named || echo || numbered || dated || paywall || opinion || newsletter || live || election || recurring || guide || howIAi || roundup || politicsChat;
      var label, rest;
      if (found) {
        if (text.length <= found[0].length) return;
        label = found[1].trim();
        rest = text.slice(found[0].length);
        // The title behind a label can still end in the author's or the feed's name after a
        // pipe ("[Field Notes] Headline | Barrett Thorne"): the byline shows it, so it goes too.
        var restPiped = rest.match(/^(.*\S)\s+\|\s+([^|]{2,40}?)\s*$/);
        if (restPiped && simple(restPiped[2]) !== "editorial" && (isAuthor(restPiped[2]) || (feedName && simple(restPiped[2]) === feedName))) rest = restPiped[1];
        // A prefix that is only an acronym ("CISA:", "EU:", "PSA:") stays in the title.
        // A label on the lists above is a word, not an acronym, even in capitals ("WATCH:").
        if (found !== named && found !== numbered && found !== dated && found !== paywall && !new RegExp("^(" + sponsorWords + ")$", "i").test(label) && /^[\p{Lu}\p{N}&.]+$/u.test(label)) return;
      } else {
        // A name before a colon that is the post's author is already in the byline, so it is
        // dropped: "Bengt Ohlsson: Headline" by Bengt Ohlsson. Anyone else's name stays.
        if (colon && text.length > colon[0].length && isAuthor(colon[1])) {
          node.data = text.slice(colon[0].length);
          return;
        }
        var trailing = text.match(new RegExp("^(.*\\S)\\s*[\\[(]\\s*(" + trailingTags + ")\\s*[\\])]\\s*$", "i"));
        // A closing tag after a dash: "Headline \u2013 video".
        var dashed = text.match(/^(.*\S)\s+[\u2014\u2013-]\s+(video|live|cartoon|ranked!|in pictures|podcast|as it happened|trailer)\s*$/i);
        // A name after a pipe: "Headline | The Vergecast Livestream". The author's name and the
        // feed's own name are dropped, since the byline shows them ("Editorial" stays, as the
        // kind of piece). Any other name moves only if it is a known show or section, or starts
        // with "With" ("| With Zach Lowe"). Everything else stays: "Radiohead | OK Computer".
        var pipedShows = "the vergecast livestream|vergecast hotline|livestream|better in person|on with kara swisher|the global story|editorial|letters|letter|brief letters|leading questions|a kitchen in rome|ask annalisa barbieri|full album|foto|video|mac & i-podcast|the vergecast|npr[\u2019']s newsmakers|sources & methods|america in pursuit|the new vegan|waste not|quick and easy";
        var piped = text.match(/^(.*\S)\s+\|\s+([^|]{2,40}?)\s*$/);
        if (piped) {
          var pipeName = piped[2].trim();
          if (simple(pipeName) !== "editorial" && (isAuthor(pipeName) || (feedName && simple(pipeName) === feedName))) {
            node.data = piped[1];
            return;
          }
          if (!new RegExp("^(" + pipedShows + ")$", "i").test(pipeName) && !/^with\s+\S/i.test(pipeName)) piped = null;
        }
        // A source credit in parentheses at the end: "Headline (Minsoo Kang/Counterpoint Research)".
        // With a slash, both sides start with a capital and one has two or more words, so
        // "(Pros/Cons)", "(and/or)" and "(24/7)" stay in the title. Without a slash ("(OpenAI)",
        // "(The Information)", "(@handle)") a headline's last parenthesis only counts in a feed named
        // Techmeme, which ends every headline with its source; elsewhere it is an ordinary aside.
        var credited = null;
        var credit = text.match(/^(.*\S)\s*\(\s*([^()]{1,80}?)\s*\)\s*$/);
        if (credit) {
          var creditParts = credit[2].split("/").map(function (part) { return part.trim(); });
          var slashed = creditParts.length > 1 && creditParts.every(function (part) { return /^\p{Lu}/u.test(part); }) &&
            creditParts.some(function (part) { return part.split(/\s+/).length >= 2; });
          if (slashed || (creditParts.length === 1 && feedName === "techmeme" && /^[@\p{Lu}]/u.test(creditParts[0]))) {
            credited = [credit[0], credit[1], creditParts.join(" for "), credit[2]];
          }
        }
        var tail = trailing || dashed || piped || credited;
        if (!tail) return;
        label = tail[2].trim();
        rest = tail[1];
        // A closing tag shouted in capitals ("(EXCLUSIVE)") is shown in lowercase.
        if (tail === trailing && new RegExp("^(" + closingWords + ")$", "i").test(label)) label = label.toLowerCase();
      }
      if (!/\p{L}/u.test(label)) return;
      // A live label or a listed label shouted in capitals ("EN DIRECT", "WATCH") is shown in lowercase.
      if (found && (found === live || found === named) && label.length > 4 && label === label.toUpperCase()) label = label.toLowerCase();
      if (found && new RegExp("^(" + sponsorWords + ")$", "i").test(label)) {
        var split = rest.match(/^(.{1,60}?):\s+(.+)$/);
        if (split) {
          label = label + ": " + split[1];
          rest = split[2];
        }
      }
      var eyebrow = document.createElement("div");
      eyebrow.className = "eyebrow";
      // If the post has a link line that would sit under the title, the eyebrow itself
      // becomes that link ("Sponsor: Mux" opens the sponsor's page), and the line is dropped.
      var row = document.querySelector(".article-header .external-link");
      var from = row && row.querySelector("a");
      var domain = row && row.querySelector(".external-link-url");
      var linked = row && from && domain && !row.classList.contains("same-page") && domain.textContent.trim();
      // Techmeme opens every post with "Name / <a>Publication</a>:" and a bold repeat of the
      // headline. When that opening matches the credit now in the eyebrow, the publication's link
      // moves to the eyebrow, and the opening and the repeated headline are removed from the body.
      var creditHref = null;
      var credited_ = typeof credited !== "undefined" && credited && tail === credited;
      if (credited_ && feedName === "techmeme") {
        Array.prototype.some.call(document.querySelectorAll(".articleBody p"), function (para) {
          var br = para.querySelector("br");
          if (!br || br.parentNode !== para) return false;
          var head = "", lastLink = null, nodes = [];
          for (var n = para.firstChild; n && n !== br; n = n.nextSibling) {
            nodes.push(n);
            head += n.textContent;
            if (n.nodeType === 1 && n.tagName === "A" && n.textContent.trim()) lastLink = n;
          }
          if (!/:\s*$/.test(head) || simple(head) !== simple(credited[3])) return false;
          if (lastLink) creditHref = { href: lastLink.getAttribute("href"), text: lastLink.textContent.trim() };
          var after = br.nextSibling;
          while (after && after.nodeType === 3 && !after.data.trim()) after = after.nextSibling;
          var drop = nodes.concat([br]);
          if (after && after.nodeType === 1 && after.querySelector("b > a, b") && after.tagName === "SPAN") {
            drop.push(after);
            var sep = after.nextSibling;
            if (sep && sep.nodeType === 3) sep.data = sep.data.replace(/^[\s\u00a0]*[\u2014\u2013-]?[\s\u00a0]*/, "");
          }
          drop.forEach(function (n) { n.remove(); });
          return true;
        });
      }
      var name = document.createElement(linked && !creditHref ? "a" : "span");
      name.className = "eyebrow-label";
      name.textContent = /\+$/.test(label) ? label : label.charAt(0).toUpperCase() + label.slice(1);
      // A dated edition breaks before its date and drops the colon: "9to5Mac Daily" over "October 23, 2026".
      if (found === dated) {
        var edition = label.match(/^(.*?):\s+(.+)$/);
        if (edition) {
          name.textContent = "";
          name.appendChild(document.createTextNode(edition[1]));
          name.appendChild(document.createElement("br"));
          name.appendChild(document.createTextNode(edition[2]));
        }
      }
      if (creditHref && creditHref.href) {
        var shown = name.textContent, pub = creditHref.text;
        var link = document.createElement("a");
        link.href = creditHref.href;
        link.textContent = pub;
        if (simple(shown) === simple(pub)) {
          name.textContent = "";
          name.appendChild(link);
        } else if (shown.slice(-pub.length) === pub) {
          name.textContent = shown.slice(0, -pub.length);
          name.appendChild(link);
        }
      }
      if (linked && !creditHref) {
        name.href = from.getAttribute("href");
        row.classList.add("moved");
      }
      eyebrow.appendChild(name);
      var heading = a.closest("h1");
      heading.parentNode.insertBefore(eyebrow, heading);
      node.data = rest;
    });
    // A star rating that closes a title after a dash ("Resident Evil, 2026 - \u2605\u2605\u2605\u2605") drops the
    // dash and takes a line of its own under the title. The rating is stars, with a half star
    // (\u00bd) at the end. Sample: fixtures/rating.toml.
    document.querySelectorAll(".article-header h1 a").forEach(function (a) {
      var node = a.firstChild;
      if (!node || node.nodeType !== 3 || a.childNodes.length !== 1) return;
      var match = node.data.match(/^(.*\S)\s+[-\u2013\u2014]\s+([\u2605\u2606\u2b50]+\u00bd?|\u00bd)\s*$/);
      if (!match) return;
      node.data = match[1];
      var rating = document.createElement("span");
      rating.className = "rating";
      rating.textContent = match[2];
      a.appendChild(rating);
    });
    // Title length picks the headline's style: short titles go narrow and big, long
    // titles narrow (see "2.2 The title"). Counted after the eyebrow has taken its tag.
    (function () {
      var h1 = document.querySelector(".article-header h1");
      if (!h1) return;
      var stars = h1.querySelector(".rating");
      var n = h1.textContent.trim().length - (stars ? stars.textContent.length : 0);
      h1.setAttribute("data-len", n <= 24 ? "short" : n <= 36 ? "brief" : n >= 70 ? "long" : "medium");
    })();
    // Character count is only a proxy for how big a title feels. A balanced title of three or
    // more lines whose widest line stops well short of the column (narrow glyphs, short words)
    // reads smaller than its neighbours, so it is measured and scaled up until the widest
    // line fills most of the column, never past MAX and never into an extra line. It sets
    // --title-fit rather than font-size, because NetNewsWire strips inline font styles.
    // Sample: fixtures/narrow-balanced-title.toml.
    (function () {
      var h1 = document.querySelector(".article-header h1");
      if (!h1) return;
      var FILL = 0.88, MAX = 1.3, STEP = 0.03, queued = false;
      function measure() {
        var rects = [], walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT), text;
        while ((text = walker.nextNode())) {
          var range = document.createRange();
          range.selectNodeContents(text);
          Array.prototype.forEach.call(range.getClientRects(), function (r) { if (r.width > 0) rects.push(r); });
        }
        if (!rects.length) return null;
        var left = Infinity, right = -Infinity, tops = {};
        rects.forEach(function (r) {
          left = Math.min(left, r.left);
          right = Math.max(right, r.right);
          tops[Math.round(r.top / 4)] = 1;
        });
        return { width: right - left, lines: Object.keys(tops).length };
      }
      function fit() {
        queued = false;
        h1.style.removeProperty("--title-fit");
        var base = measure(), col = h1.clientWidth;
        if (!base || base.lines < 3 || !col || base.width >= col * FILL) return;
        var scale = Math.min(MAX, (col * FILL) / base.width);
        for (; scale > 1.02; scale -= STEP) {
          h1.style.setProperty("--title-fit", scale);
          var now = measure();
          if (now && now.lines <= base.lines && now.width <= col) return;
        }
        h1.style.removeProperty("--title-fit");
      }
      fit();
      // Refit when the column's width changes (rotation, window resize), not on the title's own size.
      var lastWidth = h1.parentNode.clientWidth;
      function refit() {
        var w = h1.parentNode.clientWidth;
        if (w === lastWidth || queued) return;
        lastWidth = w;
        queued = true;
        requestAnimationFrame(fit);
      }
      if (window.ResizeObserver) new ResizeObserver(refit).observe(h1.parentNode);
      else window.addEventListener("resize", refit);
    })();
    // Quotation marks in headings (the title and the headings inside the article).
    // 1. Straight quotes become typographic ones. Apostrophes (Don't, '90s, dogs') become a
    //    plain ’ and are otherwise left alone, as are inch and foot marks (12", 5'10") and
    //    any heading that uses another language's quote marks (« », „ “, 「 」).
    // 2. Real quotes are wrapped in <span class="q">. Large headings shrink them and give
    //    them more weight so their strokes stay as thick as the heading's. Every quote in a
    //    heading gets the same size and weight, so opening and closing marks always match.
    // 3. A quote that starts a line hangs in the margin so the first letter lines up with the
    //    text below. It stays a safe distance from the screen edge: when the margin is too
    //    narrow, all the heading's quotes shrink together until it fits.
    (function () {
      var article = document.querySelector(".article");
      if (!article || article.classList.contains("no-tracking")) return;
      var START = 48, END = 105.6, MIN_SIZE = 0.79, MIN_FIT = 0.45, SAFE = 8, MAX_WEIGHT = 900;
      var FOREIGN = /[«»‹›„‚「」『』]/;
      var LETTER = /[\p{L}\p{N}]/u;
      var ELISION = /^(\d\d|tis\b|twas\b|n\b|em\b|cause\b|til\b|round\b)/i;
      var records = [];

      document.querySelectorAll(".article-header h1, .articleBody :is(h1, h2, h3)").forEach(function (h) {
        if (!/["'‘’“”]/.test(h.textContent) || FOREIGN.test(h.textContent)) return;
        var nodes = [], walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), node;
        while ((node = walker.nextNode())) nodes.push(node);
        var chars = nodes.map(function (n) { return n.data; }).join("").split("");
        var kinds = new Array(chars.length), openSingles = 0;
        for (var i = 0; i < chars.length; i++) {
          var c = chars[i], p = i ? chars[i - 1] : "", n = chars[i + 1] || "";
          if (c === '"') {
            if (/\d/.test(p)) continue;
            var open = !p || /[\s(\[{–—‘“\/-]/.test(p);
            chars[i] = open ? "“" : "”";
            kinds[i] = open ? "o" : "c";
          } else if (c === "“" || c === "”") {
            kinds[i] = c === "“" ? "o" : "c";
          } else if (c === "'" || c === "‘" || c === "’") {
            var prevLetter = LETTER.test(p), nextLetter = LETTER.test(n);
            if (c === "'" && /\d/.test(p) && !/\p{L}/u.test(n)) continue;
            if (c === "‘") { kinds[i] = "o"; openSingles++; continue; }
            if (prevLetter && nextLetter) { chars[i] = "’"; continue; }
            if (p && !/[\s(\[{–—“‘]/.test(p)) {
              if (openSingles > 0) { chars[i] = "’"; kinds[i] = "c"; openSingles--; }
              else chars[i] = "’";
            } else if (ELISION.test(chars.slice(i + 1, i + 8).join(""))) {
              chars[i] = "’";
            } else {
              chars[i] = "‘"; kinds[i] = "o"; openSingles++;
            }
          }
        }
        var at = 0;
        nodes.forEach(function (n) {
          var len = n.data.length, frag = null, run = "";
          for (var j = 0; j < len; j++) {
            var ch = chars[at + j];
            if (kinds[at + j]) {
              frag = frag || document.createDocumentFragment();
              if (run) { frag.appendChild(document.createTextNode(run)); run = ""; }
              var span = document.createElement("span");
              span.className = "q " + kinds[at + j];
              // An opening quote before a capital A sits a little closer: the A's slanted
              // side leaves a gap that reads as too much space.
              if (kinds[at + j] === "o" && /[AÀÁÂÃÄÅĀĂĄ]/.test(chars[at + j + 1] || "")) span.className += " kern-a";
              span.textContent = ch;
              frag.appendChild(span);
            } else {
              run += ch;
            }
          }
          if (frag) {
            if (run) frag.appendChild(document.createTextNode(run));
            n.parentNode.replaceChild(frag, n);
          } else {
            n.data = run;
          }
          at += len;
        });
        var spans = h.querySelectorAll(".q");
        if (spans.length) {
          records.push({
            h: h,
            spans: Array.prototype.slice.call(spans),
            hangs: h.matches(".article-header h1") || h.parentNode === document.querySelector(".articleBody")
          });
        }
      });

      function layout(rec) {
        var h = rec.h, qs = rec.spans, cs = getComputedStyle(h);
        var fs = parseFloat(cs.fontSize), fvs = cs.fontVariationSettings;
        var found = /"wght"\s+([\d.]+)/.exec(fvs);
        var base = found ? parseFloat(found[1]) : (parseFloat(cs.fontWeight) || 400);
        var t = Math.min(1, Math.max(0, (fs - START) / (END - START)));
        var s = 1 - t * (1 - MIN_SIZE);
        // A smaller mark has thinner strokes, so it gets heavier (up to the axis maximum)
        // to keep the heading's stroke thickness. Stroke is taken as size x (weight + 150).
        function style(size) {
          var weight = size === 1 ? 0 : Math.min(MAX_WEIGHT, Math.max(base, (base + 150) / size - 150));
          var axes = !weight ? "" : found ? fvs.replace(/"wght"\s+[\d.]+/, '"wght" ' + weight)
            : (fvs && fvs !== "normal" ? fvs + ", " : "") + '"wght" ' + weight;
          qs.forEach(function (q) {
            q.style.marginLeft = "";
            // Tucked in by 0.06 of the heading's size, whatever size the mark itself is.
            q.style.marginRight = q.classList.contains("kern-a") ? (-0.06 / size) + "em" : "";
            q.style.fontSize = size === 1 ? "" : size + "em";
            // The smaller mark sits lower in the line; this keeps its top at cap height.
            q.style.top = size === 1 ? "" : (-0.7 * (1 - size) / size) + "em";
            q.style.fontWeight = weight || "";
            q.style.fontVariationSettings = axes;
          });
        }
        style(s);
        if (!rec.hangs || cs.direction === "rtl") return;
        var edge = h.getBoundingClientRect().left;
        var room = Math.max(0, edge - SAFE);
        // A line-start opener plus any opening marks right after it hangs as one group.
        function groups() {
          var found = [];
          qs.forEach(function (q) {
            if (!q.classList.contains("o")) return;
            var prev = q.previousSibling;
            if (prev && prev.nodeType === 1 && prev.classList.contains("o") && prev.nextSibling === q) return;
            var first = q.getBoundingClientRect(), last = q, next;
            while ((next = last.nextSibling) && next.nodeType === 1 && next.classList.contains("o")) last = next;
            var end = last.getBoundingClientRect();
            found.push({ el: q, left: first.left, width: end.right - first.left });
          });
          return found;
        }
        // Hanging narrows the mark's line box, which can let it fit onto the end of the
        // previous line instead (the comma in "Pardoner, “Target" then touches the quote). A
        // mark that moves like that gets a forced line break before it, so it stays put.
        Array.prototype.slice.call(h.querySelectorAll("br.q-br")).forEach(function (br) { br.remove(); });
        function misplaced(g) {
          return g.el.style.marginLeft !== "" && Math.abs(g.left - (edge + parseFloat(g.el.style.marginLeft))) > 2;
        }
        for (var pass = 0; pass < 8; pass++) {
          qs.forEach(function (q) { q.style.marginLeft = ""; });
          var starts = groups().filter(function (g) {
            return Math.abs(g.left - edge) < 2;
          });
          var need = starts.reduce(function (m, g) { return Math.max(m, g.width); }, 0);
          if (need > room + 0.5 && s > MIN_FIT) {
            s = Math.max(MIN_FIT, s * room / need);
            style(s);
            continue;
          }
          starts.forEach(function (g) { g.el.style.marginLeft = -Math.min(g.width, room) + "px"; });
          var moved = groups().filter(misplaced);
          if (!moved.length) break;
          moved.forEach(function (g) {
            var br = document.createElement("br");
            br.className = "q-br";
            g.el.parentNode.insertBefore(br, g.el);
          });
        }
        groups().filter(misplaced).forEach(function (g) { g.el.style.marginLeft = ""; });
      }

      var queued = false;
      function run() {
        queued = false;
        records.forEach(layout);
      }
      function schedule() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(run);
      }
      if (!records.length) return;
      run();
      // The hang depends on where lines break, which changes when the web fonts finish
      // loading, when the page settles to its final width, or when the text size changes.
      // fonts.ready can resolve before a font has started loading, so every one of those
      // moments re-runs the layout, and each heading is watched for any size change.
      window.addEventListener("resize", schedule);
      window.addEventListener("load", schedule);
      if (document.fonts) {
        if (document.fonts.ready) document.fonts.ready.then(schedule);
        if (document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", schedule);
      }
      if (window.ResizeObserver) {
        var watcher = new ResizeObserver(schedule);
        records.forEach(function (rec) { watcher.observe(rec.h); });
        watcher.observe(article);
      }
      [100, 400, 1000].forEach(function (ms) { setTimeout(schedule, ms); });
    })();
    // An untitled post's link line moves to the bottom, under "View original", which keeps
    // linking to the post itself.
    (function () {
      var article = document.querySelector(".article");
      if (!article || !article.classList.contains("untitled")) return;
      var row = document.querySelector(".article-header .external-link");
      var from = row && row.querySelector("a");
      var domain = row && row.querySelector(".external-link-url");
      var view = document.querySelector(".view-post a");
      if (row && from && view && domain && domain.textContent.trim() && !row.classList.contains("same-page")) {
        view.parentNode.appendChild(row);
      }
    })();
    // The link line's label: "Source: example.com", or "A follow-up to example.com" when
    // the post links to another page on its own site. The words follow the reader's
    // language; they replace NetNewsWire's generic "Link:".
    (function () {
      var row = document.querySelector(".external-link");
      var from = row && row.querySelector("a");
      var label = row && row.querySelector(".external-link-label");
      var own = document.querySelector(".article-header h1 a");
      if (!from || !label || !own) return;
      var words = daisy.words || [];
      var hostOf = function (href) {
        try { return new URL(href).hostname.replace(/^www\./i, "").toLowerCase(); } catch (error) { return ""; }
      };
      var target = hostOf(from.getAttribute("href"));
      var site = [hostOf(own.getAttribute("href")), hostOf((document.querySelector(".feed") || {}).href || "")];
      // Only a link that looks like a past post counts as a follow-up: a dated path, a known
      // post folder, or a slug. Pages like /feeds/sponsors or /about are plain sources.
      var isPost = function (href) {
        var u;
        try { u = new URL(href); } catch (error) { return false; }
        if (/^(p|post|id|article|story|page_id)$/i.test(Array.from(u.searchParams.keys())[0] || "")) return true;
        var parts = u.pathname.split("/").filter(Boolean);
        if (!parts.length || /^(feeds?|rss|atom|about|archives?|tags?|categor(y|ies)|contact|sponsors?|search|subscribe|colophon|membership|members)$/i.test(parts[0])) return false;
        if (/(^|\/)(19|20)\d\d\/\d{1,2}(\/|$)/.test(u.pathname) || /^(19|20)\d\d$/.test(parts[0])) return true;
        if (/^(linked|a|articles?|blog|posts?|p|stor(y|ies)|news|entry|entries|notes?|journal|essays?|reviews?|features?)$/i.test(parts[0]) && parts.length > 1) return true;
        var last = parts[parts.length - 1].replace(/\.\w+$/, "");
        return parts.length > 1 ? /-/.test(last) : (last.match(/-/g) || []).length >= 2;
      };
      var inSite = target && site.indexOf(target) >= 0 && isPost(from.getAttribute("href"));
      var text = inSite ? words[7] : words[6];
      if (text) label.textContent = text;
    })();
    // Mastodon and Bluesky: the credit reads "Name on Mastodon" (the name links to the
    // profile) and the bottom line says "View post".
    (function () {
      var credit = document.querySelector(".attribution");
      var author = credit && credit.querySelector(".byline");
      var joiner = credit && credit.querySelector(".byline-for");
      var blog = credit && credit.querySelector(".feed");
      var own = document.querySelector(".article-header h1 a");
      if (!author || !joiner || !blog || !own) return;
      var url;
      try { url = new URL(own.getAttribute("href")); } catch (error) { return; }
      var platform = null;
      if (url.hostname === "bsky.app") platform = "Bluesky";
      else if (/^\/@[^\/]+\/\d+/.test(url.pathname)) platform = "Mastodon";
      if (!platform) return;
      var words = daisy.words || [];
      var name = (author.textContent.trim() || blog.textContent.trim()).replace(/\s*[-–—]\s*Bluesky$/i, "");
      // "@handle - Real Name" shows the real name; with no name after the handle, the handle stays.
      if (platform === "Bluesky") name = name.replace(/^@\S+\s+[-–—]\s+(?=\S)/, "");
      if (!name) return;
      var profile = document.createElement("a");
      profile.href = blog.getAttribute("href");
      profile.textContent = name;
      author.textContent = "";
      author.appendChild(profile);
      author.style.display = "inline";
      joiner.textContent = words[8] || " on ";
      joiner.style.display = "inline";
      var site = document.createElement("span");
      site.textContent = platform;
      blog.parentNode.replaceChild(site, blog);
      var view = document.querySelector(".view-post a");
      if (view) view.textContent = words[9] || "View post";
    })();
    // Reddit: the feed's "submitted by /u/name [link] [comments]" block is hidden, and its
    // [comments] link moves to the bottom as "Join the conversation". The credit reads
    // "u/name in r/Subreddit": no slash before the user name, and the community's
    // description after the subreddit name is dropped. Only English changes "for" to "in";
    // other languages keep their own joining word.
    (function () {
      var article = document.querySelector(".article");
      var body = document.querySelector(".articleBody");
      if (!article || !body) return;
      var comments = null;
      Array.prototype.some.call(body.querySelectorAll("a[href]"), function (a) {
        if (a.textContent.trim() !== "[comments]") return false;
        var cell = a.closest("td, div, p");
        if (!cell || !/submitted by/i.test(cell.textContent)) return false;
        comments = { link: a, cell: cell };
        return true;
      });
      if (!comments) return;
      article.classList.add("reddit");
      comments.cell.classList.add("reddit-submitted");
      var credit = document.querySelector(".attribution");
      var author = credit && credit.querySelector(".byline");
      var blog = credit && credit.querySelector(".feed");
      if (author) {
        var walker = document.createTreeWalker(author, NodeFilter.SHOW_TEXT);
        var first = walker.nextNode();
        if (first) first.data = first.data.replace(/^(\s*)\/(?=u\/)/, "$1");
      }
      // The subreddit comes from the post's own address (reddit.com/r/name/comments/...), which
      // is reliable; the feed's name is the fallback.
      var own = document.querySelector(".article-header h1 a");
      var sub = null;
      try {
        var postUrl = new URL(own.getAttribute("href"));
        if (/(^|\.)reddit\.com$/i.test(postUrl.hostname)) sub = postUrl.pathname.match(/^\/r\/([^\/]+)/i);
      } catch (error) {}
      var joiner = credit && credit.querySelector(".byline-for");
      if (joiner && daisy.lang && /^en\b/i.test(daisy.lang)) joiner.textContent = " in ";
      if (blog && sub) blog.textContent = "r/" + sub[1];
      else if (blog) blog.textContent = blog.textContent.replace(/^\s*(\/?r\/[^\s:]+).*$/s, "$1").replace(/^\//, "");
      var view = document.querySelector(".view-post a");
      if (view) {
        view.href = comments.link.getAttribute("href");
        view.textContent = (daisy.words && daisy.words[11]) || "Join the conversation";
      }
    })();
    // Lemmy and PieFed: the feed's body is "submitted by user to community / N points | N comments /
    // address". The first line repeats the credit, so it goes; the credit shows just the user
    // name (linked to the profile) before the feed's name; and the address moves to the link
    // line under the title as "Source: address". Sample: fixtures/lemmy.toml.
    (function () {
      var body = document.querySelector(".articleBody");
      if (!body || !/^\s*submitted by\s/i.test(body.textContent)) return;
      var tally = null;
      Array.prototype.some.call(body.querySelectorAll("a[href]"), function (a) {
        if (!/^\d+\s+comments?$/i.test(a.textContent.trim())) return false;
        tally = a;
        return true;
      });
      if (!tally || !/\d+\s+points?\s*\|/i.test(body.textContent)) return;
      // Drop a line: from its first node through the next <br>, or the whole element when
      // nothing else shares it.
      var dropLine = function (start) {
        var parent = start.parentNode;
        var nodes = [];
        for (var n = start; n; n = n.nextSibling) {
          nodes.push(n);
          if (n.nodeName === "BR") break;
        }
        var rest = Array.prototype.some.call(parent.childNodes, function (n) {
          return nodes.indexOf(n) < 0 && (n.nodeType === 1 || n.textContent.trim());
        });
        if (!rest && parent !== body) { parent.parentNode.removeChild(parent); return; }
        nodes.forEach(function (n) { parent.removeChild(n); });
      };
      var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
      var first = walker.nextNode();
      while (first && !/^\s*submitted by\s/i.test(first.data)) first = walker.nextNode();
      if (!first) return;
      // The address is the line with nothing but a link whose text is an address.
      var source = null;
      Array.prototype.some.call(body.querySelectorAll("a[href]"), function (a) {
        if (a === tally || !/^https?:\/\/\S+$/i.test(a.textContent.trim())) return false;
        source = a;
        return true;
      });
      var address = source && source.getAttribute("href");
      var sourceText = source && source.textContent.trim();
      if (source) {
        var after = source.nextSibling;
        var line = source.previousSibling && source.previousSibling.nodeName === "BR" ? source.previousSibling : source;
        if (line === source) { dropLine(source); }
        else {
          var holder = source.parentNode;
          holder.removeChild(source);
          holder.removeChild(line);
        }
      }
      dropLine(first);
      // Mark the block holding the points line so the stylesheet can give it paragraph
      // spacing against an image that follows (or sits inside it).
      var tallyBlock = tally;
      while (tallyBlock.parentNode && tallyBlock.parentNode !== body) tallyBlock = tallyBlock.parentNode;
      if (tallyBlock.nodeType === 1 && tallyBlock !== body) tallyBlock.classList.add("lemmy-tally");
      var credit = document.querySelector(".attribution");
      var author = credit && credit.querySelector(".byline");
      if (author) {
        var profile = author.querySelector("a[href]");
        var href = profile ? profile.getAttribute("href") : author.textContent.trim();
        var name = null;
        try { name = new URL(href).pathname.replace(/\/+$/, "").split("/").pop(); } catch (error) {}
        if (name && /^https?:\/\//i.test(author.textContent.trim())) {
          var link = document.createElement("a");
          link.href = href;
          link.textContent = decodeURIComponent(name);
          author.textContent = "";
          author.appendChild(link);
        }
      }
      var row = document.querySelector(".article-header .external-link");
      var anchor = row && row.querySelector("a");
      var label = row && row.querySelector(".external-link-label");
      var domain = row && row.querySelector(".external-link-url");
      if (address && anchor && label && domain) {
        anchor.setAttribute("href", address);
        label.textContent = (daisy.words && daisy.words[6]) || "Source:";
        domain.textContent = sourceText.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
        row.classList.remove("same-page");
      }
    })();
    // Linked posts that wrap the link in the body: an opening line "\uD83D\uDCCE Linking to <a>site</a>" and,
    // at the very end, "<a>Read it at site \u2192</a> \u00b7 <a>Permalink</a>". Both are removed, only
    // "Permalink" stays, and the address moves to the link line under the title as "Source: address".
    // Sample: fixtures/linking-to-wrapper.toml.
    (function () {
      var body = document.querySelector(".articleBody");
      var row = document.querySelector(".article-header .external-link");
      var anchor = row && row.querySelector("a");
      var label = row && row.querySelector(".external-link-label");
      var domain = row && row.querySelector(".external-link-url");
      if (!body || !anchor || !label || !domain) return;
      var paras = Array.prototype.filter.call(body.children, function (el) { return el.tagName === "P"; });
      var opener = paras[0];
      var hasOpener = opener && /^\s*\uD83D\uDCCE\s*Linking to\s/i.test(opener.textContent) && opener.querySelector("a[href]");
      var closer = null, readIt = null;
      var lastPara = paras[paras.length - 1];
      if (lastPara) {
        var links = Array.prototype.slice.call(lastPara.querySelectorAll("a[href]"));
        readIt = links.filter(function (a) { return /^\s*Read it at\s/i.test(a.textContent); })[0];
        var permalink = links.filter(function (a) { return /^\s*Permalink\s*$/i.test(a.textContent); })[0];
        if (readIt && permalink && readIt.parentNode === lastPara) closer = lastPara;
        else readIt = null;
      }
      if (!hasOpener && !closer) return;
      var address = (readIt || (hasOpener && opener.querySelector("a[href]"))).getAttribute("href");
      if (!/^https?:\/\//i.test(address)) return;
      if (hasOpener) opener.parentNode.removeChild(opener);
      if (closer) {
        // The separator after the link goes with it: " \u00b7 " between the two links.
        var next = readIt.nextSibling;
        if (next && next.nodeType === 3) next.data = next.data.replace(/^[\s\u00a0]*[\u00b7\u2022|\u2014\u2013-]?[\s\u00a0]*/, "");
        closer.removeChild(readIt);
      }
      anchor.setAttribute("href", address);
      label.textContent = (daisy.words && daisy.words[6]) || "Source:";
      domain.textContent = address.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
      row.classList.remove("same-page");
    })();
    // A feed that gives the author as "email (Name)" shows only the name. Smashing Magazine's
    // feed name, "Articles on Smashing Magazine — For Web Designers And Developers", also
    // shortens to "Smashing Magazine", and Le Monde's, "Le Monde.fr - Actualités et Infos en France et dans le monde",
    // to "Le Monde", and Engadget's, "Engadget - Technology News & Expert Reviews", to "Engadget", and NASA Photojournal's, "NASA's Photojournal: Images of Photojournal and when applicable, their available satellites.", to "NASA Photojournal". An Italian staff credit, "Redazione <feed name>", is no
    // person, so it is treated as the publication itself and the credit shows it once. A
    // publication ending in "by <the author>" drops that ending. Four or more comma-separated
    // authors show as a count, "4 authors". Sample: fixtures/many-authors.toml.
    (function () {
      var credit = document.querySelector(".attribution");
      var author = credit && credit.querySelector(".byline");
      var blog = credit && credit.querySelector(".feed");
      if (!author || !blog) return;
      var match = author.textContent.match(/^\s*[^\s@()]+@[^\s@()]+\s*\(([^)]+)\)\s*$/);
      if (match) author.textContent = match[1].trim();
      // An RSS label in the publication name is dropped: "CNN.com - RSS Channel - App International
      // Edition" shows as "CNN.com - App International Edition". The label is RSS or Atom, with
      // "Feed" or "Channel" after it, and sits in brackets or between separators (dash, pipe,
      // bullet, colon) after the first segment. Sample: fixtures/rss-label.toml.
      (function () {
        var label = /^(?:rss|atom)(?:\s+(?:feeds?|channels?))?$/i;
        var text = blog.textContent.replace(/\s*[(\[]\s*(?:rss|atom)(?:\s+(?:feeds?|channels?))?\s*[)\]]/gi, "");
        var pieces = text.split(/(\s+[-\u2013\u2014|\u2022]\s+|\s*:\s+)/);
        var kept = [pieces[0]];
        for (var i = 2; i < pieces.length; i += 2) {
          if (!label.test(pieces[i].trim())) kept.push(pieces[i - 1], pieces[i]);
        }
        text = kept.join("");
        if (text.trim() && text !== blog.textContent) blog.textContent = text;
      })();
      if (/^\s*Articles on Smashing Magazine/i.test(blog.textContent)) blog.textContent = "Smashing Magazine";
      if (/^\s*Le Monde\.fr\s+-\s/i.test(blog.textContent)) blog.textContent = "Le Monde";
      if (/^\s*Engadget\b.+/i.test(blog.textContent)) blog.textContent = "Engadget";
      if (/^\s*NASA['\u2019]s Photojournal\b.+/i.test(blog.textContent)) blog.textContent = "NASA Photojournal";
      // Filler in a publication name goes: a closing "Latest Articles" ("Eurogamer.net Latest
      // Articles") and an opening "Latest from" ("Latest from Cyclingnews"). A bare site address
      // with a section tag ("www.espn.com - TOP") shows the site without the "www." or the tag;
      // ESPN, TMZ, LAist, Eurogamer and xkcd show their plain names, and "The Oatmeal - Comics" drops "- Comics". A name that is a sentence of description (over 60
      // characters or 8 words) is replaced by the feed's own site name. Sample: fixtures/feed-filler.toml.
      (function () {
        var text = blog.textContent.replace(/\s+/g, " ").trim();
        // Names that are spelled out in full. The key is the feed's name in lowercase.
        var aliases = {
          "chs capitol hill seattle news": "CHS Capitol Hill",
          "local news: breaking boston news, politics, crime, and traffic": "Boston.com"
        };
        var alias = aliases[text.toLowerCase()];
        // "Local News - CBS Colorado" is a section of the station's site, so it shows just the station.
        var local = text.match(/^local news\s*[-\u2013\u2014:]\s+(\S.{0,40})$/i);
        var out = alias || (local && local[1].split(/\s+/).length <= 4 ? local[1] : text);
        // "cs updates on arXiv.org" is just arXiv.org. GitHub's feed names read "Release notes from
        // repo" and "Recent Commits to repo:branch", so the repository comes first:
        // "repo release notes", "repo:branch recent commits". Samples: fixtures/arxiv.toml, fixtures/github-releases.toml.
        out = out.replace(/^.*\bupdates on (arxiv\.org)$/i, "arXiv.org").replace(/^release notes from (\S.*)$/i, "$1 release notes").replace(/^recent commits to (\S.*)$/i, "$1 recent commits");
        out = out.replace(/\s+latest\s+(?:articles|news|posts|stories|updates)$/i, "").replace(/^latest\s+(?:articles\s+)?from\s+/i, "");
        var names = { "espn.com": "ESPN", "tmz.com": "TMZ", "laist.com": "LAist", "eurogamer.net": "Eurogamer", "xkcd.com": "xkcd" };
        if (alias) { if (out !== text) blog.textContent = out; return; }
        var site = out.match(/^(www\.)?([\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*\.[a-z]{2,})(?:\s+[-\u2013\u2014|]\s+\p{Lu}[\p{Lu}\s]{1,11})?$/iu);
        if (site) {
          if (names[site[2].toLowerCase()]) out = names[site[2].toLowerCase()];
          else if (site[1] || out !== site[2]) out = site[2];
        } else if (out.length > 60 || out.split(" ").length > 8) {
          try { out = new URL(blog.getAttribute("href")).hostname.replace(/^www\./i, ""); } catch (error) {}
          if (names[out.toLowerCase()]) out = names[out.toLowerCase()];
        }
        out = out.replace(/^(The Oatmeal)\s+[-\u2013\u2014]\s+Comics$/i, "$1");
        if (out && out !== text) blog.textContent = out;
      })();
      // Some feeds always send the agency as the author ("U.S. Geological Survey", "NWS"). The
      // publication already says who it is, so the author is hidden and only the publication shows.
      // Sample: fixtures/agency-author.toml.
      (function () {
        var plain = author.textContent.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
        if (/^(?:us|usa)geologicalsurvey$|^nws$|^nationalweatherservice$/.test(plain)) author.textContent = "";
      })();
      // Lobsters sends "address by user" and "address via user", where the address is the story's own
      // link, which the link line under the title already shows. The address and the "by" or "via"
      // go, so the credit reads "user for Lobsters". Only an address that matches the link line
      // counts. Samples: fixtures/lobsters-by.toml, fixtures/lobsters-via.toml.
      (function () {
        var anchor = document.querySelector(".article-header .external-link a");
        var href = anchor && anchor.getAttribute("href");
        if (!href) return;
        var hostOf = function (value) {
          try { return new URL(/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : "https://" + value).hostname.replace(/^www\./i, "").toLowerCase(); } catch (error) { return ""; }
        };
        var walker = document.createTreeWalker(author, NodeFilter.SHOW_TEXT);
        var first = walker.nextNode();
        var match = first && first.data.match(/^(\s*)(\S+)\s+(?:by|via)\s+/i);
        if (match && hostOf(match[2]) && hostOf(match[2]) === hostOf(href)) first.data = first.data.slice(match[0].length);
      })();
      // A byline that opens with "By" ("By Ethan Stark-Miller") drops the word, whenever a name
      // starts right after it. Sample: fixtures/by-prefix.toml.
      (function () {
        var walker = document.createTreeWalker(author, NodeFilter.SHOW_TEXT);
        var first = walker.nextNode();
        if (first) first.data = first.data.replace(/^(\s*)by\s+(?=\p{Lu})/iu, "$1");
      })();
      // A credit with debris in it is tidied piece by piece. Text after a pipe is an affiliation
      // ("Name | Associated Press") and goes. "email (Name)" shows the name, a bare email goes,
      // a name given twice shows once, and "Name @ Blog" or "Name (Blog)" with the publication's
      // own name shows just the name. A job description after a name ("Sandra Scott and author at
      // the VP Chicago") is cut off. "TMZ Staff" in the TMZ feed is the publication itself.
      // Names with links are left as they are. Sample: fixtures/credit-debris.toml.
      (function () {
        if (author.querySelector("a")) return;
        var tidy = function (text) { return text.replace(/\s+/g, " ").trim(); };
        var plain = function (text) { return text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""); };
        var feed = plain(blog.textContent);
        var raw = author.textContent;
        var bar = raw.indexOf("|");
        if (bar > 0) raw = raw.slice(0, bar);
        var seen = [], kept = [];
        raw.split(",").forEach(function (piece) {
          var name = tidy(piece).replace(/^and\s+/i, "");
          // "Sandra Scott and author at the VP Chicago": a job description after the name goes.
          name = name.replace(/\s+(?:and\s+)?(?:an?\s+)?(?:author|writer|editor|reporter|contributor|columnist|correspondent|journalist|producer|photographer)\s+(?:at|for|of|with)\b.*$/i, "");
          var mail = name.match(/^[^\s@()]+@[^\s@()]+(?:\s*\(([^)]+)\))?$/);
          if (mail) name = mail[1] ? tidy(mail[1]) : "";
          var tagged = name.match(/^(.+?)\s*(?:\s@\s|\()\s*([^()]+?)\)?$/);
          if (tagged && feed && plain(tagged[2]) === feed) name = tidy(tagged[1]);
          if (!name || seen.indexOf(plain(name)) >= 0) return;
          seen.push(plain(name));
          kept.push(name);
        });
        var joined = kept.join(", ");
        if (kept.length && (bar > 0 || kept.length !== raw.split(",").length || joined !== tidy(raw))) author.textContent = joined;
        var staff = author.textContent.match(/^\s*(.+?)\s+(?:staff|team|editors?|editorial|newsroom|desk|admin|writers?)\s*$/i);
        if (staff && feed && plain(staff[1]) === feed) author.textContent = blog.textContent;
      })();
      // A publication name that ends in a dash and the author's name ("Letterboxd - Matthew
      // Buchanan") drops that ending, since the byline already shows the name. Dash, en dash, em dash,
      // pipe and colon all count. Sample: fixtures/letterboxd.toml.
      (function () {
        var plain = function (text) { return text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""); };
        var who = plain(author.textContent);
        var tail = blog.textContent.match(/^(.*\S)\s+[-\u2013\u2014|:]\s+(.+?)\s*$/);
        if (who && tail && plain(tail[2]) === who) blog.textContent = tail[1];
      })();
      var staff = author.textContent.match(/^\s*Redazione\s+(.+?)\s*$/i);
      var clean = function (text) { return text.replace(/\s+/g, " ").trim().toLowerCase(); };
      if (staff && clean(staff[1]) === clean(blog.textContent)) author.textContent = blog.textContent;
      // A publication that ends in "by <the author>" ("Name for Site by Name") drops that ending.
      var by = blog.textContent.match(/^(.*\S)\s+by\s+(.+?)\s*$/i);
      if (by && clean(by[2]) && clean(by[2]) === clean(author.textContent)) blog.textContent = by[1];
      // Four or more names separated by commas ("A, B, C, D") are a long author list, so the
      // credit counts them: "4 authors for Nature".
      var names = author.textContent.split(",").map(function (name) { return name.replace(/^\s*and\s+/i, "").trim(); }).filter(Boolean);
      // Several authors are rebuilt in one form for the reader's language ("A and B",
      // "A, B, and C"), as many as fit on two lines (three on touch) with room left before the date. When
      // they do not all fit, the first name stays and the rest are counted: "A and 4 others".
      // Only a list where every piece looks like a full name is rebuilt, so "Smith, John",
      // "Jane Doe, PhD" and "Acme, Inc." are left as written. Author links survive.
      // Sample: fixtures/many-authors.toml, fixtures/two-authors.toml.
      // One item per author. A linked name keeps its link, and a plain name beside it stays text.
      var items = [];
      var current = { text: "", node: null };
      var flush = function () {
        var text = current.text.replace(/^\s*and\s+/i, "").replace(/\s+/g, " ").trim();
        if (text) items.push({ text: text, node: current.node });
        current = { text: "", node: null };
      };
      Array.prototype.forEach.call(author.childNodes, function (child) {
        if (child.nodeType === 3) {
          child.data.split(",").forEach(function (part, i) { if (i > 0) flush(); current.text += part; });
        } else {
          if (child.tagName === "A" && !current.text.replace(/^\s*(and)?\s*$/i, "")) current.node = child;
          current.text += child.textContent;
        }
      });
      flush();
      var fullName = function (item) {
        var words = item.text.split(/\s+/);
        return words.length >= 2 && !/[\d@&]|\band\b/i.test(item.text) &&
          !words.some(function (w) { return /^(jr|sr|ii|iii|iv|phd|md|dr|inc|llc|ltd|corp|esq)\.?$/i.test(w); });
      };
      var meta = credit.parentNode;
      var date = meta && meta.querySelector(".dateline");
      if (items.length < 2 || !date || !items.every(fullName) || typeof Intl.ListFormat !== "function") {
        if (names.length > 3) author.textContent = names.length + " authors";
        return;
      }
      var formatter;
      try { formatter = new Intl.ListFormat(daisy.lang, { style: "long", type: "conjunction" }); }
      catch (e) { formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" }); }
      var render = function (shown) {
        var labels = items.slice(0, shown).map(function (item) { return item.text; });
        if (shown < items.length) labels.push(items.length - shown + " others");
        var next = 0;
        author.textContent = "";
        formatter.formatToParts(labels).forEach(function (part) {
          if (part.type !== "element") { author.appendChild(document.createTextNode(part.value)); return; }
          var item = next < shown ? items[next] : null;
          next++;
          author.appendChild(item && item.node ? item.node.cloneNode(true) : document.createTextNode(part.value));
        });
      };
      // The credit may not run closer than this to the date. In the largest text sizes the
      // date sits below the credit, and the credit may use the whole width.
      var PAD = 2.5 * parseFloat(getComputedStyle(credit).fontSize);
      // On a desktop it also stops at 60% of the width, so a long list wraps well short of the
      // right edge and collapses after two lines. A touch device or narrow window is more
      // liberal: the full width, and three lines before the list collapses.
      var touch = window.matchMedia("(hover: none), (max-width: 34rem)");
      // A list that does not fit opens on a tap, and the content below moves down. A tap on
      // the author part, on the date, anywhere else on the page, or Escape closes it. It opens and
      // closes at once, with no animation. Opening it closes the time that
      // the date shows. While it is open, a linked name opens its link instead.
      var expanded = false, overflowing = false;
      var hasLinks = items.some(function (item) { return item.node; });
      var sync = function () {
        author.classList.toggle("expandable", overflowing);
        if (overflowing && (!expanded || !hasLinks)) {
          author.setAttribute("role", "button");
          author.setAttribute("aria-expanded", expanded ? "true" : "false");
        } else {
          author.removeAttribute("role");
          author.removeAttribute("aria-expanded");
        }
        if (overflowing) author.setAttribute("tabindex", "0"); else author.removeAttribute("tabindex");
      };
      var fit = function () {
        var stacked = getComputedStyle(meta).flexDirection === "column";
        var CAP = touch.matches ? 1 : 0.6, LINES = touch.matches ? 3 : 2;
        credit.style.maxWidth = stacked ? "" : Math.max(0, Math.min(CAP * meta.clientWidth, meta.clientWidth - date.offsetWidth - PAD)) + "px";
        var style = getComputedStyle(credit);
        var line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.3;
        render(items.length);
        overflowing = items.length >= 4 || credit.getBoundingClientRect().height > LINES * line + 1;
        if (overflowing && !expanded) render(1);
        sync();
      };
      var set = function (open) {
        if (!overflowing || open === expanded) return;
        expanded = open;
        render(expanded ? items.length : 1);
        sync();
      };
      author.addEventListener("click", function (event) {
        if (!overflowing) return;
        var link = event.target.closest && event.target.closest("a");
        if (link && expanded && author.contains(link)) return;
        event.preventDefault();
        set(!expanded);
      });
      author.addEventListener("keydown", function (event) {
        if (overflowing && event.target === author && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          set(!expanded);
        }
      });
      date.addEventListener("click", function () { set(false); });
      document.addEventListener("click", function (event) { if (expanded && !author.contains(event.target)) set(false); });
      document.addEventListener("keydown", function (event) { if (event.key === "Escape") set(false); });
      author.dataset.managed = "1";
      fit();
      var timer;
      window.addEventListener("resize", function () { clearTimeout(timer); timer = setTimeout(fit, 50); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    })();
    // "Manton Reece for Manton Reece": when the author and the blog have the same name,
    // the credit shows it once.
    (function () {
      var credit = document.querySelector(".attribution");
      var author = credit && credit.querySelector(".byline");
      var blog = credit && credit.querySelector(".feed");
      if (!author || !blog) return;
      var clean = function (text) { return text.replace(/\s+/g, " ").trim().toLowerCase(); };
      if (clean(author.textContent) && clean(author.textContent) === clean(blog.textContent)) {
        credit.classList.add("same-name");
      }
    })();
    // The last resort for a byline that no rule above has shortened enough: if "Author for
    // Blog" still runs past the limit (two lines, three on touch), only the longer of the two
    // is cut, at a word, with an ellipsis. A tap opens the full text and a second tap follows
    // its link. A collapsed author list is left alone, so the blog is the one that is cut.
    // Samples: fixtures/long-byline.toml, fixtures/long-publication.toml.
    (function () {
      var credit = document.querySelector(".attribution");
      var author = credit && credit.querySelector(".byline");
      var blog = credit && credit.querySelector(".feed");
      if (!author || !blog) return;
      var meta = credit.parentNode;
      var date = meta && meta.querySelector(".dateline");
      var touch = window.matchMedia("(hover: none), (max-width: 34rem)");
      var fields = [author, blog].map(function (el) {
        return { el: el, full: el.innerHTML, expanded: false, clipped: false };
      });
      var width = function (el) {
        return Array.prototype.reduce.call(el.getClientRects(), function (sum, r) { return sum + r.width; }, 0);
      };
      var overflows = function () {
        var style = getComputedStyle(credit);
        var line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.3;
        return credit.getBoundingClientRect().height > (touch.matches ? 3 : 2) * line + 1;
      };
      // The text cut to its first n characters, ending at a word, with markup and links kept.
      var clip = function (field, n) {
        var el = field.el;
        el.innerHTML = field.full;
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        var nodes = [], node;
        while ((node = walker.nextNode())) nodes.push(node);
        var left = n, last = null;
        nodes.forEach(function (text) {
          if (left <= 0) { text.parentNode.removeChild(text); return; }
          if (text.data.length > left) {
            var cut = text.data.slice(0, left);
            if (/\S/.test(text.data.charAt(left)) && /\s/.test(cut)) cut = cut.replace(/\s+\S*$/, "");
            text.data = cut.replace(/[\s,;:\-–—(]+$/, "");
            left = 0;
          } else {
            left -= text.data.length;
          }
          last = text;
        });
        if (last) last.data += "…";
        Array.prototype.slice.call(el.querySelectorAll("a, span, em, strong")).forEach(function (child) {
          if (!child.textContent) child.parentNode.removeChild(child);
        });
        field.clipped = true;
      };
      var restore = function (field) {
        field.el.innerHTML = field.full;
        field.clipped = false;
      };
      // The most characters the field can keep while the byline fits, or 0 if none will do.
      var shrink = function (field) {
        var lo = 8, hi = field.el.textContent.length - 1, best = 0;
        while (lo <= hi) {
          var mid = (lo + hi) >> 1;
          clip(field, mid);
          if (overflows()) hi = mid - 1; else { best = mid; lo = mid + 1; }
        }
        if (best) clip(field, best); else restore(field);
        return best;
      };
      var sync = function (field) {
        var el = field.el;
        el.classList.toggle("expandable", field.clipped || field.expanded);
        var hasLink = el.tagName === "A" || !!el.querySelector("a");
        if ((field.clipped || field.expanded) && (!field.expanded || !hasLink)) {
          el.setAttribute("role", "button");
          el.setAttribute("aria-expanded", field.expanded ? "true" : "false");
        } else if (!field.managed) {
          el.removeAttribute("role");
          el.removeAttribute("aria-expanded");
        }
        if (field.clipped || field.expanded) el.setAttribute("tabindex", "0");
        else if (!field.managed) el.removeAttribute("tabindex");
      };
      var fit = function () {
        // An author list that the rule above manages (or has collapsed) is not touched here.
        fields[0].managed = !!author.dataset.managed;
        fields.forEach(function (field) {
          if (field.managed || field.expanded) return;
          restore(field);
        });
        if (fields.some(function (field) { return field.expanded; })) return;
        var open = fields.filter(function (field) { return !field.managed; });
        if (overflows() && open.length) {
          open.sort(function (a, b) { return width(b.el) - width(a.el); });
          if (!shrink(open[0]) && open[1]) shrink(open[1]);
        }
        fields.forEach(sync);
      };
      var set = function (field, state) {
        if (!(field.clipped || field.expanded) || state === field.expanded) return;
        field.expanded = state;
        if (state) restore(field); else { field.expanded = false; fit(); return; }
        field.clipped = false;
        sync(field);
      };
      fields.forEach(function (field) {
        var el = field.el;
        el.addEventListener("click", function (event) {
          if (field.managed || !(field.clipped || field.expanded)) return;
          var link = el.tagName === "A" ? el : event.target.closest && event.target.closest("a");
          if (link && field.expanded && el.contains(link)) return;
          event.preventDefault();
          event.stopPropagation();
          if (field.expanded) { field.expanded = false; fit(); } else set(field, true);
        });
        el.addEventListener("keydown", function (event) {
          if (event.target === el && !field.managed && (field.clipped || field.expanded) &&
              (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            if (field.expanded) { field.expanded = false; fit(); } else set(field, true);
          }
        });
      });
      var close = function () {
        if (fields.some(function (field) { return field.expanded; })) {
          fields.forEach(function (field) { field.expanded = false; });
          fit();
        }
      };
      if (date) date.addEventListener("click", close);
      document.addEventListener("click", function (event) { if (!credit.contains(event.target)) close(); });
      document.addEventListener("keydown", function (event) { if (event.key === "Escape") close(); });
      fit();
      var timer;
      window.addEventListener("resize", function () { clearTimeout(timer); timer = setTimeout(fit, 50); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    })();
    // An image a feed floats so text wraps beside it ("float: left", .alignright, align="left")
    // is taken out of the float, along with the block that carries it and its caption. Images
    // 480 pixels wide or more also fill the column (.unfloat-wide); smaller ones stay their own
    // size on a line of their own. Judged once the image has loaded, since the size is the
    // file's own, not what the feed writes in width="". Sample: fixtures/wikipedia-featured.toml.
    // A bare image with the old align="left" or align="right" attribute is a thumbnail meant to sit
    // beside the text, so it stays floated at a capped size (.side-thumb). Sample: fixtures/techmeme.toml.
    (function () {
      var body = document.querySelector(".articleBody");
      if (!body) return;
      var apply = function (img) {
        if (/^(left|right)$/i.test(img.getAttribute("align") || "")) {
          // Under 150 pixels wide (a movie poster, an avatar) it would only be enlarged into a blur, so it is dropped.
          img.classList.add(img.naturalWidth && img.naturalWidth < 150 ? "small-media" : "side-thumb");
          return;
        }
        var floated = null;
        for (var el = img; el && el !== body; el = el.parentElement) {
          if (getComputedStyle(el).float !== "none") floated = el;
        }
        if (!floated || floated.classList.contains("unfloat")) return;
        floated.classList.add("unfloat");
        if (img.naturalWidth >= 480) floated.classList.add("unfloat-wide");
        floated.querySelectorAll("div, p, figcaption, small, caption, td").forEach(function (c) {
          if (c.textContent.trim() && !c.querySelector("img")) c.classList.add("float-caption");
        });
      };
      body.querySelectorAll("img:not(.emoji):not(.wp-smiley)").forEach(function (img) {
        if (img.complete) apply(img);
        else img.addEventListener("load", function () { apply(img); });
      });
    })();
    // The article's main image is sometimes a tiny thumbnail the feed meant for a list: a
    // 30-pixel commit avatar, a 100-pixel movie poster. Stretched to the column it is only a
    // blur, so an image under 300 pixels wide is dropped (.small-media). Judged once the image
    // has loaded, since the size is the file's own; until then it stays invisible (.pending)
    // so it never flashes at full width. Feeds: GitHub commits (30 px avatar), Micro.blog posts (100 px poster).
    (function () {
      var article = document.querySelector(".article");
      var wraps = document.querySelectorAll(".primary-media .nnw-primary-image");
      if (!article || !wraps.length) return;
      article.classList.add("judges-media");
      wraps.forEach(function (wrap) {
        var img = wrap.querySelector("img");
        if (!img) return;
        wrap.classList.add("pending");
        var judge = function () {
          wrap.classList.remove("pending");
          if (img.naturalWidth && img.naturalWidth < 300) wrap.classList.add("small-media");
        };
        if (img.complete) judge();
        else {
          img.addEventListener("load", judge);
          img.addEventListener("error", judge);
        }
      });
    })();
    // Code blocks: each <pre> gets a header bar (language label and a Copy button) and
    // syntax colors from the highlight.js build above. A publisher's own language class
    // wins; otherwise the language is guessed, and a guess that is not clearly right
    // leaves the code uncolored under a plain "Code" label. Text the feed already
    // colored is re-colored from its plain text so every block uses Daisy's palette.
    // Without Article JavaScript the blocks stay plain <pre> elements.
    (function () {
      var hljs = window.daisyHighlighter;
      var base = String(daisy.lang || "en").toLowerCase().split("-")[0];
      var key = base === "zh" ? (/hant|tw|hk|mo/i.test(daisy.lang) ? "zh-Hant" : "zh-Hans") : base;
      // [the label for unrecognized code, "Copy", "Copied"]
      var WORDS = {
        en: ["Code", "Copy", "Copied"],
        es: ["Código", "Copiar", "Copiado"],
        fr: ["Code", "Copier", "Copié"],
        de: ["Code", "Kopieren", "Kopiert"],
        it: ["Codice", "Copia", "Copiato"],
        pt: ["Código", "Copiar", "Copiado"],
        nl: ["Code", "Kopiëren", "Gekopieerd"],
        sv: ["Kod", "Kopiera", "Kopierat"],
        da: ["Kode", "Kopiér", "Kopieret"],
        nb: ["Kode", "Kopier", "Kopiert"],
        no: ["Kode", "Kopier", "Kopiert"],
        fi: ["Koodi", "Kopioi", "Kopioitu"],
        pl: ["Kod", "Kopiuj", "Skopiowano"],
        cs: ["Kód", "Kopírovat", "Zkopírováno"],
        ru: ["Код", "Копировать", "Скопировано"],
        uk: ["Код", "Копіювати", "Скопійовано"],
        tr: ["Kod", "Kopyala", "Kopyalandı"],
        ja: ["コード", "コピー", "コピーしました"],
        ko: ["코드", "복사", "복사됨"],
        "zh-Hans": ["代码", "复制", "已复制"],
        "zh-Hant": ["程式碼", "拷貝", "已拷貝"]
      };
      var words = WORDS[key] || WORDS.en;
      // How each language the build knows is written on the label.
      var NAMES = {
        bash: "Shell", c: "C", cpp: "C++", csharp: "C#", css: "CSS", diff: "Diff", go: "Go",
        ini: "Config", java: "Java", javascript: "JavaScript", json: "JSON", kotlin: "Kotlin",
        markdown: "Markdown", objectivec: "Objective-C", php: "PHP", python: "Python",
        ruby: "Ruby", rust: "Rust", sql: "SQL", swift: "Swift", typescript: "TypeScript",
        xml: "HTML", yaml: "YAML"
      };
      // Names feeds use for the same languages.
      var ALIASES = {
        js: "javascript", jsx: "javascript", mjs: "javascript", node: "javascript", ts: "typescript", tsx: "typescript",
        py: "python", python3: "python", rb: "ruby", rs: "rust", golang: "go",
        sh: "bash", shell: "bash", zsh: "bash", console: "bash", terminal: "bash", shellsession: "bash",
        html: "xml", htm: "xml", svg: "xml", xhtml: "xml", plist: "xml",
        yml: "yaml", toml: "ini", conf: "ini", cs: "csharp", "c#": "csharp", "c++": "cpp", cc: "cpp", h: "c",
        objc: "objectivec", "objective-c": "objectivec", kt: "kotlin", md: "markdown", patch: "diff",
        scss: "css", sass: "css", less: "css", jsonc: "json", json5: "json", mysql: "sql", postgresql: "sql", pgsql: "sql"
      };
      var NONE = /^(text|txt|plain|plaintext|none|nohighlight|no-highlight|output|log|raw)$/i;
      var MIN_RELEVANCE = 7;
      var MIN_LENGTH = 24;
      var MAX_LENGTH = 30000;

      function normalize(name) {
        name = String(name || "").toLowerCase().trim();
        return ALIASES[name] || name;
      }
      // The language the publisher declared: language-x, lang-x, highlight-source-x,
      // brush: x, sourceCode x, or a data-lang attribute, on the <pre>, its <code>, or the
      // wrapper around them. Returns "" if none, "plain" if it declared plain text.
      function declared(pre, code) {
        // Splash is the highlighter Swift sites use, so its class names the language.
        if (/(?:^|\s)splash(?:\s|$)/.test(pre.getAttribute("class") || "")) return "swift";
        var nodes = [code, pre, pre.parentElement, pre.parentElement && pre.parentElement.parentElement];
        for (var i = 0; i < nodes.length; i++) {
          var el = nodes[i];
          if (!el || el === document.body || (el.classList && el.classList.contains("articleBody"))) continue;
          var data = el.getAttribute && (el.getAttribute("data-lang") || el.getAttribute("data-language"));
          var cls = el.getAttribute ? (el.getAttribute("class") || "") : "";
          var m = data ? [0, data] : cls.match(/(?:^|\s)(?:language|lang|highlight-source|brush:?|sourceCode|syntax)[-_ :]+([\w#+.-]+)/i);
          if (m) {
            var name = normalize(m[1]);
            if (NONE.test(name)) return "plain";
            if (hljs.getLanguage(name)) return name;
          }
        }
        return "";
      }
      // The code as plain text, with line breaks kept when a feed put each line in its
      // own block-level element instead of writing newlines.
      function plainText(pre) {
        var lines = pre.querySelectorAll(":scope > code > .line, :scope > .line, :scope > code > span.line");
        if (lines.length > 1 && pre.textContent.indexOf("\n") < 0) {
          return Array.prototype.map.call(lines, function (l) { return l.textContent; }).join("\n");
        }
        var clone = pre.cloneNode(true);
        clone.querySelectorAll("br").forEach(function (br) { br.replaceWith("\n"); });
        return clone.textContent;
      }
      // Text a publisher set in a <pre> only to keep its columns lined up (a price list, a
      // table written with spaces) is not code. With no declared language, lines that hold
      // columns and none of the punctuation code needs stay a plain <pre>.
      function isPlainTable(text) {
        if (/[{};=<>|`\\]|\/\/|\/\*|^\s*[#$>]/m.test(text)) return false;
        var lines = text.split("\n").filter(function (l) { return l.trim(); });
        if (lines.length < 3) return false;
        var columns = lines.filter(function (l) { return /\S {2,}\S/.test(l); }).length;
        return columns / lines.length >= 0.5;
      }
      function copyText(text, done) {
        function fallback() {
          var area = document.createElement("textarea");
          area.value = text;
          area.setAttribute("readonly", "");
          area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
          document.body.appendChild(area);
          area.select();
          var ok = false;
          try { ok = document.execCommand("copy"); } catch (e) {}
          document.body.removeChild(area);
          done(ok);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
        } else {
          fallback();
        }
      }

      document.querySelectorAll(".articleBody pre").forEach(function (pre) {
        if (pre.closest(".code-block, .footnote-panel")) return;
        // Line-number gutters that publishers put in their own table column.
        if (pre.closest("td.linenos, td.gutter, .linenodiv, .rouge-gutter, .line-numbers-rows")) return;
        var text = plainText(pre).replace(/\n+$/, "");
        if (!text.trim()) return;
        var code = pre.querySelector(":scope > code");
        var language = "";
        var result = null;
        if (!declared(pre, code) && isPlainTable(text)) return;
        if (hljs && text.length <= MAX_LENGTH) {
          var name = declared(pre, code);
          if (name && name !== "plain") {
            language = name;
            result = hljs.highlight(text, { language: name, ignoreIllegals: true });
          } else if (!name && text.length >= MIN_LENGTH) {
            var guess = hljs.highlightAuto(text);
            if (guess.language && guess.relevance >= MIN_RELEVANCE) {
              language = guess.language;
              result = guess;
            }
          }
        }
        var block = document.createElement("div");
        block.className = "code-block";
        var header = document.createElement("div");
        header.className = "code-header";
        var label = document.createElement("span");
        label.className = "code-language";
        label.textContent = language ? (NAMES[language] || language) : words[0];
        var button = document.createElement("button");
        button.type = "button";
        button.className = "code-copy";
        button.textContent = words[1];
        header.appendChild(label);
        header.appendChild(button);
        pre.parentNode.insertBefore(block, pre);
        block.appendChild(header);
        block.appendChild(pre);

        // Colored code gets Daisy's palette; code left uncolored is flattened to plain
        // text so a feed's own fixed colors cannot clash with the theme or dark mode.
        var inner = document.createElement("code");
        if (result) {
          inner.className = "hljs language-" + language;
          inner.innerHTML = result.value;
        } else {
          inner.textContent = text;
        }
        if (result || pre.querySelector("[style], [class]")) {
          pre.textContent = "";
          pre.appendChild(inner);
        }

        var timer;
        button.addEventListener("click", function (ev) {
          ev.stopPropagation();
          copyText(text, function (ok) {
            if (!ok) return;
            button.textContent = words[2];
            button.classList.add("copied");
            clearTimeout(timer);
            timer = setTimeout(function () {
              button.textContent = words[1];
              button.classList.remove("copied");
            }, 1800);
          });
        });
      });
    })();
    // Progressive enhancement: un-italicize paragraphs that are one big <em>/<i>.
    document.querySelectorAll(".articleBody p, .articleBody div").forEach(function (p) {
      var kids = p.children;
      if (kids.length === 1 && /^(EM|I)$/.test(kids[0].tagName) &&
          kids[0].textContent.trim() === p.textContent.trim()) {
        p.classList.add("no-italic");
      }
    });
    // App Store and Google Play badges: a run of blocks that hold nothing but badges is
    // gathered into one .store-badges row, so the stylesheet can size them alike and put
    // them side by side or stacked. A badge is an image whose alt text or file name names
    // a store and says "get it on" / "download on" (or whose link goes to the store).
    (function () {
      var body = document.querySelector(".articleBody");
      if (!body) return;
      var store = /google[\s_%20-]*play|play[\s_%20-]*store|app[\s_%20-]*store/i;
      var phrase = /get[\s_%20-]*it[\s_%20-]*on|download[\s_%20-]*on|available[\s_%20-]*on|badge/i;
      var storeLink = /^https?:\/\/(play\.google\.com|apps\.apple\.com|itunes\.apple\.com)\//i;
      function isBadge(el) {
        var img = el.tagName === "IMG" ? el :
          (el.tagName === "A" && el.children.length === 1 && el.firstElementChild.tagName === "IMG" ? el.firstElementChild : null);
        if (!img) return false;
        var text = (img.getAttribute("alt") || "") + " " + (img.getAttribute("src") || "");
        var href = el.tagName === "A" ? el.getAttribute("href") || "" : "";
        return store.test(text) && (phrase.test(text) || storeLink.test(href));
      }
      // The badges a block holds, or null when it holds anything else (text, other media).
      function itemsOf(block) {
        if (!/^(P|DIV|FIGURE)$/.test(block.tagName) || block.textContent.replace(/[\s\u00a0]+/g, "")) return null;
        var items = [];
        for (var i = 0; i < block.children.length; i++) {
          var kid = block.children[i];
          if (kid.tagName === "BR") continue;
          if (isBadge(kid)) { items.push(kid); continue; }
          var inner = /^(P|DIV)$/.test(kid.tagName) ? itemsOf(kid) : null;
          if (!inner) return null;
          items = items.concat(inner);
        }
        return items.length ? items : null;
      }
      var run = [];
      function flush() {
        if (!run.length) return;
        var row = document.createElement("aside");
        row.className = "store-badges";
        if (run[0].el.classList.contains("lead")) row.classList.add("lead");
        run[0].el.parentNode.insertBefore(row, run[0].el);
        run.forEach(function (unit) {
          unit.items.forEach(function (item) { item.classList.add("store-badge"); row.appendChild(item); });
          unit.el.parentNode.removeChild(unit.el);
        });
        run = [];
      }
      Array.prototype.slice.call(body.children).forEach(function (el) {
        if (el.classList.contains("blank")) return;
        var items = itemsOf(el);
        if (items) run.push({ el: el, items: items }); else flush();
      });
      flush();
    })();
    // Media never runs taller than the window: tell the stylesheet each image, video and
    // embed's proportions (--ar) so it can shrink the width, centred, to fit the height.
    (function () {
      // On a phone a picture either bleeds to both edges of the screen or stays inside the
      // text column; its edges never end in the gutter between the two. It bleeds only when
      // neither the window-height limit nor its own pixels (--media-cap) hold it narrower
      // than the screen; otherwise its widest size is the column (--media-wmax).
      function fit(el) {
        var ar = parseFloat(el.style.getPropertyValue("--ar"));
        if (!(ar > 0)) return;
        var nw = parseFloat(el.style.getPropertyValue("--nw"));
        var grow = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--media-grow")) || 1;
        var widest = Math.min(window.innerHeight * 0.7 * ar, nw > 0 ? nw * grow : Infinity);
        el.style.setProperty("--media-wmax", widest >= window.innerWidth ? "100vw" : "100%");
      }
      var fitted = [];
      window.addEventListener("resize", function () { fitted.forEach(fit); });
      function mark(el, w, h) {
        if (w > 0 && h > 0) {
          el.style.setProperty("--ar", w / h);
          el.setAttribute("data-ar", "");
          if (fitted.indexOf(el) < 0) fitted.push(el);
          fit(el);
          // A figure passes the proportions on to its caption, which lines up with the picture.
          var fig = el.parentNode;
          if (fig && fig.tagName === "FIGURE") {
            fig.style.setProperty("--ar", w / h);
            fig.setAttribute("data-ar", "");
          }
        }
      }
      function attr(el, name) {
        var v = el.getAttribute(name);
        return /^\d+(\.\d+)?$/.test(v || "") ? parseFloat(v) : 0;
      }
      document.querySelectorAll(".articleBody img, .articleBody video, .articleBody iframe").forEach(function (el) {
        if (el.matches(".emoji, .wp-smiley, .side-thumb, .unfloat, .unfloat *, .store-badges *")) return;
        var tag = el.tagName;
        if (tag === "IMG") {
          var size = function () {
            mark(el, el.naturalWidth, el.naturalHeight);
            // The file's own width caps how far the stylesheet stretches it (--media-cap).
            // A vector image has no fixed size and can grow freely.
            if (el.naturalWidth > 0 && !/\.svg(\?|#|$)/i.test(el.currentSrc || el.src)) { el.style.setProperty("--nw", el.naturalWidth); fit(el); }
          };
          if (el.complete && el.naturalWidth) size();
          else el.addEventListener("load", size);
          mark(el, attr(el, "width"), attr(el, "height"));
        } else if (tag === "VIDEO") {
          var vsize = function () { mark(el, el.videoWidth, el.videoHeight); };
          if (el.videoWidth) vsize();
          else el.addEventListener("loadedmetadata", vsize);
          mark(el, attr(el, "width"), attr(el, "height"));
          if (el.poster) {
            var poster = new Image();
            poster.onload = function () { if (!el.hasAttribute("data-ar")) mark(el, poster.naturalWidth, poster.naturalHeight); };
            poster.src = el.poster;
          }
        } else {
          var src = el.getAttribute("src") || "";
          var w = attr(el, "width"), h = attr(el, "height");
          if (/youtube\.com\/(embed\/[^?]*\?.*\bshorts\b|shorts\/)/i.test(src)) mark(el, 9, 16);
          else if (w && h) mark(el, w, h);
          else if (/youtube|youtu\.be|vimeo|video/i.test(src)) mark(el, 16, 9);
        }
      });
    })();
