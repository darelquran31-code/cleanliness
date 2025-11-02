import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function setupAddNewFields() {
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

    const allReceiptsSheet = spreadsheet.data.sheets.find(s => s.properties.title === 'AllReceipts');
    const sheetId = allReceiptsSheet.properties.sheetId;

    // إدراج عمود واحد بعد G (القطعة) لاسم المسجد
    console.log('⏳ جاري إدراج عمود اسم المسجد...');

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetsId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'COLUMNS',
                startIndex: 7, // بعد G (index 6), إدراج في index 7
                endIndex: 8 // إدراج عمود واحد
              },
              inheritFromBefore: false
            }
          }
        ]
      }
    });

    console.log('✅ تم إدراج عمود اسم المسجد');

    // إدراج عمودين بعد K (الرقم المدني للعامل الأول) للعامل الثاني
    console.log('⏳ جاري إدراج أعمدة العامل الثاني...');

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetsId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'COLUMNS',
                startIndex: 12, // بعد K (index 10, but since we inserted one, now 11?), wait
                // Wait, since we inserted one at 7, the indices after 7 are shifted.
                // Original K was index 10, now after inserting at 7, K becomes index 11.
                // So insert after 11, at 12.
                endIndex: 14 // إدراج عمودين
              },
              inheritFromBefore: false
            }
          }
        ]
      }
    });

    console.log('✅ تم إدراج أعمدة العامل الثاني');

    // تحديث رؤوس الأعمدة
    console.log('⏳ جاري تحديث رؤوس الأعمدة...');

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetsId,
      range: 'AllReceipts!A1:P1',
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
          'اسم المسجد',
          'رقم هاتف مسجل البيانات',
          'اسم العامل الأول',
          'الرقم المدني للعامل الأول',
          'اسم العامل الثاني',
          'الرقم المدني للعامل الثاني',
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
    console.log('H: اسم المسجد');
    console.log('I: رقم هاتف مسجل البيانات');
    console.log('J: اسم العامل الأول');
    console.log('K: الرقم المدني للعامل الأول');
    console.log('L: اسم العامل الثاني');
    console.log('M: الرقم المدني للعامل الثاني');
    console.log('N: الشهر');
    console.log('O: السنة');
    console.log('P: رقم المدني للمسجل');
    console.log('Q+: الكميات المستلمة للمواد');
    console.log('');
    console.log('🎉 تم التحديث بنجاح! الآن يمكن تسجيل البيانات الجديدة.');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

setupAddNewFields();