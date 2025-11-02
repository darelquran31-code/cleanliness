import sheetsService from './services/sheetsService.js';

async function setupHeaders() {
  try {
    // تهيئة الخدمة
    await sheetsService.initialize();

    // تسجيل أسماء الأعمدة في جدول Users
    console.log('⏳ جاري تسجيل أسماء الأعمدة...');
    
    await sheetsService.updateData('Users!A1:E1', [
      'الرقم المدني',
      'الاسم',
      'المسجد',
      'كلمة المرور',
      'الدور'
    ]);

    console.log('✅ تم تسجيل أسماء الأعمدة بنجاح!');
    console.log('');
    console.log('الأعمدة المسجلة:');
    console.log('A: الرقم المدني');
    console.log('B: الاسم');
    console.log('C: المسجد');
    console.log('D: كلمة المرور');
    console.log('E: الدور');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

setupHeaders();