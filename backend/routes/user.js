import express from 'express';
import sheetsService from '../services/sheetsService.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// إضافة فاتورة استلام في جدول موحد واحد
router.post('/add-receipt', verifyToken, async (req, res) => {
  try {
    const { mosque, governorate, zone, section, mosqueName, registrarPhone, workerName, workerNationalId, secondWorkerName, secondWorkerNationalId, materials, month, year } = req.body;
    const user = req.user;

    if (!mosque || !governorate || !zone || !section || !mosqueName || !registrarPhone || !workerName || !workerNationalId || !materials || !month || !year) {
      return res.status(400).json({ error: 'جميع البيانات مطلوبة' });
    }

    const timestamp = new Date().toISOString();

    // الحصول على جميع المواد من جدول Materials لمعرفة عددها والترتيب
    const materialsData = await sheetsService.getData('Materials!A:C');
    const allMaterials = materialsData.slice(1); // تخطي الرأس

    // إنشاء مصفوفة بحجم عدد المواد وملؤها بـ 0 (أو القيمة المدخلة)
    const materialsRow = new Array(allMaterials.length).fill(0);

    // ملء القيم المدخلة للمواد
    for (const material of materials) {
      const materialIndex = material.materialId - 1; // تحويل من 1-indexed إلى 0-indexed
      if (materialIndex >= 0 && materialIndex < materialsRow.length) {
        materialsRow[materialIndex] = material.receivedQuantity || 0;
      }
    }

    // بناء الصف الواحد الكامل (A-P: بيانات + Q-AF: المواد)
    const completeRow = [
      timestamp,                  // A
      user.nationalId,           // B
      user.name,                 // C
      mosque,                    // D
      governorate,               // E
      zone,                      // F
      section,                   // G
      mosqueName,                // H
      registrarPhone,            // I
      workerName,                // J
      workerNationalId,          // K
      secondWorkerName || '',    // L
      secondWorkerNationalId || '', // M
      month,                     // N
      year,                      // O
      user.nationalId            // P (رقم المدني للمسجل)
    ];
    
    // إضافة جميع المواد كأعمدة (Q-AI)
    const rowWithMaterials = completeRow.concat(materialsRow);

    // إضافة الصف الواحد في AllReceipts (يجب أن تكون مصفوفة مصفوفات)
    console.log('📝 إضافة إيصالية جديدة...');
    console.log('عدد الأعمدة:', rowWithMaterials.length);
    console.log('البيانات:', rowWithMaterials.slice(0, 16), '...', rowWithMaterials.slice(16));

    await sheetsService.appendData('AllReceipts!A:AI', rowWithMaterials);

    res.json({ success: true, message: 'تم تسجيل الاستلام بنجاح' });
  } catch (error) {
    console.error('❌ خطأ في تسجيل الاستلام:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// الحصول على الفواتير والمواد من الجدول الموحد
router.get('/receipts', verifyToken, async (req, res) => {
  try {
    const receipts = await sheetsService.getData('AllReceipts!A:AI');
    const materialsData = await sheetsService.getData('Materials!A:C');
    const user = req.user;

    // الحصول على أسماء المواد
    const materialNames = materialsData.slice(1).map(row => row[0] || 'مادة');

    // تحويل البيانات إلى صيغة مناسبة للعرض
    const result = receipts.slice(1).map(r => {
      if (r[1] === user.nationalId) {
        const materials = [];

        // جمع المواد من الأعمدة Q-AI
        for (let i = 0; i < materialNames.length; i++) {
          const columnIndex = 16 + i; // Q يبدأ من 16 (0-indexed)
          const quantity = r[columnIndex] || 0;

          if (quantity > 0 || quantity !== '') {
            materials.push({
              materialId: i + 1,
              materialName: materialNames[i],
              receivedQuantity: quantity
            });
          }
        }

        return {
          timestamp: r[0],           // A
          registrarName: r[2],       // C
          mosque: r[3],              // D
          governorate: r[4],         // E
          zone: r[5],                // F
          section: r[6],             // G
          mosqueName: r[7],          // H
          registrarPhone: r[8],      // I
          workerName: r[9],          // J
          workerNationalId: r[10],   // K
          secondWorkerName: r[11],   // L
          secondWorkerNationalId: r[12], // M
          month: r[13],              // N
          year: r[14],               // O
          materials: materials
        };
      }
    }).filter(Boolean);

    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في جلب الفواتير:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// الحصول على المحافظات والمناطق (بدون حاجة للتوثيق)
router.get('/governorates-zones', async (req, res) => {
  try {
    console.log('📍 جاري جلب بيانات المحافظات والمناطق...');
    const data = await sheetsService.getData('GovernoratesZones!A:B');
    
    console.log('📊 عدد الصفوف:', data.length);
    
    // تخطي الرأس وتنظيم البيانات
    const result = {};
    data.slice(1).forEach(row => {
      if (row[0] && row[1]) {
        if (!result[row[0]]) {
          result[row[0]] = [];
        }
        result[row[0]].push(row[1]);
      }
    });

    console.log('✅ تم جلب المحافظات:', Object.keys(result));
    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في جلب المحافظات:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر', details: error.message });
  }
});

export default router;