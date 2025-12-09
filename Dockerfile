FROM oven/bun:latest

WORKDIR /app

# Copy source
COPY . .

RUN bun install

WORKDIR /app/apps/server

EXPOSE 3000

CMD ["bun", "run", "start"]
