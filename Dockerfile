# syntax=docker/dockerfile:1

# ---- Build stage --------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --legacy-peer-deps

COPY . .

# DATABASE_URL factice : nécessaire uniquement pour generate/build, pas au runtime
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public" npm run prisma:generate
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public" npm run build

# ---- Runtime stage ------------------------------------------------------
FROM node:24-alpine AS runtime

# Outils runtime utilisés par docker-entrypoint.sh (pg_isready)
RUN apk add --no-cache bash postgresql-client openssl

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

# Retire les dépendances de dev (nuxt, vite, ...). Prisma CLI et tsx sont
# nécessaires au démarrage (migrate deploy + seed) : installés globalement.
RUN npm prune --omit=dev --no-package-lock --legacy-peer-deps \
 && npm install -g tsx prisma@6 \
 && npm cache clean --force

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

# Démarrage : attend Postgres, applique les migrations, seed, puis lance Nuxt
CMD ["sh", "docker-entrypoint.sh"]
