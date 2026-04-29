FROM node:20-slim AS builder
WORKDIR /app

# Tizim kutubxonalarini yangilash
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Faqat package.json ni nusxalash
COPY package.json ./

# Kutubxonalarni o'rnatish (xatoliklarni e'tiborsiz qoldirib)
RUN npm install --legacy-peer-deps --no-audit

# Qolgan hamma fayllarni nusxalash
COPY . .

# Prisma va Build
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app /app
EXPOSE 3000
CMD ["npm", "start"]
