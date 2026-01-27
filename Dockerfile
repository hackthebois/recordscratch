FROM oven/bun:latest

WORKDIR /app

# Copy source
COPY . .

RUN bun install

# FIX: Build hanging
# RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]
