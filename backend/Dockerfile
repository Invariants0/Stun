FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 8080

ENV NODE_ENV=production
CMD ["bun", "run", "start"]

# Test stage - for running tests in Docker
FROM base AS test
ENV NODE_ENV=test
ENV PORT=9090
ENV FIRESTORE_EMULATOR_HOST=localhost:8080
COPY .env.test ./
CMD ["bun", "test"]
