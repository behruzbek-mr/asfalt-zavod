import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Static fayllar yo'lini aniqroq ko'rsatish
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// API va boshqa barcha so'rovlarni index.html ga yo'naltirish
app.get('/api/*', (req, res, next) => next()); // API so'rovlari uchun

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Frontend fayllari topilmadi. Build jarayonini tekshiring.');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  const adminPass = process.env.ADMIN_PASSWORD || 'admin_pass_2024';
  try {
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: adminPass,
        fullName: 'Administrator',
        role: 'admin',
        isActive: true
      }
    });
    console.log('✅ Database connected & Admin checked');
  } catch (e) {
    console.error('❌ Database connection error:', e);
  }
  console.log(`🚀 Server running on port ${PORT}`);
});
