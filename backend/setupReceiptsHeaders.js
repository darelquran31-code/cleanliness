import sheetsService from './services/sheetsService.js';

async function setupReceiptsHeaders() {
  try {
    // تهيئة الخدمة
    await sheetsService.initialize();

    // تسجيل أسماء الأعمدة في جدول Receipts مع الأعمدة الجديدة
    console.log('⏳ جاري تحديث أسماء الأعمدة في جدول الفواتير...');
    
    await sheetsService.updateData('Receipts!A1:J1', [
      'التاريخ والوقت',
      'الرقم المدني',
      'الاسم',
      'المسجد',
      'المحافظة',
      'المنطقة',
      'القطعة',
      'اسم العامل',
      'الرقم المدني للعامل',
      'رقم هاتف مسجل البيانات'
    ]);

    console.log('✅ تم تحديث أسماء الأعمدة بنجاح!');
    console.log('');
    console.log('الأعمدة المحدثة:');
    console.log('A: التاريخ والوقت');
    console.log('B: الرقم المدني');
    console.log('C: الاسم');
    console.log('D: المسجد');
    console.log('E: المحافظة');
    console.log('F: المنطقة');
    console.log('G: القطعة');
    console.log('H: اسم العامل');
    console.log('I: الرقم المدني للعامل');
    console.log('J: رقم هاتف مسجل البيانات');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

setupReceiptsHeaders();