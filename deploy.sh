#!/bin/bash

### Script de déploiement mtg-stats
### Appelé par le webhook GitHub (push sur main) : met à jour le repo et reconstruit le stack Docker.
### Ne pas exécuter avec des modifications locales non commitées.

set -e
cd "$(dirname "$0")"

BRANCH="main"

echo "=== Déploiement mtg-stats démarré à $(date) ==="

if [ ! -d .git ]; then
  echo "Erreur: Ce répertoire n'est pas un repository Git."
  exit 1
fi

if ! git diff-index --quiet HEAD --; then
  echo "Modifications locales détectées : elles seront préservées (aucun reset)."
  LOCAL_CHANGES=true
else
  LOCAL_CHANGES=false
fi

echo "=== Récupération des derniers changements ==="
git fetch origin "$BRANCH"

if [ "$LOCAL_CHANGES" = false ]; then
  git merge --ff-only "origin/$BRANCH" || {
    echo "Merge automatique impossible. Déploiement annulé."
    exit 1
  }
else
  git pull --rebase origin "$BRANCH" || {
    echo "Rebase échoué. Déploiement annulé."
    exit 1
  }
fi

if [ ! -f .env ]; then
  echo "Erreur: Le fichier .env est manquant. Créez-le à partir de .env.example"
  exit 1
fi

echo "=== Reconstruction du stack Docker ==="
# build avant up : le site reste en ligne pendant le build (coupure de quelques secondes seulement)
docker compose build
docker compose up -d --remove-orphans
docker image prune -f

echo "=== Vérification des logs ==="
docker compose logs --tail=30 app

echo "=== Déploiement terminé à $(date) ==="
