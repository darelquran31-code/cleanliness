import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function setupUnifiedReceiptsWithMonthYear() {
  try {
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || './credentials.json';
    const sheetsId = process.env.GOOGLE_SHEETS_ID;

    if (!fs.existsSync(keyFile)) {
      throw new Error('ملف credentials.json غير موجود');
    }

    const authClient = new GoogleAuth({
      keyFile: keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authToken = await authClient.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authToken });

    console.log('⏳ جاري التحقق من وجود جدول AllReceipts...');

    // الحصول على قائمة الأوراق (sheets)
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetsId,
    });

    const sheetNames = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
    console.log('الجداول الموجودة:', sheetNames);

    if (!sheetNames.includes('AllReceipts')) {
      throw new Error('جدول AllReceipts غير موجود. يرجى تشغيل setupUnifiedReceiptsHeaders.js أولاً');
    }

    console.log('✅ جدول AllReceipts موجود');

    // إدراج عمودين جديدين بعد عمود J (رقم الهاتف)
    console.log('⏳ جاري إدراج أعمدة الشهر والسنة...');

    const allReceiptsSheet = spreadsheet.data.sheets.find(s => s.properties.title === 'AllReceipts');
    const sheetId = allReceiptsSheet.properties.sheetId;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetsId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'COLUMNS',
                startIndex: 10, // بعد J (index 9), إدراج في index 10
                endIndex: 12 // إدراج عمودين
              },
              inheritFromBefore: false
            }
          }
        ]
      }
    });

    console.log('✅ تم إدراج الأعمدة');

    // تحديث رؤوس الأعمدة لتشمل الشهر والسنة
    console.log('⏳ جاري تحديث رؤوس الأعمدة...');

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetsId,
      range: 'AllReceipts!A1:M1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          'التاريخ والوقت',
          'الرقم المدني (المسجل)',
          'اسم المسجل',
          'المسجد',
          'المحافظة',
          'المنطقة',
          'القطعة',
          'اسم العامل',
          'الرقم المدني للعامل',
          'رقم هاتف مسجل البيانات',
          'الشهر',
          'السنة',
          'رقم المدني للمسجل'
        ]]
      }
    });

    console.log('✅ تم تحديث رؤوس الأعمدة بنجاح!');
    console.log('');
    console.log('📋 الأعمدة في جدول AllReceipts:');
    console.log('A: التاريخ والوقت');
    console.log('B: الرقم المدني (المسجل)');
    console.log('C: اسم المسجل');
    console.log('D: المسجد');
    console.log('E: المحافظة');
    console.log('F: المنطقة');
    console.log('G: القطعة');
    console.log('H: اسم العامل');
    console.log('I: الرقم المدني للعامل');
    console.log('J: رقم هاتف مسجل البيانات');
    console.log('K: الشهر');
    console.log('L: السنة');
    console.log('M: رقم المدني للمسجل');
    console.log('N+: الكميات المستلمة للمواد (بدون رؤوس)');
    console.log('');
    console.log('🎉 تم التحديث بنجاح! الآن يمكن تسجيل الشهر والسنة.');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

setupUnifiedReceiptsWithMonthYear();