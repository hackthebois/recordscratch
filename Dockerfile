FROM node:24.22.1-bookworm-slim AS node
FROM oven/bun:1.4.4
COPY --from=node /usr/local/bin/node /usr/local/bin/node
WORKDIR /app

# 1. Copy only package files first
COPY package.json bun.lock ./

# 2. Install dependencies (this will now be cached)
RUN bun install

# 3. Copy the rest of the source code
COPY . .

ARG EXPO_PUBLIC_SITE_URL
ENV EXPO_PUBLIC_SITE_URL=$EXPO_PUBLIC_SITE_URL

# 4. Build
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
