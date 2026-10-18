#!/bin/sh
set -e

echo "[Setup] DATABASE_URL: $(echo $DATABASE_URL | sed 's|://[^@]*@|://***@|')"

# -- Wait for PostgreSQL -------------------------------------------
echo "[Setup] Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U "${POSTGRES_USER:-postgres}" 2>/dev/null; do
  sleep 2
done
echo "[Setup] PostgreSQL ready"

# -- Sync database schema (automatique sans migrations manuelles) --
echo "[Setup] Synchronisation automatique du schéma Prisma..."
prisma db push --skip-generate --accept-data-loss
echo "[Setup] Base de données synchronisée"

# -- Seed (upsert : sans risque sur des données existantes) --------
echo "[Setup] Running seed..."
tsx prisma/seed.ts
echo "[Setup] Seed done"

# -- Start application ---------------------------------------------
echo "[Setup] Starting application..."
exec node .output/server/index.mjs
