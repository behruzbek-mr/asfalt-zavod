# Multi-stage build for Asphalt Factory ERP
FROM node:20-slim AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "--experimental-strip-types", "server/index.ts"]
