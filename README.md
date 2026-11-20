# Ma veille quotidienne

Veille d'actualité personnelle, mise à jour chaque matin et classée par rubriques, à partir de médias indépendants, d'agences et de sources officielles.

**Site :** https://septsept.github.io/ma-veille/

## Fonctionnalités

- Thème sombre, menu vertical sur ordinateur et grille de rubriques sur mobile.
- Page « À la une » : une carte par rubrique avec l'information principale du jour.
- Pour chaque article : image d'aperçu du média, titre, source, heure et lien vers l'original ; le résumé s'ouvre d'un clic.
- Filtre par période : aujourd'hui, 7 derniers jours, 30 derniers jours.
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

La veille est produite chaque matin par un workflow GitHub Actions (`.github/workflows/veille.yml`) :

1. Vers 6 h 40 (heure de Paris en hiver, 7 h 40 en été), `scripts/preparer.py` liste les articles déjà publiés pour éviter les doublons.
2. Claude, via [Claude Code Action](https://github.com/anthropics/claude-code-action), lit les flux RSS et les sites des sources, complète par des recherches ciblées, rédige les résumés, récupère l'image d'aperçu de chaque article (balise `og:image`) et écrit `.veille/jour.json`. La consigne complète est dans `.github/veille/consigne.md`.
3. `scripts/fusionner.py` valide chaque article, retire les doublons, intègre la journée dans `data/veille.json` et supprime les jours de plus de 30 jours.
4. Le workflow commite le fichier sur `main` et GitHub Pages publie la nouvelle version.

Le workflow peut aussi être lancé à la main depuis l'onglet Actions (« Run workflow »).

### Configuration

La veille utilise l'abonnement Claude du propriétaire du dépôt (Pro ou supérieur), sans clé d'API ni facturation à l'usage.

| Réglage | Emplacement | Rôle |
| --- | --- | --- |
| `CLAUDE_CODE_OAUTH_TOKEN` | Settings, Secrets and variables, Actions, onglet Secrets | Jeton lié à l'abonnement Claude, généré avec `claude setup-token` (valable un an). Sans lui, le workflow ne fait rien. |
| `VEILLE_MODEL` | Même page, onglet Variables | Modèle utilisé (facultatif). Par défaut `claude-sonnet-5-5`. |

Le jeton expire au bout d'un an : il suffit d'en générer un nouveau et de remplacer le secret.

## Structure du dépôt

```
.
├── index.html            Page unique du site
├── assets/
│   ├── css/style.css     Styles (thème sombre, police Source Sans 3)
│   ├── js/app.js         Chargement des données et rendu
│   └── img/favicon.svg
├── data/
│   └── veille.json       Articles des 30 derniers jours
├── scripts/
│   ├── preparer.py       Liste de ce qui est déjà publié
│   └── fusionner.py      Validation et intégration des articles du jour
├── .github/
│   ├── workflows/veille.yml   Workflow quotidien
│   └── veille/consigne.md     Consigne donnée à Claude
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
