import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import sheetsService from './services/sheetsService.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'حدث خطأ في السيرفر' });
});

const PORT = process.env.PORT || 5000;

// بدء السيرفر
(async () => {
  try {
    console.log('🚀 بدء تشغيل السيرفر...');

    // بدء السيرفر أولاً
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ السيرفر يعمل على البورت: ${PORT}`);
      console.log(`🌐 يمكن الوصول إليه على: http://localhost:${PORT}`);
    });

    // تهيئة Google Sheets بعد بدء السيرفر
    console.log('🔄 بدء تهيئة Google Sheets...');
    await sheetsService.initialize();
    console.log('✅ تم تهيئة Google Sheets بنجاح');

  } catch (error) {
    console.error('❌ خطأ في تهيئة Google Sheets:', error.message);
    console.error('سيستمر السيرفر بدون Google Sheets');
  }
})();