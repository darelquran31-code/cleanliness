# نظام استلام مواد النظافة للمساجد

تطبيق متكامل لتسجيل وتتبع استلام مواد النظافة للمساجد باستخدام Google Sheets كقاعدة بيانات.

## المميزات

✅ **نظام تسجيل دخول متقدم**
- تسجيل دخول بالرقم المدني وكلمة المرور
- تغيير كلمة المرور
- توكن JWT للأمان

✅ **لوحة المتابعة (Dashboard)**
- عرض نموذج استلام البيانات
- إدخال بيانات المسجد والعامل
- تسجيل الكميات المستلمة من 19 مادة نظافة

✅ **لوحة الإدارة (Admin Dashboard)**
- إدارة المستخدمين (الأئمة/المؤذنين)
- إدارة مواد النظافة
- تخصيص الكميات المفروضة لكل مسجد

✅ **قاعدة البيانات**
- حفظ كامل البيانات في Google Sheets
- تصميم آمن ومنظم

## البنية التقنية

### Backend
- **Node.js + Express**: API سيرفر
- **Google Sheets API**: قاعدة البيانات
- **JWT**: مصادقة آمنة
- **bcryptjs**: تشفير كلمات المرور

### Frontend
- **React**: واجهة المستخدم
- **Vite**: أداة البناء
- **CSS**: تصميم جميل وسريع الاستجابة

## متطلبات التشغيل

- Node.js 14+
- npm أو yarn
- حساب Google Cloud مع Google Sheets API مفعل

## خطوات التثبيت

### 1. إعداد Google Sheets

1. اذهب إلى https://console.cloud.google.com/
2. أنشئ Project جديد
3. فعّل Google Sheets API و Google Drive API
4. أنشئ Service Account:
   - انقر على "Create Service Account"
   - أنشئ مفتاح JSON
   - احفظ الملف في: `backend/credentials.json`

5. أنشئ Google Sheet جديد وأضف الأوراق التالية:
   - **Users**: بيانات المستخدمين (ID، Name، Mosque، HashedPassword)
   - **Materials**: مواد النظافة (Name، Unit)
   - **Allocations**: الكميات المخصصة (Mosque، MaterialID، Quantity)
   - **Receipts**: فواتير الاستلام
   - **ReceiptDetails**: تفاصيل الفواتير

### 2. تشغيل Backend

```bash
cd backend
npm install
```

أنشئ ملف `.env`:
```
GOOGLE_SHEETS_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_JSON=./credentials.json
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

ثم شغّل:
```bash
npm start
```

### 3. تشغيل Frontend

```bash
cd frontend
npm install
npm run dev
```

الموقع سيكون متاح في: `http://localhost:3000`

## البيانات الأولية

يجب إضافة هذه البيانات في Google Sheets يدويًا:

### المستخدمون
| الرقم المدني | الاسم | المسجد | كلمة المرور (مشفرة) |
|---|---|---|---|

### مواد النظافة (19 مادة)
1. منظف الأرضيات
2. صابون سائل
3. مطهرات
4. فرش التنظيف
5. ممسحة الأرضيات
6. دلو
7. منظف الزجاج
8. ورق التنظيف
9. قفازات
10. فرشاة الحمام
11. مزيل الرائحة
12. معقم اليدين
13. مناديل ورقية
14. كيس نفايات
15. ممسحة الغبار
16. منظف معادن
17. محقنة التنظيف
18. إسفنجة
19. صابون صلب

## مسارات API

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/change-password` - تغيير كلمة المرور

### الإدارة
- `POST /api/admin/add-user` - إضافة مستخدم
- `GET /api/admin/users` - جلب المستخدمين
- `POST /api/admin/add-material` - إضافة مادة
- `GET /api/admin/materials` - جلب المواد
- `POST /api/admin/add-allocation` - تخصيص كمية
- `GET /api/admin/allocations/:mosque` - جلب التخصيصات

### المستخدم
- `POST /api/user/add-receipt` - إضافة فاتورة استلام
- `GET /api/user/receipts` - جلب الفواتير

## الملفات الرئيسية

```
eslam/
├── backend/
│   ├── server.js
│   ├── services/
│   │   └── sheetsService.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── user.js
│   ├── middleware/
│   │   └── auth.js
│   ├── credentials.json
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── components/
    │   │   ├── ReceiptForm.jsx
    │   │   ├── UserManagement.jsx
    │   │   ├── MaterialManagement.jsx
    │   │   └── AllocationManagement.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## ملاحظات مهمة

1. **الأمان**: استخدم HTTPS في الإنتاج
2. **الكلمات المرور**: كلمة المرور الأولية = الرقم المدني
3. **النسخ الاحتياطية**: تأكد من نسخ Google Sheets بانتظام
4. **الأخطاء**: تحقق من console لرؤية الأخطاء

## المساعدة

في حالة وجود أي مشاكل:
1. تحقق من أن جميع المتغيرات البيئية صحيحة
2. تأكد من أن Google Sheet مشاركة مع Service Account
3. تحقق من أن جميع الأوراق الأربع موجودة في الـ Sheet

---

**تم التطوير بواسطة**: [اسمك]
**آخر تحديث**: 2024# cleanliness
