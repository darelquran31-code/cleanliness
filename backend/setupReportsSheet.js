import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function setupReportsSheet() {
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

    console.log('⏳ جاري التحقق من وجود جدول Reports...');

    // الحصول على قائمة الأوراق (sheets)
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetsId,
    });

    const sheetNames = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
    console.log('الجداول الموجودة:', sheetNames);

    // التحقق من وجود جدول Reports
    let reportsSheetId = null;
    if (!sheetNames.includes('Reports')) {
      console.log('⏳ جاري إنشاء جدول Reports جديد...');

      // إنشاء جدول جديد
      const addSheetResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetsId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Reports',
                  sheetType: 'GRID',
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 50
                  }
                }
              }
            }
          ]
        }
      });

      reportsSheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;
      console.log('✅ تم إنشاء جدول Reports بنجاح!');
    } else {
      console.log('✅ جدول Reports موجود بالفعل');
      reportsSheetId = spreadsheet.data.sheets.find(s => s.properties.title === 'Reports').properties.sheetId;
    }

    // إضافة الأعمدة (Headers) للتقارير المختلفة
    console.log('⏳ جاري إضافة رؤوس الأعمدة...');

    // ورقة الملخص العام
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetsId,
      range: 'Reports!A1:K1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          'نوع التقرير',
          'الفترة',
          'إجمالي الفواتير',
          'إجمالي المواد الموزعة',
          'عدد المساجد',
          'عدد المحافظات',
          'عدد العمال',
          'عدد المستخدمين',
          'متوسط المواد للفاتورة',
          'تاريخ التحديث',
          'ملاحظات'
        ]]
      }
    });

    // إضافة بيانات تجريبية للملخص
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetsId,
      range: 'Reports!A2:K2',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          'ملخص عام',
          'الشهر الحالي',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          new Date().toISOString(),
          'بيانات تجريبية'
        ]]
      }
    });

    // ورقة التقارير الشهرية (من الصف 4)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetsId,
      range: 'Reports!A4:F4',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          'التقرير الشهري',
          'الفترة',
          'عدد الفواتير',
          'المواد الموزعة',
          'متوسط المواد للفاتورة',
          'تاريخ التحديث'
        ]]
      }
    });

    // ورقة التقارير بالمحافظات (من الصف 6)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetsId,
      range: 'Reports!A6:E6',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          'تقرير المحافظات',
          'المحافظة',
          'عدد الفواتير',
          'المواد الموزعة',
          'تاريخ التحديث'
        ]]
      }
    });

    // إعداد هيكل المواد بالمحافظات (من الصف 3)
    // أولاً، قراءة أسماء المحافظات من جدول AllReceipts
    const receiptsData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetsId,
      range: 'AllReceipts!E:E', // عمود المحافظات
    });

    const allGovernorates = [...new Set(
      (receiptsData.data.values || []).slice(1).map(row => row[0]).filter(g => g)
    )].slice(0, 10); // أخذ أول 10 محافظات للاختبار

    // إنشاء رؤوس المحافظات (الصف 3)
    const governorateHeaders = [];
    const subHeaders = ['المواد'];

    allGovernorates.forEach(gov => {
      governorateHeaders.push(gov, '', ''); // كل محافظة تأخذ 3 أعمدة
      subHeaders.push('المخصص', 'المستلم', 'غير مستلم');
    });

    // كتابة رؤوس المحافظات
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetsId,
      range: `Reports!A3:${String.fromCharCode(65 + subHeaders.length - 1)}3`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [governorateHeaders]
      }
    });

    // كتابة sub-headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetsId,
      range: `Reports!A4:${String.fromCharCode(65 + subHeaders.length - 1)}4`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [subHeaders]
      }
    });

    // قراءة أسماء المواد من جدول Materials
    const materialsData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetsId,
      range: 'Materials!A:A',
    });

    const materials = (materialsData.data.values || []).slice(1).map(row => row[0]).filter(m => m);

    // إضافة أسماء المواد في العمود A بدءاً من الصف 5
    const materialRows = materials.map(material => [material]);
    if (materialRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetsId,
        range: `Reports!A5:A${4 + materialRows.length}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: materialRows
        }
      });
    }

    console.log('✅ تم إعداد جدول Reports بنجاح!');
    console.log('');
    console.log('📋 هيكل جدول Reports:');
    console.log('الصف 1: رؤوس الملخص العام');
    console.log('الصف 2: بيانات الملخص العام');
    console.log('الصف 4: رؤوس التقارير الشهرية');
    console.log('الصف 6: رؤوس تقارير المحافظات');
    console.log('الصف 3: أسماء المحافظات (كل محافظة 3 أعمدة)');
    console.log('الصف 4: المخصص | المستلم | غير مستلم');
    console.log('الصف 5+: أسماء المواد في العمود A، ثم البيانات لكل محافظة');
    console.log('');
    console.log('🎉 تم الإعداد بنجاح! يمكنك الآن إدخال البيانات يدوياً في جدول Reports.');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

setupReportsSheet();