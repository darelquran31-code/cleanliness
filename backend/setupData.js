import sheetsService from './services/sheetsService.js';

async function setupData() {
  try {
    console.log('⏳ جاري تنظيف البيانات...\n');
    
    await sheetsService.initialize();

    // حذف البيانات القديمة (إبقاء Headers فقط)
    const clearRange = 'Users!A2:E1000';
    await sheetsService.sheets.spreadsheets.values.clear({
      spreadsheetId: sheetsService.sheetsId,
      range: clearRange,
    });
    
    console.log('✅ تم حذف البيانات القديمة\n');

    // إضافة مستخدمي الاختبار
    console.log('⏳ جاري إضافة مستخدمي الاختبار...\n');

    // Admin
    await sheetsService.appendData('Users!A:E', [
      '12345678',
      'محمد الإدارة',
      'مسجد النور',
      '12345678',
      'Admin'
    ]);
    console.log('✅ تم إضافة مستخدم Admin');
    console.log('   الرقم المدني: 12345678');
    console.log('   كلمة المرور: 12345678\n');

    // User عادي
    await sheetsService.appendData('Users!A:E', [
      '87654321',
      'أحمد المستخدم',
      'مسجد السلام',
      '87654321',
      'User'
    ]);
    console.log('✅ تم إضافة مستخدم عادي');
    console.log('   الرقم المدني: 87654321');
    console.log('   كلمة المرور: 87654321\n');

    console.log('=============================');
    console.log('✅ تم إعداد البيانات بنجاح!');
    console.log('=============================\n');

    console.log('البيانات الحالية:');
    const data = await sheetsService.getData('Users!A:E');
    data.forEach((row, i) => {
      console.log(`Row ${i}: [${row.join(', ')}]`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

setupData();