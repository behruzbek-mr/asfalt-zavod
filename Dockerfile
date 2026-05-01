FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --production
COPY prisma ./prisma
RUN npx prisma generate
COPY server ./server
COPY --from=builder /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "--experimental-strip-types", "server/index.ts"]
