import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const sheetsId = process.env.GOOGLE_SHEETS_ID;
const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || './credentials.json';

async function setupNewAllReceipts() {
  try {
    if (!fs.existsSync(keyFile)) {
      throw new Error('❌ ملف credentials.json غير موجود');
    }

    const authClient = new GoogleAuth({
      keyFile: keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authToken = await authClient.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authToken });

    console.log('📍 جاري سحب أسماء المواد من جدول Materials...');
    
    // سحب المواد من جدول Materials
    const materialsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetsId,
      range: 'Materials!A2:C', // تخطي الرأس
    });

    const materials = materialsResponse.data.values || [];
    const materialNames = materials.map(row => row[0] || 'مادة').filter(Boolean);

    console.log(`✅ تم سحب ${materialNames.length} مادة:`);
    materialNames.forEach((name, idx) => {
      console.log(`   ${idx + 1}. ${name}`);
    });

    // رؤوس الأعمدة الثابتة (A-I)
    const staticHeaders = [
      'التاريخ والوقت',
      'رقم المدني للمسجل',
      'اسم المسجل',
      'اسم المسجد',
      'المحافظة',
      'المنطقة',
      'الرقم المدني للمسجد',
      'القطعة',
      'اسم العامل'
    ];

    // يضاف بعدها رقم المدني للعامل في I10
    const allHeaders = [
      ...staticHeaders,
      'رقم المدني للعامل',
      'رقم الهاتف',
      ...materialNames
    ];

    console.log(`\n📊 إجمالي الأعمدة: ${allHeaders.length}`);
    console.log(`   - A-K: بيانات المسجد والعامل (11 عمود)`);
    console.log(`   - L+: المواد (${materialNames.length} عمود)`);

    // دالة تحويل الرقم إلى حرف العمود
    function getColumnLetter(col) {
      let letter = '';
      while (col > 0) {
        col--;
        letter = String.fromCharCode(65 + (col % 26)) + letter;
        col = Math.floor(col / 26);
      }
      return letter;
    }

    const lastColumn = getColumnLetter(allHeaders.length);
    console.log(`   - آخر عمود: ${lastColumn}`);

    // حذف الجدول القديم AllReceipts إن وجد
    console.log('\n🗑️ جاري حذف جدول AllReceipts القديم...');
    
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: sheetsId,
    });

    const allReceipts = spreadsheetResponse.data.sheets.find(
      s => s.properties.title === 'AllReceipts'
    );

    if (allReceipts) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetsId,
        resource: {
          requests: [
            {
              deleteSheet: {
                sheetId: allReceipts.properties.sheetId,
              },
            },
          ],
        },
      });
      console.log('✅ تم حذف الجدول القديم');
    }

    // إنشاء جدول جديد AllReceipts
    console.log('\n📝 جاري إنشاء جدول AllReceipts الجديد...');
    
    const createSheetResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetsId,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'AllReceipts',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: allHeaders.length,
                },
              },
            },
          },
        ],
      },
    });

    console.log('✅ تم إنشاء جدول AllReceipts بنجاح');

    // إضافة الرؤوس
    console.log('\n📌 جاري إضافة رؤوس الأعمدة...');
    
    const headerRange = `AllReceipts!A1:${lastColumn}1`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetsId,
      range: headerRange,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [allHeaders],
      },
    });

    console.log(`✅ تم إضافة رؤوس الأعمدة في المدى: ${headerRange}`);
    console.log('\n' + '='.repeat(60));
    console.log('✅ تم إعداد جدول AllReceipts الجديد بنجاح!');
    console.log('='.repeat(60));
    console.log('\n📋 الهيكل الجديد:');
    console.log('   - الصف الواحد = إيصالية واحدة فقط');
    console.log('   - الأعمدة A-K: بيانات المسجد والعامل');
    console.log(`   - الأعمدة L-${lastColumn}: المواد (الكمية المستلمة)`);
    console.log('\n');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

setupNewAllReceipts();