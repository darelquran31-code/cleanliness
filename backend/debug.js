import sheetsService from './services/sheetsService.js';

async function debug() {
  try {
    console.log('🔍 جاري التحقق من الاتصال...\n');
    
    await sheetsService.initialize();
    
    console.log('✅ تم الاتصال بـ Google Sheets\n');
    
    console.log('📊 بيانات جدول Users:');
    const data = await sheetsService.getData('Users!A:E');
    
    if (data.length === 0) {
      console.log('❌ لا توجد بيانات في الجدول');
    } else {
      data.forEach((row, index) => {
        console.log(`Row ${index}: [${row.join(', ')}]`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

debug();