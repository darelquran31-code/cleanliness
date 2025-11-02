import express from 'express';
import jwt from 'jsonwebtoken';
import sheetsService from '../services/sheetsService.js';

const router = express.Router();

// تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    const { nationalId, password } = req.body;

    if (!nationalId || !password) {
      return res.status(400).json({ error: 'الرقم المدني وكلمة المرور مطلوبة' });
    }

    // البحث عن المستخدم
    const users = await sheetsService.getData('Users!A:E');
    const user = users.slice(1).find(u => u[0] === nationalId);

    if (!user) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    // التحقق من كلمة المرور (بدون تشفير)
    if (password !== user[3]) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    // إنشاء JWT Token
    const token = jwt.sign(
      { nationalId: user[0], name: user[1], mosque: user[2], role: user[4] },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        nationalId: user[0],
        name: user[1],
        mosque: user[2],
        role: user[4] || 'User',
      },
    });
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// تغيير كلمة المرور
router.post('/change-password', async (req, res) => {
  try {
    const { nationalId, oldPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    // التحقق من Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.nationalId !== nationalId) {
      return res.status(403).json({ error: 'لا يمكنك تعديل بيانات شخص آخر' });
    }

    // البحث عن المستخدم
    const users = await sheetsService.getData('Users!A:E');
    const userIndex = users.slice(1).findIndex(u => u[0] === nationalId);
    
    // إضافة 1 للـ index لأننا أزلنا الصف الأول (Header)
    const actualUserIndex = userIndex === -1 ? -1 : userIndex + 1;

    if (actualUserIndex === -1) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    // التحقق من كلمة المرور القديمة (بدون تشفير)
    if (oldPassword !== users[actualUserIndex][3]) {
      return res.status(401).json({ error: 'كلمة المرور القديمة غير صحيحة' });
    }

    // تحديث البيانات (بدون تشفير)
    await sheetsService.updateData(
      `Users!D${actualUserIndex + 1}`,
      [newPassword]
    );

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    console.error('❌ خطأ في تغيير كلمة المرور:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

export default router;