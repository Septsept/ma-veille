"""Prépare le contexte de la veille : liste de ce qui est déjà publié."""
import json
import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

PARIS = ZoneInfo("Europe/Paris")
today = datetime.now(PARIS).date()

with open("data/veille.json", encoding="utf-8") as f:
    data = json.load(f)

lines = [f"Date du jour (Paris) : {today.isoformat()}", "", "Articles des 7 derniers jours :"]
facts = []
for day in data.get("days", []):
    age = (today - datetime.fromisoformat(day["date"]).date()).days
    for it in day.get("items", []):
        if it.get("tab") == "savoir" and age <= 30:
            facts.append(f"- {it.get('title', '')}")
        elif age <= 7:
            lines.append(f"- [{it.get('tab')}] {it.get('title', '')} | {it.get('url', '')}")

lines += ["", "Le saviez-vous des 30 derniers jours :"] + facts

os.makedirs(".veille", exist_ok=True)
with open(".veille/deja-vus.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")
print(f"{len(lines) + len(facts)} lignes écrites dans .veille/deja-vus.txt")
