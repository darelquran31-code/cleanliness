import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function setupLogo() {
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

    console.log('⏳ جاري إنشاء شيت الشعار...');

    // إنشاء شيت جديد باسم "Logo"
    const sheetName = 'Logo';
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetsId,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    });

    console.log('✅ تم إنشاء شيت الشعار');

    // الحصول على sheetId
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetsId,
    });
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
    if (!sheet) throw new Error(`الشيت ${sheetName} غير موجود`);

    const sheetId = sheet.properties.sheetId;

    // إدراج الصورة
    const imageUrl = 'https://drive.google.com/thumbnail?id=17Vs_ZMZ2xjHMDfzM442bIyftEsRhdJlB&sz=s4000';
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetsId,
      resource: {
        requests: [
          {
            insertImage: {
              location: {
                sheetId: sheetId,
                location: {
                  rowIndex: 0,
                  columnIndex: 0,
                },
              },
              url: imageUrl,
              width: 200,
              height: 200,
            },
          },
        ],
      },
    });

    console.log('✅ تم إدراج الشعار في الشيت');

  } catch (error) {
    console.error('❌ خطأ في إعداد الشعار:', error);
  }
}

setupLogo();