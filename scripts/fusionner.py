"""Valide .veille/jour.json et l'intègre dans data/veille.json.

Rejette les articles mal formés, retire les doublons, supprime les jours de plus
de 30 jours et met à jour la date de passage. Écrit le message de commit dans
GITHUB_OUTPUT. Sort en erreur si rien de valide n'a été produit.
"""
import json
import os
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

PARIS = ZoneInfo("Europe/Paris")
TABS = {"esport", "football", "presidentielle", "lois", "international",
        "guerres", "economie", "ecologie", "tech", "savoir"}
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre"]
# Images d'aperçu qui ne sont que le logo du site (pas une vraie illustration)
GENERIC_IMAGES = ("dhnet.be/resizer/v2/7VMUDRERRBCZFHIRPIT3OFNCE4",)
DEFAULT_NOTE = ("Mediapart, L'Humanité, So Foot et Alternatives Économiques ne sont pas "
                "lisibles par la veille automatique : leurs sujets peuvent apparaître via d'autres médias.")


def clean(text):
    """Remplace les tirets longs et demi-cadratins, interdits sur le site."""
    text = str(text or "").strip()
    for dash in ("—", "–"):
        text = text.replace(f" {dash} ", ", ").replace(dash, "-")
    return text


def valid(it):
    if not isinstance(it, dict) or it.get("tab") not in TABS:
        return False
    if not it.get("title") or not it.get("summary") or not it.get("source"):
        return False
    if not str(it.get("url", "")).startswith("https://"):
        return False
    try:
        datetime.fromisoformat(str(it.get("publishedAt", "")))
    except ValueError:
        return False
    return True


def main():
    now = datetime.now(PARIS)
    today = now.date().isoformat()

    try:
        with open(".veille/jour.json", encoding="utf-8") as f:
            jour = json.load(f)
    except (OSError, json.JSONDecodeError) as exc:
        sys.exit(f"Fichier .veille/jour.json absent ou invalide : {exc}")

    with open("data/veille.json", encoding="utf-8") as f:
        data = json.load(f)

    seen_urls, seen_titles = set(), set()
    for day in data.get("days", []):
        for it in day.get("items", []):
            seen_titles.add(it.get("title", "").strip().lower())
            url = it.get("url", "")
            if url.rstrip("/").count("/") > 2:  # ignore les pages d'accueil
                seen_urls.add(url)

    fresh, rejected = [], 0
    for it in jour.get("items", []):
        if not valid(it):
            rejected += 1
            continue
        item = {k: clean(v) if isinstance(v, str) else v for k, v in it.items()
                if k in {"tab", "title", "summary", "source", "url", "image", "publishedAt", "paywall", "tag"}}
        image = str(item.get("image", ""))
        if item.get("image") and (not image.startswith("https://") or any(g in image for g in GENERIC_IMAGES)):
            item.pop("image")
        key_title = item["title"].lower()
        if item["url"] in seen_urls or key_title in seen_titles:
            rejected += 1
            continue
        seen_urls.add(item["url"])
        seen_titles.add(key_title)
        fresh.append(item)

    if not fresh:
        sys.exit(f"Aucun nouvel article valide ({rejected} rejeté(s)).")

    days = [d for d in data.get("days", []) if d.get("date") != today]
    existing = next((d for d in data.get("days", []) if d.get("date") == today), {"items": []})
    days.insert(0, {"date": today, "items": existing["items"] + fresh})
    days = [d for d in days if (now.date() - datetime.fromisoformat(d["date"]).date()).days <= 30]
    days.sort(key=lambda d: d["date"], reverse=True)

    data["days"] = days
    data["lastRun"] = now.isoformat(timespec="seconds")
    data["nextRun"] = "demain vers 6 h 40"
    data["note"] = clean(jour.get("note")) or DEFAULT_NOTE

    with open("data/veille.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    label = f"{now.day} {MOIS[now.month - 1]} {now.year}"
    print(f"{len(fresh)} article(s) ajouté(s), {rejected} rejeté(s).")
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as f:
            f.write(f"message=Veille du {label}\n")


if __name__ == "__main__":
    main()
