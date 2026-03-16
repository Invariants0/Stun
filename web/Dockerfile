# Multi-stage build for Next.js application

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID=stun-489205
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stun-489205.firebaseapp.com
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stun-489205.appspot.com

FROM oven/bun:1 AS base
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_FIREBASE_API_KEY=test-key
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stun-489205.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=stun-489205
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stun-489205.appspot.com
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=test-sender
ENV NEXT_PUBLIC_FIREBASE_APP_ID=test-app-id

# Accept and set build arguments as environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}

# Build application
RUN bun run build

# Production image
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock* ./

# Install runtime dependencies only (reduces image size)
RUN bun install --production --frozen-lockfile

EXPOSE 3000

CMD ["bun", "run", "start"]
