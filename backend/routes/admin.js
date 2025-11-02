import express from 'express';
import sheetsService from '../services/sheetsService.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// إضافة مستخدم جديد
router.post('/add-user', verifyToken, async (req, res) => {
  try {
    const { nationalId, name, mosque, role } = req.body;

    if (!nationalId || !name || !mosque || !role) {
      return res.status(400).json({ error: 'جميع البيانات مطلوبة' });
    }

    // إضافة المستخدم (بدون تشفير كلمة المرور)
    await sheetsService.appendData('Users!A:E', [
      nationalId,
      name,
      mosque,
      nationalId,  // كلمة المرور بدون تشفير
      role,
    ]);

    res.json({ success: true, message: 'تم إضافة المستخدم بنجاح' });
  } catch (error) {
    console.error('❌ خطأ في إضافة المستخدم:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// الحصول على جميع المستخدمين
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await sheetsService.getData('Users!A:E');
    
    // إزالة كلمات المرور من النتيجة
    const safeUsers = users.slice(1).map(user => ({
      nationalId: user[0],
      name: user[1],
      mosque: user[2],
      role: user[4] || 'User',
    }));

    res.json(safeUsers);
  } catch (error) {
    console.error('❌ خطأ في جلب المستخدمين:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// إضافة مادة نظافة (مع كمية موحدة لجميع المساجد)
router.post('/add-material', verifyToken, async (req, res) => {
  try {
    const { name, unit, quantity } = req.body;

    if (!name || !unit || !quantity) {
      return res.status(400).json({ error: 'جميع البيانات مطلوبة (الاسم، الوحدة، الكمية)' });
    }

    await sheetsService.appendData('Materials!A:C', [name, unit, quantity]);

    res.json({ success: true, message: 'تم إضافة المادة بنجاح' });
  } catch (error) {
    console.error('❌ خطأ في إضافة المادة:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// الحصول على جميع المواد (مع الكميات)
router.get('/materials', verifyToken, async (req, res) => {
  try {
    const materials = await sheetsService.getData('Materials!A:C');
    
    const result = materials.slice(1).map((material, index) => ({
      id: index + 1,
      name: material[0],
      unit: material[1],
      quantity: material[2] ? parseFloat(material[2]) : 0,
    }));

    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في جلب المواد:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// تحديث مادة
router.put('/update-material/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, quantity } = req.body;

    if (!name || !unit || !quantity) {
      return res.status(400).json({ error: 'جميع البيانات مطلوبة' });
    }

    const rowIndex = parseInt(id) + 1; // id starts from 1, row 2 is first data
    await sheetsService.updateData(`Materials!A${rowIndex}:C${rowIndex}`, [name, unit, quantity]);

    res.json({ success: true, message: 'تم تحديث المادة بنجاح' });
  } catch (error) {
    console.error('❌ خطأ في تحديث المادة:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// حذف مادة
router.delete('/delete-material/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rowIndex = parseInt(id); // since id is 1-based, but deleteRow expects 0-based? Wait

    // Materials data starts from row 1 (0-based index 1, since header is 0)
    // id=1 means row 2 (0-based 1)
    await sheetsService.deleteRow('Materials', parseInt(id));

    res.json({ success: true, message: 'تم حذف المادة بنجاح' });
  } catch (error) {
    console.error('❌ خطأ في حذف المادة:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// الحصول على الكميات الموحدة (جميع المواد لأي مسجد)
router.get('/allocations/:mosque', verifyToken, async (req, res) => {
  try {
    const materials = await sheetsService.getData('Materials!A:C');

    const result = materials.slice(1).map((material, index) => ({
      id: index + 1,
      name: material[0],
      unit: material[1],
      quantity: material[2] ? parseFloat(material[2]) : 0,
    }));

    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في جلب الكميات:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// تقارير - ملخص عام
router.get('/reports/summary', verifyToken, async (req, res) => {
  try {
    const receipts = await sheetsService.getData('AllReceipts!A:AG');
    const materialsData = await sheetsService.getData('Materials!A:C');
    const users = await sheetsService.getData('Users!A:E');

    const materialNames = materialsData.slice(1).map(row => row[0] || 'مادة');

    let totalReceipts = 0;
    let totalMaterialsDistributed = 0;
    const mosquesCount = new Set();
    const governoratesCount = new Set();
    const workersCount = new Set();

    receipts.slice(1).forEach(r => {
      if (r[0]) { // has timestamp
        totalReceipts++;
        mosquesCount.add(r[3]); // mosque
        governoratesCount.add(r[4]); // governorate

        // count unique workers (both first and second worker)
        if (r[9]) { // first worker name (column J)
          workersCount.add(r[9]);
        }
        if (r[11]) { // second worker name (column L)
          workersCount.add(r[11]);
        }

        // sum materials (materials start at column 15)
        for (let i = 0; i < materialNames.length; i++) {
          const qty = parseFloat(r[15 + i]) || 0;
          totalMaterialsDistributed += qty;
        }
      }
    });

    res.json({
      totalReceipts,
      totalMaterialsDistributed,
      uniqueMosques: mosquesCount.size,
      uniqueGovernorates: governoratesCount.size,
      totalUsers: users.slice(1).length,
      totalWorkers: workersCount.size
    });
  } catch (error) {
    console.error('❌ خطأ في جلب التقرير:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// تقارير - حسب الشهر والسنة
router.get('/reports/by-month', verifyToken, async (req, res) => {
  try {
    const receipts = await sheetsService.getData('AllReceipts!A:AG');

    const monthlyData = {};

    // أسماء الشهور بالعربية
    const monthNames = {
      1: 'يناير',
      2: 'فبراير',
      3: 'مارس',
      4: 'أبريل',
      5: 'مايو',
      6: 'يونيو',
      7: 'يوليو',
      8: 'أغسطس',
      9: 'سبتمبر',
      10: 'أكتوبر',
      11: 'نوفمبر',
      12: 'ديسمبر'
    };

    receipts.slice(1).forEach(r => {
      if (r[0] && r[13] && r[14]) { // has data, month, year
        const month = parseInt(r[13]) || 0;
        const year = parseInt(r[14]) || 0;
        const key = `${year}-${month.toString().padStart(2, '0')}`; // year-month
        if (!monthlyData[key]) {
          monthlyData[key] = { count: 0, materials: 0 };
        }
        monthlyData[key].count++;

        // sum materials (materials start at column 15, after month/year)
        for (let i = 15; i < r.length; i++) {
          const qty = parseFloat(r[i]) || 0;
          monthlyData[key].materials += qty;
        }
      }
    });

    const result = Object.keys(monthlyData).map(key => {
      const [year, month] = key.split('-');
      const monthName = monthNames[parseInt(month)] || 'شهر غير معروف';
      return {
        period: `${monthName} ${year}`,
        receiptsCount: monthlyData[key].count,
        materialsDistributed: monthlyData[key].materials
      };
    }).sort((a, b) => {
      // ترتيب تنازلي حسب السنة والشهر
      const [yearA, monthA] = a.period.split(' ');
      const [yearB, monthB] = b.period.split(' ');
      if (yearA !== yearB) {
        return parseInt(yearB) - parseInt(yearA);
      }
      const monthIndexA = Object.keys(monthNames).find(key => monthNames[key] === monthA);
      const monthIndexB = Object.keys(monthNames).find(key => monthNames[key] === monthB);
      return parseInt(monthIndexB) - parseInt(monthIndexA);
    });

    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في جلب التقرير:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// تقارير - حسب المحافظة
router.get('/reports/by-governorate', verifyToken, async (req, res) => {
  try {
    const receipts = await sheetsService.getData('AllReceipts!A:AG');

    const governorateData = {};

    receipts.slice(1).forEach(r => {
      if (r[0] && r[4]) { // has data, governorate
        const gov = r[4];
        if (!governorateData[gov]) {
          governorateData[gov] = { count: 0, materials: 0 };
        }
        governorateData[gov].count++;

        // sum materials (materials start at column 15)
        for (let i = 15; i < r.length; i++) {
          const qty = parseFloat(r[i]) || 0;
          governorateData[gov].materials += qty;
        }
      }
    });

    const result = Object.keys(governorateData).map(gov => ({
      governorate: gov,
      receiptsCount: governorateData[gov].count,
      materialsDistributed: governorateData[gov].materials
    })).sort((a, b) => b.materialsDistributed - a.materialsDistributed);

    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في جلب التقرير:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// تقارير - تفاصيل المواد حسب المحافظة
router.get('/reports/materials-by-governorate', verifyToken, async (req, res) => {
  try {
    const receipts = await sheetsService.getData('AllReceipts!A:AG');
    const materialsData = await sheetsService.getData('Materials!A:C');

    // Get materials with their allocated quantities per mosque
    const materials = materialsData.slice(1).map((row, index) => ({
      name: row[0] || 'مادة',
      unit: row[1] || '',
      quantityPerMosque: parseFloat(row[2]) || 0
    }));

    const materialNames = materials.map(m => m.name);
    const governorates = [...new Set(receipts.slice(1).map(r => r[4]).filter(g => g))]; // unique governorates

    // Count mosques per governorate
    const mosquesByGovernorate = {};
    governorates.forEach(gov => {
      mosquesByGovernorate[gov] = new Set();
    });

    receipts.slice(1).forEach(r => {
      if (r[0] && r[3] && r[4]) { // has data, mosque, and governorate
        const mosque = r[3];
        const governorate = r[4];
        if (mosquesByGovernorate[governorate]) {
          mosquesByGovernorate[governorate].add(mosque);
        }
      }
    });

    const materialsByGovernorate = {};

    // Initialize data structure and calculate allocated amounts
    materials.forEach((material, materialIndex) => {
      materialsByGovernorate[material.name] = {};
      governorates.forEach(gov => {
        const mosquesCount = mosquesByGovernorate[gov].size;
        const allocated = material.quantityPerMosque * mosquesCount;

        materialsByGovernorate[material.name][gov] = {
          allocated: allocated,
          received: 0,
          notDelivered: 0
        };
      });
    });

    // Process receipts to get actual received quantities
    receipts.slice(1).forEach(r => {
      if (r[0] && r[4]) { // has data and governorate
        const governorate = r[4];

        // Process each material received quantities
        materials.forEach((material, materialIndex) => {
          const receivedIndex = 16 + materialIndex;  // received quantity (one column per material starting at Q)

          const received = parseFloat(r[receivedIndex]) || 0;

          if (materialsByGovernorate[material.name] && materialsByGovernorate[material.name][governorate]) {
            materialsByGovernorate[material.name][governorate].received += received;
            // Recalculate notDelivered based on correct allocated amount
            const allocated = materialsByGovernorate[material.name][governorate].allocated;
            materialsByGovernorate[material.name][governorate].notDelivered = Math.max(0, allocated - materialsByGovernorate[material.name][governorate].received);
          }
        });
      }
    });

    res.json({
      materials: materialNames,
      governorates: governorates,
      data: materialsByGovernorate
    });
  } catch (error) {
    console.error('❌ خطأ في جلب تقرير المواد:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// تقارير - حسب المسجد
router.get('/reports/by-mosque', verifyToken, async (req, res) => {
  try {
    const receipts = await sheetsService.getData('AllReceipts!A:AG');

    const mosqueData = {};

    receipts.slice(1).forEach(r => {
      if (r[0] && r[3]) { // has data, mosque
        const mosque = r[3];
        if (!mosqueData[mosque]) {
          mosqueData[mosque] = { count: 0, materials: 0 };
        }
        mosqueData[mosque].count++;

        // sum materials (materials start at column 15)
        for (let i = 15; i < r.length; i++) {
          const qty = parseFloat(r[i]) || 0;
          mosqueData[mosque].materials += qty;
        }
      }
    });

    const result = Object.keys(mosqueData).map(mosque => ({
      mosque: mosque,
      receiptsCount: mosqueData[mosque].count,
      materialsDistributed: mosqueData[mosque].materials
    })).sort((a, b) => b.materialsDistributed - a.materialsDistributed);

    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في جلب التقرير:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// البحث في الفواتير
router.get('/search-receipts', verifyToken, async (req, res) => {
  try {
    const { governorate, zone, mosque, registrarName, registrarPhone, workerName, month, year } = req.query;

    const receipts = await sheetsService.getData('AllReceipts!A:AI');
    const materialsData = await sheetsService.getData('Materials!A:C');

    const materialNames = materialsData.slice(1).map(row => row[0] || 'مادة');

    // تحويل البيانات إلى صيغة مناسبة للعرض
    let result = receipts.slice(1).map(r => {
      const materials = [];

      // جمع المواد من الأعمدة Q-AI
      for (let i = 0; i < materialNames.length; i++) {
        const columnIndex = 16 + i;
        const quantity = parseFloat(r[columnIndex]) || 0;

        if (quantity > 0) {
          materials.push({
            materialId: i + 1,
            materialName: materialNames[i],
            receivedQuantity: quantity
          });
        }
      }

      return {
        timestamp: r[0],
        registrarNationalId: r[1],
        registrarName: r[2],
        mosque: r[3],
        governorate: r[4],
        zone: r[5],
        section: r[6],
        mosqueName: r[7],
        registrarPhone: r[8],
        workerName: r[9],
        workerNationalId: r[10],
        secondWorkerName: r[11],
        secondWorkerNationalId: r[12],
        month: r[14],
        year: r[15],
        materials: materials
      };
    });

    // تطبيق الفلاتر
    if (governorate) {
      result = result.filter(r => r.governorate && r.governorate.toLowerCase().includes(governorate.toLowerCase()));
    }
    if (zone) {
      result = result.filter(r => r.zone && r.zone.toLowerCase().includes(zone.toLowerCase()));
    }
    if (mosque) {
      result = result.filter(r => r.mosque && r.mosque.toLowerCase().includes(mosque.toLowerCase()));
    }
    if (registrarName) {
      result = result.filter(r => r.registrarName && r.registrarName.toLowerCase().includes(registrarName.toLowerCase()));
    }
    if (registrarPhone) {
      result = result.filter(r => r.registrarPhone && r.registrarPhone.includes(registrarPhone));
    }
    if (workerName) {
      result = result.filter(r =>
        (r.workerName && r.workerName.toLowerCase().includes(workerName.toLowerCase())) ||
        (r.secondWorkerName && r.secondWorkerName.toLowerCase().includes(workerName.toLowerCase()))
      );
    }
    if (month) {
      result = result.filter(r => r.month && parseInt(r.month).toString() === month.toString());
    }
    if (year) {
      result = result.filter(r => r.year && parseInt(r.year).toString() === year.toString());
    }

    res.json(result);
  } catch (error) {
    console.error('❌ خطأ في البحث:', error);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

export default router;