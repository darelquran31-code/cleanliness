import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

class SheetsService {
  constructor() {
    this.sheetsId = process.env.GOOGLE_SHEETS_ID;
    this.authClient = null;
    this.sheets = null;
  }

  async initialize() {
    try {
      const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || './credentials.json';

      if (!fs.existsSync(keyFile)) {
        console.warn('⚠️ ملف credentials.json غير موجود. يرجى إضافة ملف Google Service Account.');
        return;
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const authClient = await auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient });

      console.log('✅ اتصال Google Sheets جاهز');
    } catch (error) {
      console.error('❌ خطأ في الاتصال بـ Google Sheets:', error);
    }
  }

  async getData(range) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetsId,
        range: range,
      });
      return response.data.values || [];
    } catch (error) {
      console.error('❌ خطأ في قراءة البيانات:', error);
      throw error;
    }
  }

  async appendData(range, values) {
    try {
      // تأكد من أن values هي مصفوفة مصفوفات (صف واحد أو عدة صفوف)
      let formattedValues = values;
      if (Array.isArray(values) && values.length > 0 && !Array.isArray(values[0])) {
        // إذا كانت values مصفوفة عادية (صف واحد)، لفها بمصفوفة أخرى
        formattedValues = [values];
      }
      
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetsId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: formattedValues,
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في إضافة البيانات:', error);
      throw error;
    }
  }

  async updateData(range, values) {
    try {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetsId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [values],
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في تحديث البيانات:', error);
      throw error;
    }
  }

  async getSheetId(sheetName) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.sheetsId,
      });
      const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
      if (!sheet) throw new Error(`الشيت ${sheetName} غير موجود`);
      return sheet.properties.sheetId;
    } catch (error) {
      console.error('❌ خطأ في الحصول على sheetId:', error);
      throw error;
    }
  }

  async createSheet(sheetName) {
    try {
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetsId,
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
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في إنشاء الشيت:', error);
      throw error;
    }
  }

  async insertImage(sheetName, url, rowIndex = 0, columnIndex = 0) {
    try {
      const sheetId = await this.getSheetId(sheetName);
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetsId,
        resource: {
          requests: [
            {
              insertImage: {
                location: {
                  sheetId: sheetId,
                  location: {
                    rowIndex: rowIndex,
                    columnIndex: columnIndex,
                  },
                },
                url: url,
                width: 200,
                height: 200,
              },
            },
          ],
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في إدراج الصورة:', error);
      throw error;
    }
  }

  async deleteRow(sheetName, rowIndex) {
    try {
      const sheetId = await this.getSheetId(sheetName);
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetsId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في حذف الصف:', error);
      throw error;
    }
  }
}

export default new SheetsService();