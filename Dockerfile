FROM node:20-slim
WORKDIR /app

# Tizim kutubxonalari
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Barcha fayllarni nusxalash (shubhasiz)
COPY . .

# Kutubxonalarni o'rnatish
RUN npm install --legacy-peer-deps

# Prisma va Build
RUN npx prisma generate
RUN npm run build

# Port va Start
EXPOSE 3000
CMD ["npm", "start"]
