# ==========================================
# QuizQuake: BrainStorm Arena - Multi-Stage Cloud Dockerfile
# ==========================================

# Stage 1: Build Frontend Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend Server
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy compiled backend
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/src/data ./src/data
COPY --from=server-builder /app/server/dist/data ./dist/data

# Copy compiled frontend assets for unified single-port cloud serving
COPY --from=client-builder /app/client/dist /app/client/dist

WORKDIR /app
EXPOSE 5000

# Healthcheck for Cloud Orchestrators (AWS, GCP, Kubernetes, Railway, Render)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

CMD ["node", "server/dist/index.js"]
