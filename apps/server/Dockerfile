FROM oven/bun:latest

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy source
COPY . .

RUN bun run build

EXPOSE 3000

CMD ["./run.sh"]
