FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY Backend/package.json Backend/package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY Backend/package.json Backend/package-lock.json ./
COPY Backend/prisma ./prisma
RUN npx prisma generate
COPY Backend/src ./src
COPY Backend/tsconfig.json ./
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy application files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Create keys directory (will be mounted as volume in docker-compose)
RUN mkdir -p /app/keys && chown -R nodejs:nodejs /app/keys

USER nodejs

EXPOSE 4000

CMD ["sh", "-c", "node dist/scripts/generate-keys.js 2>/dev/null || true; node dist/index.js"]

