FROM node:20-slim AS builder
WORKDIR /app

# Tizim kutubxonalari
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Fayllarni tekshirish uchun (loglarda ko'rinadi)
COPY . .
RUN ls -R  # Bu buyruq bizga barcha papkalarni ko'rsatadi

# Kutubxonalar va Build
RUN npm install --legacy-peer-deps
RUN npx prisma generate
RUN npm run build

# Production
FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app /app
EXPOSE 3000
CMD ["npm", "start"]
