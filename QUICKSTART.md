# دليل البدء السريع

## المتطلبات الأساسية
✅ Node.js 14+ مثبت
✅ حساب Google Cloud (مجاني)
✅ Visual Studio Code أو أي محرر نصوص

## الخطوات الأساسية (5 دقائق)

### 1️⃣ إعداد Google Cloud
```
1. اذهب إلى https://console.cloud.google.com/
2. أنشئ Project جديد اسمه "Eslam"
3. فعّل Google Sheets API و Google Drive API
4. أنشئ Service Account واحفظ الملف JSON
```

### 2️⃣ إعداد Backend
```powershell
cd backend
npm install
```

أنشئ ملف `.env`:
```
GOOGLE_SHEETS_ID=عيّن معرف ورقتك هنا
GOOGLE_SERVICE_ACCOUNT_JSON=./credentials.json
JWT_SECRET=my_secret_key_12345
PORT=5000
```

ضع ملف `credentials.json` في مجلد `backend/`

### 3️⃣ إعداد Google Sheet
1. أنشئ ورقة جديدة: https://sheets.google.com
2. أعد تسميتها: `Eslam Cleanup Data`
3. شارك الورقة مع البريد الإلكتروني للـ Service Account
4. أضف 5 tabs (أوراق):
   - Users
   - Materials
   - Allocations
   - Receipts
   - ReceiptDetails

### 4️⃣ تشغيل Backend
```powershell
cd backend
npm start
```

يجب أن ترى: `✅ السيرفر يعمل على البورت: 5000`

### 5️⃣ تشغيل Frontend (في terminal جديد)
```powershell
cd frontend
npm install
npm run dev
```

### ✨ النتيجة
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## بيانات الدخول الأولية

**الاسم المستخدم**: رقم المدني (مثال: `123456789`)
**كلمة المرور**: نفس الرقم المدني

## الخطوات التالية

1. **إضافة المستخدمين**: اذهب إلى Admin Dashboard > المستخدمين
2. **إضافة المواد**: اذهب إلى Admin Dashboard > مواد النظافة
3. **تخصيص الكميات**: اذهب إلى Admin Dashboard > تخصيص الكميات

---

**هل واجهت مشكلة؟** اقرأ ملف `README.md`