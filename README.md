# Ma veille quotidienne

Veille d'actualité personnelle, mise à jour chaque matin et classée par rubriques, à partir de médias indépendants, d'agences et de sources officielles.

**Site :** https://septsept.github.io/ma-veille/

## Fonctionnalités

- Dix rubriques plus une page « À la une » qui reprend les deux informations principales de chacune.
- Pour chaque article : titre, résumé de une à trois phrases, source, heure de publication, lien vers l'original et image d'aperçu du média.
- Filtre par période (dernière veille, 7 jours, 30 jours) et recherche plein texte.
- Un « Le saviez-vous » de culture générale par jour, sourcé.
- Site statique sans dépendance ni étape de build : HTML, CSS et JavaScript natifs.

## Rubriques

| Clé | Rubrique | Périmètre |
| --- | --- | --- |
| `esport` | Esport | League of Legends et Valorant, autres jeux seulement pour un fait majeur |
| `football` | Football | Sélections nationales (Coupe du monde, Euro, CAN, Ligue des nations) et clubs européens |
| `presidentielle` | Présidentielle 2027 | Candidatures, alliances, sondages, débats |
| `lois` | Nouvelles lois | Textes en discussion, votés ou publiés au Journal officiel |
| `international` | International | Diplomatie, sommets, élections à l'étranger |
| `guerres` | Guerres | Ukraine, Iran, Moyen-Orient et autres conflits |
| `economie` | Économie | Fortes hausses ou baisses de marché, résultats, banques centrales |
| `ecologie` | Écologie | Climat, biodiversité, énergie, COP |
| `tech` | Tech | IA, cybersécurité, grandes entreprises, jeux vidéo, régulation |
| `savoir` | Le saviez-vous | Un fait de culture générale par jour |

## Fonctionnement

1. Chaque jour vers 6 h 45 (heure de Paris), une tâche planifiée Claude parcourt les flux RSS et les sites des sources, puis effectue des recherches ciblées pour chaque rubrique.
2. Elle rédige un résumé de chaque article retenu, récupère l'adresse de son image d'aperçu (balise `og:image`) et met à jour `data/veille.json`.
3. Le commit est poussé sur `main` et GitHub Pages publie automatiquement la nouvelle version.

Les articles de plus de 30 jours sont retirés du fichier à chaque passage.

## Structure du dépôt

```
.
├── index.html            Page unique du site
├── assets/
│   ├── css/style.css     Styles (thème clair, police Source Sans 3)
│   ├── js/app.js         Chargement des données et rendu
│   └── img/favicon.svg
├── data/
│   └── veille.json       Articles des 30 derniers jours
├── robots.txt            Exclut le site des moteurs de recherche
└── .nojekyll             Désactive le traitement Jekyll de GitHub Pages
```

## Format des données

```json
{
  "lastRun": "2026-11-19T13:30:00+01:00",
  "nextRun": "chaque jour vers 6 h 45",
  "note": "Information affichée dans l'encadré « État de la veille »",
  "days": [
    {
      "date": "2026-11-19",
      "items": [
        {
          "tab": "football",
          "title": "Titre réécrit en français",
          "summary": "Résumé factuel de une à trois phrases.",
          "source": "Nom du média",
          "url": "https://exemple.fr/article",
          "image": "https://exemple.fr/image.jpg",
          "publishedAt": "2026-11-19T08:15:00+01:00",
          "paywall": false,
          "tag": "Suivi"
        }
      ]
    }
  ]
}
```

`image`, `paywall` et `tag` sont facultatifs. Sans image, ou si le média bloque son affichage, la page montre un bandeau à la couleur de la rubrique.

## Lancer en local

Le site lit `data/veille.json` avec `fetch`, il faut donc le servir plutôt que l'ouvrir directement :

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000.

## Sources principales

Reporterre, Vert, Bon Pote, La Relève et la Peste, Blast, Next, 404 Media, Kyiv Independent, Meduza, LCP, Public Sénat, Vie publique, Assemblée nationale, Sénat, ainsi que les dépêches AFP reprises par d'autres sites. Les résumés citent toujours la source d'origine.

## Images et droits

Les images ne sont ni copiées ni stockées dans ce dépôt : la page affiche directement l'image d'aperçu publiée par chaque média, avec un lien vers l'article original. Articles et images restent la propriété de leurs auteurs.

## Contributions

Dépôt personnel : les contributions externes (issues et pull requests) ne sont pas acceptées.

## Licence

Code sous licence [MIT](LICENSE). Les articles et images cités appartiennent à leurs médias respectifs.
