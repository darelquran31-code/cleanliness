import bcryptjs from 'bcryptjs';
import sheetsService from './services/sheetsService.js';
import dotenv from 'dotenv';

dotenv.config();

async function addUser() {
  try {
    // تهيئة Google Sheets
    await sheetsService.initialize();

    const nationalId = '289092604257';
    const name = 'اسلام احمد محمد';
    const mosque = 'مسجد الفرقان';
    const password = nationalId; // كلمة المرور الافتراضية = الرقم المدني

    // تشفير كلمة المرور
    const hashedPassword = await bcryptjs.hash(password, 10);

    // إضافة المستخدم
    await sheetsService.appendData('Users!A:D', [
      nationalId,
      name,
      mosque,
      hashedPassword
    ]);

    console.log('✅ تم إضافة المستخدم بنجاح!');
    console.log(`الرقم المدني: ${nationalId}`);
    console.log(`الاسم: ${name}`);
    console.log(`المسجد: ${mosque}`);
    console.log(`كلمة المرور: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

addUser();