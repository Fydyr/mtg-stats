# MTG Stats

Suivi mensuel des prix des boosters scellés Magic: The Gathering (marché européen).

**Stack :** Nuxt 3 · Prisma · PostgreSQL · Docker + Traefik.

## Fonctionnement

- **Page publique `/` :**
  - Tableau et vue grille de cartes (avec symboles officiels d'éditions Scryfall).
  - Tri et filtres par catégories de boosters (`Draft`, `Set`, `Play`, `Collector`, `Autres`).
  - Calcul et tri par **Ratio EV / Prix** avec filtre rapide pour les boîtes rentables à l'ouverture (`⚡ EV > Prix`).
  - Sélection multiple (jusqu'à 5 boîtes) avec barre flottante pour lancer la comparaison.
  - Export instantané au format CSV (compatible Excel).
- **Page `/products/:id` :** historique complet, graphique d'évolution avec sélecteurs de période (6 mois, 1 an, 3 ans, Tout), EV estimée, ratio de rentabilité et tooltips mensuels détaillés.
- **Page `/compare` :** outil de comparaison multi-produits avec vue prix brut (€) et vue performance relative (% base 100).
- **Page `/market` :** tableau de bord des tendances macro-économiques du marché scellé, performance comparée par type et palmarès Top 10 (hausses, baisses, opportunités EV).
- **Page `/admin` (mot de passe `NUXT_ADMIN_PASSWORD`) :**
  - **Détection des anomalies :** repérage et filtre des variations de prix suspectes (> +100% ou < -50%).
  - **Importation officielle Cardmarket :** glissez-déposez `products_nonsingles.csv.gz` et `priceguide.csv.gz` (téléchargeables sur [Cardmarket Downloads](https://www.cardmarket.com/fr/Magic/Products/Downloads)) directement dans l'interface sans même les décompresser. L'application classe automatiquement les boîtes (`DRAFT`, `SET`, `PLAY`, `COLLECTOR`), enregistre leur URL Cardmarket directe et applique les prix du jour (`TrendPrice`, `LowPrice` ou `AvgSell`).
  - **Synchronisation automatique Google Sheets :** importe en un clic tous les onglets (`DRAFT`, `SET`, `PLAY`, `COLLECTOR`) depuis le Google Sheet communautaire.
  - **Synchronisation des EV Dawnglare :** calcul automatique des Expected Values.
  - **Import rapide par copier-coller :** collez une liste depuis Excel ou un bloc-notes pour remplir la grille instantanément.
  - **Gestion des boîtes :** modification du type (Draft/Set/Play/Collector), de l'URL Cardmarket et suppression de produits.
  - **Saisie manuelle & Pré-remplissage :** pré-remplissage depuis le mois précédent et enregistrement par mois.

## Dev local (une seule commande)

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs -f app
```

- App : http://localhost:3000
- Admin : http://localhost:3000/admin (mot de passe `admin`)
- PostgreSQL exposé sur `localhost:5432` (`mtgstats`/`mtgstats`)

## Automatisation externe (Webhook / Cron)

Pour automatiser la mise à jour des prix sans passer par le navigateur, l'application expose l'endpoint :
`POST /api/sync/prices`

Header requis (si configuré) :
`X-Sync-Secret: <votre_secret_defini_dans_NUXT_SYNC_SECRET>`

Exemple de payload JSON :
```json
{
  "month": "2026-10",
  "items": [
    { "name": "Ravnica Allegiance", "type": "DRAFT", "price": 125 },
    { "name": "Kamigawa: Neon Dynasty", "type": "SET", "price": 216 },
    { "name": "Modern Horizons 2", "type": "COLLECTOR", "price": 472 }
  ]
}
```

## Production

1. Cloner le repo sur le serveur, créer `.env` depuis `.env.example`
   (`DOMAIN=mtg-stats.aeroliths.fr`, réseau Docker `web` de Traefik déjà existant).
2. `chmod +x deploy.sh docker-entrypoint.sh && ./deploy.sh`
3. Webhook GitHub : événement `push` qui exécute `deploy.sh` sur le serveur.
