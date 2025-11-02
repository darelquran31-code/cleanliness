import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function setupUnifiedReceiptsHeaders() {
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

    // التحقق من وجود جدول AllReceipts
    let allReceiptsSheetId = null;
    if (!sheetNames.includes('AllReceipts')) {
      console.log('⏳ جاري إنشاء جدول AllReceipts جديد...');
      
      // إنشاء جدول جديد
      const addSheetResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetsId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'AllReceipts',
                  sheetType: 'GRID',
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 15
                  }
                }
              }
            }
          ]
        }
      });

      allReceiptsSheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;
      console.log('✅ تم إنشاء جدول AllReceipts بنجاح!');
    } else {
      console.log('✅ جدول AllReceipts موجود بالفعل');
      allReceiptsSheetId = spreadsheet.data.sheets.find(s => s.properties.title === 'AllReceipts').properties.sheetId;
    }

    // إضافة الأعمدة (Headers)
    console.log('⏳ جاري إضافة رؤوس الأعمدة...');

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetsId,
      range: 'AllReceipts!A1:O1',
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
          'معرف المادة',
          'اسم المادة',
          'الوحدة',
          'الكمية المخصصة',
          'الكمية المستلمة'
        ]]
      }
    });

    console.log('✅ تم إضافة رؤوس الأعمدة بنجاح!');
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
    console.log('K: معرف المادة');
    console.log('L: اسم المادة');
    console.log('M: الوحدة');
    console.log('N: الكمية المخصصة');
    console.log('O: الكمية المستلمة');
    console.log('');
    console.log('🎉 تم الإعداد بنجاح! يمكنك الآن استخدام التطبيق.');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

setupUnifiedReceiptsHeaders();