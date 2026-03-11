# Multi-stage build for both Frontend (Next.js) and Backend (Deno)
FROM node:20-alpine AS base

# Install Deno
RUN apk add --no-cache curl unzip
RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

# Install dependencies for Next.js
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Build Next.js app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Exclude backend from frontend build
RUN rm -rf backend

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy Next.js built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy backend files
COPY backend/ ./backend/

# Cache Deno dependencies
WORKDIR /app/backend
RUN deno install --entrypoint main.ts

# Create startup script
WORKDIR /app
RUN echo '#!/bin/sh' > start.sh && \
    echo 'cd /app/backend && deno run --allow-net --allow-env main.ts &' >> start.sh && \
    echo 'cd /app && node server.js' >> start.sh && \
    chmod +x start.sh

EXPOSE 3000 3333

CMD ["/bin/sh", "/app/start.sh"]
