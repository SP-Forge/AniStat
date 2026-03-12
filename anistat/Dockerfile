# Build Next.js app
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build the Next.js application
RUN npm run build

# Production image  
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PATH="/usr/local/bin:${PATH}"

# Install system dependencies for Deno
RUN apt-get update && apt-get install -y --no-install-recommends curl unzip ca-certificates && rm -rf /var/lib/apt/lists/*

# Install Deno
RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh -s -- -y && \
    /usr/local/bin/deno --version

# Copy Next.js built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy backend files
COPY --from=builder /app/backend ./backend

# Create startup script
RUN echo '#!/bin/sh' > start.sh && \
    echo 'set -e' >> start.sh && \
    echo 'echo "Starting backend on port ${BACKEND_PORT:-3333}..."' >> start.sh && \
    echo 'cd /app/backend && BACKEND_PORT=${BACKEND_PORT:-3333} /usr/local/bin/deno run --allow-net --allow-env main.ts &' >> start.sh && \
    echo 'BACKEND_PID=$!' >> start.sh && \
    echo 'echo "Backend started with PID $BACKEND_PID"' >> start.sh && \
    echo 'sleep 2' >> start.sh && \
    echo 'echo "Starting frontend on port ${PORT:-3000}..."' >> start.sh && \
    echo 'if [ -f /app/server.js ]; then FRONTEND_DIR=/app; elif [ -f /app/.next/standalone/server.js ]; then FRONTEND_DIR=/app/.next/standalone; else echo "Could not find Next standalone server.js"; ls -la /app; ls -la /app/.next || true; ls -la /app/.next/standalone || true; exit 1; fi' >> start.sh && \
    echo 'cd "$FRONTEND_DIR" && HOSTNAME=0.0.0.0 PORT=${PORT:-3000} node server.js' >> start.sh && \
    chmod +x start.sh

EXPOSE 3000 3333

CMD ["/bin/sh", "/app/start.sh"]
