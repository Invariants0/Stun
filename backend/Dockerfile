FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Build TypeScript
RUN bun run build

# Runtime stage
FROM oven/bun:1

WORKDIR /app
COPY --from=builder /app/dist ./dist

# Only copy production dependencies
COPY --from=builder /app/package.json ./
RUN bun install --production --frozen-lockfile

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["bun", "dist/index.js"]
