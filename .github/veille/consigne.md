# Consigne de la veille quotidienne

Tu prépares la veille d'actualité du jour pour le site « Ma veille quotidienne ». Personne ne peut te répondre pendant l'exécution : ne pose aucune question, travaille seul jusqu'au bout.

Tu n'as qu'UN fichier à produire : `.veille/jour.json`. Tu ne modifies aucun autre fichier du dépôt (ni `data/veille.json`, ni le HTML, le CSS, le JS, le README). La fusion, la validation et la publication sont faites par le workflow après toi.

## 1. Ce qui est déjà publié

Lis `.veille/deja-vus.txt` : il contient la date du jour (heure de Paris), les titres et URL des 7 derniers jours, et les « Le saviez-vous » des 30 derniers jours. Ne republie jamais un article déjà présent (même URL ou même événement) sauf vrai rebondissement, ni un fait « savoir » déjà publié.

## 2. Collecte

Budget : 25 recherches WebSearch au maximum pour toute l'exécution. Commence par les flux et pages ci-dessous avec WebFetch (gratuit), puis complète avec des recherches ciblées et datées (jour, mois et année en cours) pour les rubriques encore vides.

Sources directes :
- Reporterre (RSS) : https://reporterre.net/spip.php?page=backend-simple
- Blast (RSS) : https://api.blast-info.fr/rss_articles.xml
- Next (RSS) : https://next.ink/feed/free
- 404 Media (RSS) : https://www.404media.co/rss/
- Meduza (RSS) : https://meduza.io/rss/en/all
- Pages d'accueil : https://kyivindependent.com/ , https://vert.eco/ , https://bonpote.com/ , https://lareleveetlapeste.fr/

Privilégie les médias indépendants, puis les dépêches d'agence (AFP reprise par d'autres sites) et les sources officielles. Mediapart, L'Humanité, So Foot et Alternatives Économiques ne sont pas lisibles : ne cherche pas à les contourner. Vérifie toujours la date d'un article : rien de plus de 72 heures, sauf un dossier en cours vraiment important (champ `"tag": "Suivi"`).

## 3. Rubriques (champ `tab`)

- `esport` : League of Legends et Valorant (résultats, transferts, annonces de Riot, LEC, LFL, Worlds, MSI, VCT). Autres jeux seulement pour un fait majeur.
- `football` : sélections nationales en priorité (Coupe du monde, Euro, CAN, Ligue des nations, éliminatoires, grands amicaux), puis clubs européens uniquement (Ligue des champions, Europa League, Conference League, Ligue 1, Premier League, Liga, Serie A, Bundesliga) : résultats marquants, qualifiés, éliminés, blessés des favoris.
- `presidentielle` : présidentielle française 2027 (candidatures, alliances, dont LFI et Écologistes, sondages, débats, programmes). Factuel, sans prendre parti.
- `lois` : textes qui avancent (votes à l'Assemblée et au Sénat, CMP, 49.3, Conseil constitutionnel, publication au Journal officiel).
- `international` : diplomatie, sommets, élections à l'étranger.
- `guerres` : Ukraine, Iran et Moyen-Orient, autres conflits armés. Si un média est engagé ou d'opposition, précise-le dans le résumé.
- `economie` : fortes hausses ou baisses de marché (actions, indices, matières premières, crypto), résultats d'entreprises majeures, banques centrales, avec les chiffres exacts.
- `ecologie` : climat, biodiversité, énergie, pollution, COP.
- `tech` : IA, cybersécurité, grandes entreprises tech, jeux vidéo, matériel, régulation numérique.
- `savoir` : UN SEUL « Le saviez-vous » de culture générale (sciences, histoire, tech, nature, langue, géographie), surprenant mais vrai, vérifié, avec une source fiable.

Par rubrique : 3 à 6 articles, moins s'il n'y a vraiment rien de neuf. Jamais d'invention. Regroupe en un seul article plusieurs sources sur le même événement.

## 4. Images

Pour chaque article retenu, récupère l'URL de son image d'aperçu avec WebFetch et la consigne : « Return only the exact og:image (or twitter:image) URL from the page metadata, or NONE ». Garde-la seulement si elle commence par `https://`. Ne télécharge jamais l'image : on stocke uniquement son URL. Sans image, omets le champ.

## 5. Rédaction

Règles strictes : français ; aucun émoji ; aucun tiret long ni demi-cadratin (utilise des virgules, deux-points ou parenthèses) ; aucune citation de plus de 15 mots, paraphrase ; aucune opinion. Vérifie chaque chiffre contre la source.

## 6. Fichier à écrire

Écris `.veille/jour.json` (JSON valide, UTF-8) avec exactement cette structure :

```json
{
  "note": "Une phrase courte si des sources étaient inaccessibles aujourd'hui, sinon chaîne vide.",
  "items": [
    {
      "tab": "football",
      "title": "Titre clair en français, réécrit",
      "summary": "Une à trois phrases factuelles et précises, avec tes mots.",
      "source": "Nom du média",
      "url": "https://exemple.fr/article",
      "image": "https://exemple.fr/image.jpg",
      "publishedAt": "2026-11-21T08:15:00+01:00"
    }
  ]
}
```

Champs facultatifs : `image`, `"paywall": true` (article payant), `"tag": "Suivi"` ou `"Contexte"`.

Termine par un résumé de trois lignes : nombre d'articles par rubrique et les trois titres les plus marquants.
