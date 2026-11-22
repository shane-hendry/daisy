    // Update notice: when a newer release of this theme exists, a short note and a link to
    // install it close the article. The release's entry in updates.json (published at the
    // address below) holds its version and a sentence written for that release. The
    // file is fetched at most once a day and sends nothing about the reader. Offline or on
    // any error nothing is added. Edit data-version only through scripts/set-version.sh.
    (function () {
      var article = document.querySelector(".article");
      var block = document.querySelector(".theme-update");
      var note = block && block.querySelector(".theme-update-note");
      var title = block && block.querySelector(".theme-update-title");
      if (!article || !note || !title) return;
      var key = article.getAttribute("data-update-key");
      var mine = article.getAttribute("data-version");
      var SITE = "https://daisyrss.com/";
      var DAY = 24 * 60 * 60 * 1000;
      // The title and link text, by the reader's language. Languages not listed use English.
      var WORDS = {
        en: ["Update", "Get the update."], es: ["Actualización", "Obtener la actualización."],
        fr: ["Mise à jour", "Obtenir la mise à jour."], de: ["Update", "Update holen."],
        it: ["Aggiornamento", "Scarica l’aggiornamento."], pt: ["Atualização", "Obter a atualização."],
        nl: ["Update", "Download de update."], sv: ["Uppdatering", "Hämta uppdateringen."],
        da: ["Opdatering", "Hent opdateringen."], nb: ["Oppdatering", "Hent oppdateringen."],
        no: ["Oppdatering", "Hent oppdateringen."], nn: ["Oppdatering", "Hent oppdateringa."],
        fi: ["Päivitys", "Hae päivitys."], pl: ["Aktualizacja", "Pobierz aktualizację."],
        cs: ["Aktualizace", "Získat aktualizaci."], sk: ["Aktualizácia", "Získať aktualizáciu."],
        hu: ["Frissítés", "Frissítés letöltése."], ro: ["Actualizare", "Obține actualizarea."],
        ru: ["Обновление", "Получить обновление."], uk: ["Оновлення", "Отримати оновлення."],
        tr: ["Güncelleme", "Güncellemeyi al."], el: ["Ενημέρωση", "Λήψη της ενημέρωσης."],
        he: ["עדכון", "קבלת העדכון."], ar: ["تحديث", "احصل على التحديث."],
        fa: ["به‌روزرسانی", "دریافت به‌روزرسانی."], hi: ["अपडेट", "अपडेट प्राप्त करें।"],
        th: ["อัปเดต", "รับอัปเดต"], vi: ["Cập nhật", "Nhận bản cập nhật."],
        id: ["Pembaruan", "Dapatkan pembaruan."], ms: ["Kemas kini", "Dapatkan kemas kini."],
        ja: ["アップデート", "アップデートを入手"], ko: ["업데이트", "업데이트 받기"],
        "zh-Hans": ["更新", "获取更新。"], "zh-Hant": ["更新", "取得更新。"]
      };
      var lang = String(daisy.lang || "en").replace("_", "-");
      var base = lang.toLowerCase().split("-")[0];
      var lkey = base === "zh" ? (/hant|tw|hk|mo/i.test(lang) ? "zh-Hant" : "zh-Hans") : base;
      var words = WORDS[lkey] || WORDS.en;
      var parts = function (v) { return /^\d+(\.\d+){0,2}$/.test(v || "") ? v.split(".").map(Number) : null; };
      var newer = function (a, b) {
        for (var i = 0; i < 3; i++) if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
        return false;
      };
      // The notice is meant to be seen now and then, not on every article, and a page cannot
      // reliably remember a dismissal. So it shows only on a long read (about 250 words or more),
      // published within the last five days (the length of the release window), and then on about one article in three, chosen from
      // the article's link so the same article always decides the same way.
      var eligible = function () {
        var body = document.querySelector(".articleBody");
        if (!body || (body.textContent || "").length < 1500) return false;
        var published = daisy.published;
        if (!published || !(Date.now() - published < 5 * DAY)) return false;
        var anchor = document.querySelector(".article-header h1 a");
        var seed = (anchor && anchor.getAttribute("href")) || "";
        var hash = 0;
        for (var i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
        return hash % 3 === 0;
      };
      var show = function (all) {
        var entry = all && all[key];
        var have = parts(mine);
        var latest = entry && parts(entry.version);
        if (!have || !latest || !newer(latest, have)) return;
        // Only for 5 days after the release went out; after that it is never shown.
        // An entry without a release time is not shown.
        var released = Date.parse(entry.released);
        if (!(Date.now() - released < 5 * DAY)) return;
        // The note is one sentence per language ({"en": "...", "de": "..."}); a plain string
        // is English. A language without its own sentence gets the English one.
        var notes = entry.note;
        var text = notes && typeof notes === "object" ? (notes[lkey] || notes.en) : notes;
        text = typeof text === "string" ? text.trim() : "";
        if (!text || text.length > 300) return;
        var link = document.createElement("a");
        // The link opens the site's Updates section on its own, set in this theme's type, with the update steps for Mac and for iPhone and iPad.
        link.href = SITE + "?theme=" + encodeURIComponent(key) + "#updates";
        link.textContent = words[1];
        title.textContent = words[0];
        note.textContent = text + " ";
        note.appendChild(link);
        block.hidden = false;
      };
      if (!eligible()) return;
      var cached = null;
      try { cached = JSON.parse(localStorage.getItem("daisy-updates")); } catch (error) {}
      if (cached && cached.at && Date.now() - cached.at < DAY && cached.data) { show(cached.data); return; }
      if (typeof fetch !== "function") return;
      fetch(SITE + "updates.json", { credentials: "omit", referrerPolicy: "no-referrer" })
        .then(function (response) { return response.ok ? response.json() : null; })
        .then(function (data) {
          if (!data || typeof data !== "object") return;
          try { localStorage.setItem("daisy-updates", JSON.stringify({ at: Date.now(), data: data })); } catch (error) {}
          show(data);
        })
        .catch(function () {});
    })();
