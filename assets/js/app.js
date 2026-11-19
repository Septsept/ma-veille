/* Ma veille quotidienne : rendu de data/veille.json, sans dépendance. */
(function () {
  "use strict";

  var DATA_URL = "data/veille.json";

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
    savoir: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>'
  };
  function icon(k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[k] || ICONS.une) + "</svg>";
  }

  var TABS = [
    { key: "une", label: "À la une" },
    { key: "esport", label: "Esport" },
    { key: "football", label: "Football" },
    { key: "presidentielle", label: "Présidentielle 2027" },
    { key: "lois", label: "Nouvelles lois" },
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

  var state = { tab: "une", period: 1, q: "", data: null, error: null };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) { return /^https:\/\//i.test(u || "") ? u : null; }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var fmtDay = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  var fmtShort = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
  var fmtTime = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
  var fmtFull = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  function dayFromKey(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fullDate(iso) { var d = new Date(iso); return isNaN(d) ? "inconnue" : fmtFull.format(d); }
  function rel(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return "";
    var h = (Date.now() - d.getTime()) / 36e5;
    if (h >= 0 && h < 1) return "il y a moins d'1 h";
    if (h >= 1 && h < 20) return "il y a " + Math.round(h) + " h";
    return fmtShort.format(d) + ", " + fmtTime.format(d);
  }

  document.getElementById("today").textContent = cap(fmtDay.format(new Date()));

  /* Onglets */
  var tablist = document.getElementById("tablist");
  tablist.innerHTML = TABS.map(function (t) {
    return '<button class="tab" role="tab" type="button" id="tab-' + t.key + '" data-tab="' + t.key + '" aria-selected="false">' +
      icon(t.key) + "<span>" + esc(t.label) + '</span><span class="count" data-count="' + t.key + '"></span></button>';
  }).join("");
  tablist.addEventListener("click", function (e) {
    var b = e.target.closest(".tab");
    if (b) setTab(b.getAttribute("data-tab"), true);
  });

  function setTab(k, push) {
    if (KEYS.indexOf(k) < 0) k = "une";
    state.tab = k;
    if (push) {
      try { history.replaceState(null, "", k === "une" ? location.pathname + location.search : "#" + k); }
      catch (e) { location.hash = k === "une" ? "" : k; }
    }
    var btn = document.getElementById("tab-" + k);
    if (btn && btn.scrollIntoView) btn.scrollIntoView({ block: "nearest", inline: "nearest" });
    render();
    if (push) window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", function () { setTab(location.hash.slice(1) || "une", false); });

  document.querySelector(".seg").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-period]");
    if (!b) return;
    state.period = +b.getAttribute("data-period");
    document.querySelectorAll(".seg button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    render();
  });

  var qTimer;
  document.getElementById("q").addEventListener("input", function (e) {
    clearTimeout(qTimer);
    var v = e.target.value;
    qTimer = setTimeout(function () { state.q = norm(v.trim()); render(); }, 120);
  });

  document.getElementById("content").addEventListener("click", function (e) {
    var b = e.target.closest("[data-goto]");
    if (b) setTab(b.getAttribute("data-goto"), true);
  });

  /* Images : si le média bloque l'affichage, on bascule sur le bandeau de rubrique */
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (img && img.tagName === "IMG" && img.closest(".thumb")) {
      var th = img.closest(".thumb");
      img.remove();
      th.style.background = "var(--c-" + th.getAttribute("data-tab") + ")";
      th.innerHTML = '<span class="fallback">' + icon(th.getAttribute("data-tab")) + "</span>";
    }
  }, true);

  /* Données */
  function visibleItems() {
    var days = (state.data && state.data.days) || [];
    if (!days.length) return [];
    days = days.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var latest = dayFromKey(days[0].date).getTime();
    var chosen = state.period === 1 ? [days[0]] : days.filter(function (d) {
      return latest - dayFromKey(d.date).getTime() < state.period * 864e5;
    });
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
    if (state.q) out = out.filter(function (it) { return norm(it.title + " " + it.summary + " " + it.source).indexOf(state.q) >= 0; });
    out.sort(function (a, b) {
      if (a.day !== b.day) return a.day < b.day ? 1 : -1;
      return (b.publishedAt || "").localeCompare(a.publishedAt || "");
    });
    return out;
  }

  function thumbHtml(it) {
    var img = safeUrl(it.image);
    if (img) {
      return '<div class="thumb" data-tab="' + esc(it.tab) + '"><img src="' + esc(img) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>';
    }
    return '<div class="thumb" data-tab="' + esc(it.tab) + '" style="background:var(--c-' + esc(it.tab) + ')"><span class="fallback">' + icon(it.tab) + "</span></div>";
  }

  function itemHtml(it, compact) {
    var u = safeUrl(it.url);
    var title = u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(it.title) + "</a>" : esc(it.title);
    var pills = "";
    if (it.paywall) pills += '<span class="pill">Payant</span>';
    if (it.tag) pills += '<span class="pill">' + esc(it.tag) + "</span>";
    return '<article class="item' + (compact ? " compact" : "") + '">' + thumbHtml(it) +
      '<div class="body"><div class="kicker"><span class="src">' + esc(it.source) + "</span><span>" + esc(rel(it.publishedAt)) + "</span>" + pills + "</div>" +
      "<h3>" + title + "</h3>" + (it.summary ? "<p>" + esc(it.summary) + "</p>" : "") + "</div></article>";
  }

  function sourceLink(it) {
    var u = safeUrl(it.url);
    if (u) return '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">Source : ' + esc(it.source || "lien") + "</a>";
    return it.source ? '<span class="src">Source : ' + esc(it.source) + "</span>" : "";
  }

  function dykCard(it) {
    if (!it) return "";
    return '<div class="card dyk"><div class="dyk-label">' + icon("savoir") + "Le saviez-vous</div><h3>" + esc(it.title) + "</h3><p>" + esc(it.summary) + "</p>" + sourceLink(it) + "</div>";
  }
  function dykFull(it) {
    return '<div class="dyk-full"><div class="kicker">' + esc(cap(fmtDay.format(dayFromKey(it.day)))) + "</div><h3>" + esc(it.title) + "</h3><p>" + esc(it.summary) + "</p>" + sourceLink(it) + "</div>";
  }

  function render() {
    KEYS.forEach(function (k) {
      var b = document.getElementById("tab-" + k);
      if (b) b.setAttribute("aria-selected", String(k === state.tab));
    });
    var content = document.getElementById("content");
    var side = document.getElementById("side");
    var meta = state.data || {};

    document.getElementById("lastRun").textContent = "Mise à jour : " + (meta.lastRun ? fullDate(meta.lastRun) : (state.data ? "inconnue" : "chargement..."));

    if (state.error) { content.innerHTML = '<p class="notice">' + esc(state.error) + "</p>"; side.innerHTML = ""; return; }
    if (!state.data) return;

    var items = visibleItems();
    var news = items.filter(function (i) { return i.tab !== "savoir"; });
    var counts = {};
    items.forEach(function (it) { counts[it.tab] = (counts[it.tab] || 0) + 1; });
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var k = el.getAttribute("data-count");
      var n = k === "une" ? news.length : (counts[k] || 0);
      el.textContent = n ? String(n) : "";
      el.style.display = n ? "" : "none";
    });

    var dyk = items.filter(function (i) { return i.tab === "savoir"; })[0];
    side.innerHTML = (state.tab !== "savoir" ? dykCard(dyk) : "") +
      '<div class="card status"><h3>État de la veille</h3><dl>' +
      "<dt>Dernier passage</dt><dd>" + esc(meta.lastRun ? fullDate(meta.lastRun) : "inconnu") + "</dd>" +
      "<dt>Prochain</dt><dd>" + esc(meta.nextRun || "chaque jour vers 6 h 45") + "</dd>" +
      "<dt>Articles</dt><dd>" + news.length + " sur la période</dd></dl>" +
      (meta.note ? '<p class="note">' + esc(meta.note) + "</p>" : "") + "</div>";

    if (!items.length) {
      content.innerHTML = '<p class="notice">' + (state.q ? "Aucun article ne correspond à cette recherche sur la période choisie." : "Aucun article pour cette période. La prochaine veille remplira la page.") + "</p>";
      return;
    }

    var html = "";
    if (state.tab === "une") {
      TABS.forEach(function (t) {
        if (t.key === "une" || t.key === "savoir") return;
        var list = items.filter(function (i) { return i.tab === t.key; });
        if (!list.length) return;
        html += '<section class="section"><div class="section-head">' + icon(t.key) + "<h2>" + esc(t.label) + "</h2>" +
          (list.length > 2 ? '<button type="button" data-goto="' + t.key + '">Tout voir (' + list.length + ")</button>" : "") + "</div>" +
          list.slice(0, 2).map(function (i) { return itemHtml(i, true); }).join("") + "</section>";
      });
    } else if (state.tab === "savoir") {
      var facts = items.filter(function (i) { return i.tab === "savoir"; });
      html = facts.length ? facts.map(dykFull).join("") : '<p class="notice">Pas encore de « Le saviez-vous » sur cette période.</p>';
    } else {
      var list2 = items.filter(function (i) { return i.tab === state.tab; });
      if (!list2.length) {
        html = '<p class="notice">Rien de neuf dans « ' + esc(LABEL[state.tab]) + " » sur cette période.</p>";
      } else {
        var cur = "", body = "";
        list2.forEach(function (i) {
          if (state.period > 1 && i.day !== cur) {
            cur = i.day;
            body += '<div class="day-head">' + esc(cap(fmtDay.format(dayFromKey(i.day)))) + "</div>";
          }
          body += itemHtml(i, false);
        });
        html = '<section class="section"><div class="section-head">' + icon(state.tab) + "<h2>" + esc(LABEL[state.tab]) + "</h2></div>" + body + "</section>";
      }
    }
    content.innerHTML = html;
  }

  setTab(location.hash.slice(1) || "une", false);

  fetch(DATA_URL + "?t=" + Date.now(), { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (json) { state.data = json; render(); })
    .catch(function () { state.error = "Impossible de charger la veille. Réessaie dans un instant."; render(); });
})();
