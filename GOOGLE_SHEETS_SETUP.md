# إعداد Google Sheets

## خطوات إعداد Google Cloud Project

### 1. إنشاء Project
1. اذهب إلى https://console.cloud.google.com/
2. انقر على اسم المشروع في الأعلى
3. اختر "New Project"
4. أدخل اسم: `Eslam Cleanup`
5. انقر "Create"

### 2. تفعيل Google Sheets API
1. ابحث عن "Google Sheets API"
2. انقر على النتيجة الأولى
3. انقر "Enable"

### 3. تفعيل Google Drive API
1. ابحث عن "Google Drive API"
2. انقر على النتيجة الأولى
3. انقر "Enable"

### 4. إنشاء Service Account
1. انقر على "Create Credentials" أو اذهب إلى IAM & Admin > Service Accounts
2. انقر "Create Service Account"
3. اسم: `eslam-backend`
4. انقر "Create and Continue"
5. في الصفحة التالية، اختر Role: `Editor`
6. انقر "Continue" ثم "Done"

### 5. إنشاء المفتاح
1. انقر على Service Account الجديد
2. اذهب إلى tab "Keys"
3. انقر "Add Key" > "Create new key"
4. اختر "JSON"
5. سيتم تحميل ملف - احفظه باسم `credentials.json` في مجلد `backend/`

## إنشاء Google Sheet

### 1. إنشاء Sheet جديد
1. اذهب إلى https://sheets.google.com
2. انقر "+" (مشروع فارغ)
3. أعط اسماً: `Eslam Cleanup Data`

### 2. نسخ معرف Sheet
1. انسخ معرف Sheet من الـ URL (بين `/d/` و `/edit`)
2. أضفه في ملف `.env` في Backend

### 3. مشاركة Sheet
1. انقر "Share"
2. أضف البريد الإلكتروني للـ Service Account:
   - ابحث عن `eslam-backend@[project-id].iam.gserviceaccount.com`
   - أعطه أذونات "Editor"

### 4. إنشاء الأوراق (Tabs)

#### Tab 1: Users
أنشئ sheet جديد باسم `Users`

الرؤوس (Headers):
| A | B | C | D |
|---|---|---|---|
| nationalId | name | mosque | passwordHash |

#### Tab 2: Materials
أنشئ sheet جديد باسم `Materials`

الرؤوس:
| A | B |
|---|---|
| name | unit |

#### Tab 3: Allocations
أنشئ sheet جديد باسم `Allocations`

الرؤوس:
| A | B | C |
|---|---|---|
| mosque | materialId | quantity |

#### Tab 4: Receipts
أنشئ sheet جديد باسم `Receipts`

الرؤوس:
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| timestamp | userNationalId | userName | mosque | zone | section | workerName | workerNationalId |

#### Tab 5: ReceiptDetails
أنشئ sheet جديد باسم `ReceiptDetails`

الرؤوس:
| A | B | C | D |
|---|---|---|---|
| timestamp | materialId | allocatedQuantity | receivedQuantity |

## إضافة البيانات الأولية

### 1. إضافة مستخدم أول (الإدارة)
في tab `Users`:
- nationalId: `123456789` (أو رقمك الفعلي)
- name: `اسم الإدارة`
- mosque: `إدارة`
- passwordHash: (سيتم حسابها بعد تشغيل Backend)

### 2. إضافة مواد النظافة (19 مادة)
في tab `Materials`، أضف:

| # | المادة | الوحدة |
|---|---|---|
| 1 | منظف الأرضيات | عبوة |
| 2 | صابون سائل | لتر |
| 3 | مطهرات | عبوة |
| 4 | فرش التنظيف | قطعة |
| 5 | ممسحة الأرضيات | قطعة |
| 6 | دلو | قطعة |
| 7 | منظف الزجاج | عبوة |
| 8 | ورق التنظيف | رزمة |
| 9 | قفازات | صندوق |
| 10 | فرشاة الحمام | قطعة |
| 11 | مزيل الرائحة | عبوة |
| 12 | معقم اليدين | لتر |
| 13 | مناديل ورقية | علبة |
| 14 | كيس نفايات | علبة |
| 15 | ممسحة الغبار | قطعة |
| 16 | منظف معادن | عبوة |
| 17 | محقنة التنظيف | قطعة |
| 18 | إسفنجة | عبوة |
| 19 | صابون صلب | كيس |

### 3. تخصيص الكميات
في tab `Allocations`، أضف الكميات المخصصة لكل مسجد:

مثال:
- mosque: `مسجد الرحمن`
- materialId: `1` (منظف الأرضيات)
- quantity: `5`

## اختبار الاتصال

بعد تشغيل Backend، جرّب هذا الـ API:
```
curl http://localhost:5000/api/admin/materials
```

يجب أن تظهر قائمة المواد

## استكشاف الأخطاء

**خطأ: 404 Not Found - GET Google Sheets API**
- تأكد من تفعيل Google Sheets API في Cloud Console

**خطأ: Permission Denied**
- تأكد من مشاركة Sheet مع البريد الإلكتروني للـ Service Account

**خطأ: ENOENT: no such file or directory 'credentials.json'**
- تأكد من وجود ملف `credentials.json` في مجلد `backend/`

---

تم! الآن أنت جاهز لتشغيل التطبيق.