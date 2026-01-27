FROM oven/bun:latest
WORKDIR /app

# 1. Copy only package files first
COPY package.json bun.lock ./

# 2. Install dependencies (this will now be cached)
RUN bun install

# 3. Copy the rest of the source code
COPY . .

# 4. Build
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
