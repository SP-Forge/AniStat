# Build Next.js app
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build the Next.js application
RUN npm run build

# Production image  
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PATH="/usr/local/bin:${PATH}"

# Install system dependencies for Deno
RUN apk add --no-cache curl unzip libgcc libstdc++

# Install Deno
RUN curl -fsSL https://deno.land/install.sh | sh && \
    cp /root/.deno/bin/deno /usr/local/bin/deno && \
    chmod +x /usr/local/bin/deno && \
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
    echo 'echo "Starting backend on port 3333..."' >> start.sh && \
    echo 'cd /app/backend && /usr/local/bin/deno run --allow-net --allow-env main.ts &' >> start.sh && \
    echo 'BACKEND_PID=$!' >> start.sh && \
    echo 'echo "Backend started with PID $BACKEND_PID"' >> start.sh && \
    echo 'sleep 2' >> start.sh && \
    echo 'echo "Starting frontend on port ${PORT:-3000}..."' >> start.sh && \
    echo 'cd /app && PORT=${PORT:-3000} node server.js' >> start.sh && \
    chmod +x start.sh

EXPOSE 3000 3333

CMD ["/bin/sh", "/app/start.sh"]
