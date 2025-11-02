import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function setupGovernoratesSheet() {
  try {
    const sheetsId = process.env.GOOGLE_SHEETS_ID;
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || './credentials.json';

    if (!fs.existsSync(keyFile)) {
      console.error('❌ ملف credentials.json غير موجود');
      return;
    }

    const authClient = new GoogleAuth({
      keyFile: keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authToken = await authClient.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authToken });

    // أولاً: محاولة الحصول على شيتات الملف
    try {
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: sheetsId,
      });

      // التحقق من وجود الشيت GovernoratesZones
      const sheetExists = spreadsheet.data.sheets.some(sheet => sheet.properties.title === 'GovernoratesZones');

      if (!sheetExists) {
        // إنشاء شيت جديد
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetsId,
          resource: {
            requests: [{
              addSheet: {
                properties: {
                  title: 'GovernoratesZones',
                  gridProperties: { rowCount: 100, columnCount: 2 },
                },
              },
            }],
          },
        });
        console.log('✅ تم إنشاء الشيت GovernoratesZones');
      } else {
        console.log('✅ الشيت GovernoratesZones موجود بالفعل');
      }

      // البيانات: المحافظة والمناطق
      const data = [
        ['المحافظة', 'المنطقة'],
        ['العاصمة', 'المرقاب'],
        ['العاصمة', 'الشرقية'],
        ['العاصمة', 'القبلة'],
        ['العاصمة', 'الوطية'],
        ['العاصمة', 'الدعية'],
        ['العاصمة', 'النزهة'],
        ['الأحمدي', 'الأحمدي'],
        ['الأحمدي', 'الفنطاس'],
        ['الأحمدي', 'الرقة'],
        ['الأحمدي', 'العقيلة'],
        ['الأحمدي', 'الوفرة'],
        ['الأحمدي', 'جنوب الأحمدي'],
        ['الفروانية', 'الفروانية'],
        ['الفروانية', 'العارضية'],
        ['الفروانية', 'الرويعي'],
        ['الفروانية', 'الجنوبية'],
        ['الفروانية', 'السالمية'],
        ['الفروانية', 'أم الهيمان'],
        ['الجهراء', 'الجهراء'],
        ['الجهراء', 'أم القيصر'],
        ['الجهراء', 'الصبية'],
        ['الجهراء', 'الجابرية'],
        ['الجهراء', 'واحة'],
        ['مبارك الكبير', 'مبارك الكبير'],
        ['مبارك الكبير', 'الرقعي'],
        ['مبارك الكبير', 'أم الياسين'],
        ['مبارك الكبير', 'الناعم'],
        ['حولي', 'حولي'],
        ['حولي', 'الشامية'],
        ['حولي', 'الشرق'],
        ['حولي', 'بنيد القار'],
        ['حولي', 'الرحاب'],
        ['حولي', 'علي صباح السالم'],
      ];

      // إضافة البيانات في الجدول
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetsId,
        range: 'GovernoratesZones!A:B',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: data,
        },
      });

      console.log('✅ تم حفظ بيانات المحافظات والمناطق بنجاح');
    } catch (innerError) {
      console.error('❌ خطأ في الخطوة الداخلية:', innerError.message);
      throw innerError;
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

setupGovernoratesSheet();