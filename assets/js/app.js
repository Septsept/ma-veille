/* Ma veille quotidienne : rendu des données, sans dépendance.
   Source par défaut : data/veille.json. Une page hôte peut fournir window.VEILLE_SOURCE(onData, onError). */
(function () {
  "use strict";

  var ICONS = {
    une: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2V5Z"/><path d="M17 9h3v8a2 2 0 0 1-2 2"/><path d="M7.5 9h6M7.5 12.5h6M7.5 16h4"/>',
    esport: '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r="1"/><circle cx="17.5" cy="13.5" r="1"/>',
    football: '<circle cx="12" cy="12" r="9"/><path d="m12 7.5 3.8 2.8-1.5 4.5H9.7L8.2 10.3Z"/><path d="M12 3v4.5M20.4 9.6l-4.6.7M17.6 19.2l-3.3-4.4M6.4 19.2l3.3-4.4M3.6 9.6l4.6.7"/>',
    presidentielle: '<path d="M4 11h16v9H4z"/><path d="M8 11V6.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1V11"/><path d="M10 8.5h4M9 15h6"/>',
    lois: '<path d="M12 4v16M7 20h10"/><path d="M5 8h14"/><path d="m5 8-2.5 6a2.8 2.8 0 0 0 5 0Z"/><path d="m19 8-2.5 6a2.8 2.8 0 0 0 5 0Z"/>',
    international: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    guerres: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8 7.5 9.5 4.3-1.5 7.5-4.9 7.5-9.5V6Z"/><path d="M12 8v5M12 16h.01"/>',
    economie: '<path d="M3 20h18"/><path d="m4 15 5-5 4 3 7-7"/><path d="M15 6h5v5"/>',
    ecologie: '<path d="M5 19c8 0 14-5 14-14-9 0-14 6-14 14Z"/><path d="M5 19c3-4 6-7 10-9"/>',
    tech: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',
    savoir: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
    chev: '<path d="m6 9 6 6 6-6"/>'
  };
  function icon(k, cls) {
    return '<svg' + (cls ? ' class="' + cls + '"' : "") + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[k] || ICONS.une) + "</svg>";
  }

  var TABS = [
    { key: "une", label: "À la une" },
    { key: "esport", label: "Esport" },
    { key: "football", label: "Football" },
    { key: "presidentielle", label: "Présidentielle" },
    { key: "lois", label: "Lois" },
    { key: "international", label: "International" },
    { key: "guerres", label: "Guerres" },
    { key: "economie", label: "Économie" },
    { key: "ecologie", label: "Écologie" },
    { key: "tech", label: "Tech" },
    { key: "savoir", label: "Le saviez-vous" }
  ];
  var LABEL = {};
  TABS.forEach(function (t) { LABEL[t.key] = t.label; });
  var KEYS = TABS.map(function (t) { return t.key; });
  var NOIMG = !!window.VEILLE_NO_IMAGES;

  var state = { tab: "une", period: 1, data: null, error: null };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) { return /^https:\/\//i.test(u || "") ? u : null; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var fmtDay = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  var fmtShort = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
  var fmtTime = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

  function dayFromKey(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function when(iso) {
    var d = new Date(iso || "");
    if (isNaN(d)) return "";
    var h = (Date.now() - d.getTime()) / 36e5;
    if (h >= 0 && h < 1) return "il y a moins d'1 h";
    if (h >= 1 && h < 20) return "il y a " + Math.round(h) + " h";
    return fmtShort.format(d);
  }

  /* Navigation */
  var menu = document.getElementById("menu");
  var sheet = document.getElementById("sheet");
  var mbtn = document.getElementById("mbtn");

  function link(t, withCount) {
    return '<a href="#' + (t.key === "une" ? "" : t.key) + '" data-tab="' + t.key + '">' + icon(t.key) + "<span>" + esc(t.label) + "</span>" +
      (withCount ? '<span class="n" data-n="' + t.key + '"></span>' : "") + "</a>";
  }
  menu.innerHTML = TABS.map(function (t, i) { return (i === 1 || i === 10 ? '<div class="sep"></div>' : "") + link(t, true); }).join("");
  sheet.innerHTML = TABS.map(function (t) { return link(t, false); }).join("");

  function onNav(e) {
    var a = e.target.closest("a[data-tab]");
    if (!a) return;
    e.preventDefault();
    setTab(a.getAttribute("data-tab"), true);
  }
  menu.addEventListener("click", onNav);
  sheet.addEventListener("click", onNav);
  mbtn.addEventListener("click", function () {
    var open = sheet.getAttribute("data-open") !== "true";
    sheet.setAttribute("data-open", String(open));
    mbtn.setAttribute("aria-expanded", String(open));
  });

  function setTab(k, push) {
    if (KEYS.indexOf(k) < 0) k = "une";
    state.tab = k;
    sheet.setAttribute("data-open", "false");
    mbtn.setAttribute("aria-expanded", "false");
    if (push) {
      try { history.replaceState(null, "", k === "une" ? location.pathname + location.search : "#" + k); }
      catch (e) { location.hash = k === "une" ? "" : k; }
      window.scrollTo(0, 0);
    }
    render();
  }
  window.addEventListener("hashchange", function () { setTab(location.hash.slice(1) || "une", false); });

  document.getElementById("period").addEventListener("change", function (e) {
    state.period = +e.target.value;
    render();
  });

  document.getElementById("content").addEventListener("click", function (e) {
    var a = e.target.closest("a[data-goto]");
    if (!a) return;
    e.preventDefault();
    setTab(a.getAttribute("data-goto"), true);
  });

  /* Image bloquée par le média : bascule sur le bandeau de rubrique */
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG") return;
    var m = img.closest(".media");
    if (m) m.outerHTML = mediaHtml({ tab: m.getAttribute("data-tab"), url: m.getAttribute("href") }, true);
  }, true);

  /* Données */
  function items() {
    var days = ((state.data && state.data.days) || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    if (!days.length) return [];
    var latest = dayFromKey(days[0].date).getTime();
    var chosen = state.period === 1 ? [days[0]] : days.filter(function (d) { return latest - dayFromKey(d.date).getTime() < state.period * 864e5; });
    var out = [], seen = {};
    chosen.forEach(function (d) {
      (d.items || []).forEach(function (it) {
        if (!it || !it.title || KEYS.indexOf(it.tab) < 1) return;
        var key = (it.url || "") + "|" + it.title;
        if (seen[key]) return;
        seen[key] = 1;
        out.push(Object.assign({ day: d.date }, it));
      });
    });
    out.sort(function (a, b) {
      if (a.day !== b.day) return a.day < b.day ? 1 : -1;
      return (b.publishedAt || "").localeCompare(a.publishedAt || "");
    });
    return out;
  }

  function mediaHtml(it, forceFallback) {
    var u = safeUrl(it.url);
    var open = u ? '<a class="media" data-tab="' + esc(it.tab) + '" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"' : '<div class="media" data-tab="' + esc(it.tab) + '"';
    var close = u ? "</a>" : "</div>";
    var img = !NOIMG && !forceFallback && safeUrl(it.image);
    if (img) return open + '><img src="' + esc(img) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">' + close;
    return open + ' style="background:var(--c-' + esc(it.tab) + ')"><span class="fb">' + icon(it.tab) + "</span>" + close;
  }

  function titleLink(it) {
    var u = safeUrl(it.url);
    return u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(it.title) + "</a>" : esc(it.title);
  }
  function metaLine(it) {
    var bits = [esc(it.source), esc(when(it.publishedAt))];
    if (it.paywall) bits.push("payant");
    return '<div class="meta">' + bits.filter(Boolean).join(" · ") + "</div>";
  }
  function summaryBlock(it, label) {
    if (!it.summary) return "";
    return "<details><summary>" + (label || "Résumé") + "</summary><p>" + esc(it.summary) + "</p></details>";
  }

  function cardHtml(it) {
    return '<article class="card">' + mediaHtml(it) + '<div class="txt">' +
      '<a class="chip" href="#' + it.tab + '" data-goto="' + it.tab + '"><i style="background:var(--c-' + it.tab + ')"></i>' + esc(LABEL[it.tab]) + "</a>" +
      "<h2>" + titleLink(it) + "</h2>" + metaLine(it) + "</div></article>";
  }
  function rowHtml(it) {
    return '<article class="row">' + mediaHtml(it) + "<div>" + metaLine(it) + "<h2>" + titleLink(it) + "</h2>" + summaryBlock(it) + "</div></article>";
  }
  function dykHtml(it) {
    var u = safeUrl(it.url);
    var src = u ? ' <a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">Source : ' + esc(it.source) + "</a>" : "";
    return '<div class="dyk">' + icon("savoir") + '<div><div class="lbl">Le saviez-vous ?</div><div class="t">' + esc(it.title) + "</div>" +
      "<details><summary>Lire</summary><p>" + esc(it.summary) + src + "</p></details></div></div>";
  }

  function render() {
    var current = state.tab;
    document.querySelectorAll("a[data-tab]").forEach(function (a) {
      if (a.getAttribute("data-tab") === current) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    mbtn.innerHTML = icon(current) + "<span>" + esc(LABEL[current]) + "</span>" + icon("chev", "chev");

    var meta = state.data || {};
    var up = new Date(meta.lastRun || "");
    document.getElementById("updated").textContent = isNaN(up) ? "" : "Mis à jour le " + fmtShort.format(up) + " à " + fmtTime.format(up);

    var content = document.getElementById("content");
    if (state.error) { content.innerHTML = '<p class="notice">' + esc(state.error) + "</p>"; return; }
    if (!state.data) return;

    var all = items();
    var counts = {};
    all.forEach(function (it) { counts[it.tab] = (counts[it.tab] || 0) + 1; });
    document.querySelectorAll("[data-n]").forEach(function (el) {
      var k = el.getAttribute("data-n");
      el.textContent = k === "une" || k === "savoir" ? "" : (counts[k] || "");
    });

    var head = '<div class="view-head">' + icon(current) + "<h1>" + esc(LABEL[current]) + "</h1></div>";
    var html = "";

    if (current === "une") {
      var dyk = all.filter(function (i) { return i.tab === "savoir"; })[0];
      var tops = [];
      TABS.forEach(function (t) {
        if (t.key === "une" || t.key === "savoir") return;
        var first = all.filter(function (i) { return i.tab === t.key; })[0];
        if (first) tops.push(first);
      });
      html = (dyk ? dykHtml(dyk) : "") + (tops.length ? '<div class="grid">' + tops.map(cardHtml).join("") + "</div>" : '<p class="notice">Aucun article pour cette période.</p>');
    } else if (current === "savoir") {
      var facts = all.filter(function (i) { return i.tab === "savoir"; });
      html = facts.length ? facts.map(dykHtml).join("") : '<p class="notice">Pas encore de « Le saviez-vous » sur cette période.</p>';
    } else {
      var list = all.filter(function (i) { return i.tab === current; });
      if (!list.length) html = '<p class="notice">Rien de neuf dans cette rubrique sur la période choisie.</p>';
      else {
        var day = "";
        list.forEach(function (it) {
          if (state.period > 1 && it.day !== day) { day = it.day; html += '<div class="day">' + esc(cap(fmtDay.format(dayFromKey(day)))) + "</div>"; }
          html += rowHtml(it);
        });
        html = '<div class="list">' + html + "</div>";
      }
    }
    content.innerHTML = head + html;
  }

  setTab(location.hash.slice(1) || "une", false);

  function onData(json) { state.data = json || { days: [] }; state.error = null; render(); }
  function onError(msg) { state.error = msg || "Impossible de charger la veille. Réessaie dans un instant."; render(); }

  if (typeof window.VEILLE_SOURCE === "function") {
    window.VEILLE_SOURCE(onData, onError);
  } else {
    fetch("data/veille.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(onData)
      .catch(function () { onError(); });
  }
})();
