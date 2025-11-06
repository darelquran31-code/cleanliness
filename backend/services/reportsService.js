import sheetsService from './sheetsService.js';

class ReportsService {
  // تحديث تقرير الملخص العام
  async updateSummaryReport() {
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

          // count unique workers
          if (r[9]) workersCount.add(r[9]); // first worker
          if (r[11]) workersCount.add(r[11]); // second worker

          // sum materials
          for (let i = 0; i < materialNames.length; i++) {
            const qty = parseFloat(r[16 + i]) || 0;
            totalMaterialsDistributed += qty;
          }
        }
      });

      const avgMaterialsPerReceipt = totalReceipts > 0 ? (totalMaterialsDistributed / totalReceipts).toFixed(1) : 0;

      // تحديث التقرير في جدول Reports
      const summaryData = [
        'ملخص عام',
        'الشهر الحالي',
        totalReceipts.toString(),
        totalMaterialsDistributed.toString(),
        mosquesCount.size.toString(),
        governoratesCount.size.toString(),
        workersCount.size.toString(),
        users.slice(1).length.toString(),
        avgMaterialsPerReceipt,
        new Date().toISOString(),
        'محدث تلقائياً'
      ];

      await sheetsService.updateData('Reports!A2:K2', summaryData);

      return {
        totalReceipts,
        totalMaterialsDistributed,
        uniqueMosques: mosquesCount.size,
        uniqueGovernorates: governoratesCount.size,
        totalWorkers: workersCount.size,
        totalUsers: users.slice(1).length,
        avgMaterialsPerReceipt
      };
    } catch (error) {
      console.error('❌ خطأ في تحديث تقرير الملخص:', error);
      throw error;
    }
  }

  // تحديث التقارير الشهرية
  async updateMonthlyReports() {
    try {
      const receipts = await sheetsService.getData('AllReceipts!A:AG');

      const monthlyData = {};
      const monthNames = {
        1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل', 5: 'مايو', 6: 'يونيو',
        7: 'يوليو', 8: 'أغسطس', 9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
      };

      receipts.slice(1).forEach(r => {
        if (r[0] && r[13] && r[14]) {
          const month = parseInt(r[13]) || 0;
          const year = parseInt(r[14]) || 0;
          const key = `${year}-${month.toString().padStart(2, '0')}`;

          if (!monthlyData[key]) {
            monthlyData[key] = { count: 0, materials: 0 };
          }
          monthlyData[key].count++;

          // sum materials
          for (let i = 16; i < r.length; i++) {
            const qty = parseFloat(r[i]) || 0;
            monthlyData[key].materials += qty;
          }
        }
      });

      // مسح البيانات القديمة وإضافة البيانات الجديدة
      const monthlyRows = Object.keys(monthlyData).map(key => {
        const [year, month] = key.split('-');
        const monthName = monthNames[parseInt(month)] || 'شهر غير معروف';
        return [
          'تقرير شهري',
          `${monthName} ${year}`,
          monthlyData[key].count.toString(),
          monthlyData[key].materials.toString(),
          (monthlyData[key].materials / monthlyData[key].count || 0).toFixed(1),
          new Date().toISOString()
        ];
      });

      // إضافة البيانات من الصف 5
      for (let i = 0; i < monthlyRows.length; i++) {
        await sheetsService.updateData(`Reports!A${5 + i}:F${5 + i}`, monthlyRows[i]);
      }

      return monthlyRows;
    } catch (error) {
      console.error('❌ خطأ في تحديث التقارير الشهرية:', error);
      throw error;
    }
  }

  // تحديث تقارير المحافظات
  async updateGovernorateReports() {
    try {
      const receipts = await sheetsService.getData('AllReceipts!A:AG');

      const governorateData = {};

      receipts.slice(1).forEach(r => {
        if (r[0] && r[4]) {
          const gov = r[4];
          if (!governorateData[gov]) {
            governorateData[gov] = { count: 0, materials: 0 };
          }
          governorateData[gov].count++;

          // sum materials
          for (let i = 16; i < r.length; i++) {
            const qty = parseFloat(r[i]) || 0;
            governorateData[gov].materials += qty;
          }
        }
      });

      const governorateRows = Object.keys(governorateData).map(gov => [
        'تقرير محافظة',
        gov,
        governorateData[gov].count.toString(),
        governorateData[gov].materials.toString(),
        new Date().toISOString()
      ]);

      // إضافة البيانات من الصف 7
      for (let i = 0; i < governorateRows.length; i++) {
        await sheetsService.updateData(`Reports!A${7 + i}:E${7 + i}`, governorateRows[i]);
      }

      return governorateRows;
    } catch (error) {
      console.error('❌ خطأ في تحديث تقارير المحافظات:', error);
      throw error;
    }
  }

  // تحديث المواد بالمحافظات
  async updateMaterialsByGovernorate() {
    try {
      const receipts = await sheetsService.getData('AllReceipts!A:AG');
      const materialsData = await sheetsService.getData('Materials!A:C');

      const materials = materialsData.slice(1).map((row, index) => ({
        name: row[0] || 'مادة',
        unit: row[1] || '',
        quantityPerMosque: parseFloat(row[2]) || 0
      }));

      const governorates = [...new Set(receipts.slice(1).map(r => r[4]).filter(g => g))];

      // Count receipts per governorate
      const receiptsByGovernorate = {};
      governorates.forEach(gov => {
        receiptsByGovernorate[gov] = 0;
      });

      receipts.slice(1).forEach(r => {
        if (r[0] && r[4]) {
          const governorate = r[4];
          if (receiptsByGovernorate[governorate] !== undefined) {
            receiptsByGovernorate[governorate]++;
          }
        }
      });

      const materialsByGovernorate = {};

      // Initialize and calculate
      materials.forEach((material, materialIndex) => {
        materialsByGovernorate[material.name] = {};
        governorates.forEach(gov => {
          const receiptsCount = receiptsByGovernorate[gov] || 0;
          const allocated = material.quantityPerMosque * receiptsCount;

          materialsByGovernorate[material.name][gov] = {
            allocated: allocated,
            received: 0,
            notDelivered: 0
          };
        });
      });

      // Process receipts to get actual received quantities
      receipts.slice(1).forEach(r => {
        if (r[0] && r[4]) {
          const governorate = r[4];

          materials.forEach((material, materialIndex) => {
            const receivedIndex = 16 + materialIndex;
            const received = parseFloat(r[receivedIndex]) || 0;

            if (materialsByGovernorate[material.name] && materialsByGovernorate[material.name][governorate]) {
              materialsByGovernorate[material.name][governorate].received += received;
              const allocated = materialsByGovernorate[material.name][governorate].allocated;
              materialsByGovernorate[material.name][governorate].notDelivered = Math.max(0, allocated - materialsByGovernorate[material.name][governorate].received);
            }
          });
        }
      });

      // إضافة البيانات إلى جدول Reports
      let rowIndex = 9; // بدء من الصف 9
      materials.forEach(material => {
        governorates.forEach(gov => {
          const data = materialsByGovernorate[material.name][gov];
          const rowData = [
            'مادة بالمحافظة',
            gov,
            material.name,
            data.received.toString(),
            data.allocated.toString(),
            data.notDelivered.toString(),
            new Date().toISOString()
          ];

          sheetsService.updateData(`Reports!A${rowIndex}:G${rowIndex}`, rowData);
          rowIndex++;
        });
      });

      return {
        materials: materials.map(m => m.name),
        governorates: governorates,
        data: materialsByGovernorate
      };
    } catch (error) {
      console.error('❌ خطأ في تحديث المواد بالمحافظات:', error);
      throw error;
    }
  }

  // قراءة البيانات من جدول Reports
  async getReportsData() {
    try {
      const reportsData = await sheetsService.getData('Reports!A:Z');

      const summary = {};
      const monthlyData = [];
      const governorateData = [];
      const materialsByGovernorate = {};

      reportsData.forEach((row, index) => {
        if (index === 1 && row[0] === 'ملخص عام') { // صف 2
          summary.totalReceipts = parseInt(row[2]) || 0;
          summary.totalMaterialsDistributed = parseInt(row[3]) || 0;
          summary.uniqueMosques = parseInt(row[4]) || 0;
          summary.uniqueGovernorates = parseInt(row[5]) || 0;
          summary.totalWorkers = parseInt(row[6]) || 0;
          summary.totalUsers = parseInt(row[7]) || 0;
          summary.avgMaterialsPerReceipt = parseFloat(row[8]) || 0;
        } else if (row[0] === 'تقرير شهري' && index >= 4) { // من الصف 5
          monthlyData.push({
            period: row[1],
            receiptsCount: parseInt(row[2]) || 0,
            materialsDistributed: parseInt(row[3]) || 0
          });
        } else if (row[0] === 'تقرير محافظة' && index >= 6) { // من الصف 7
          governorateData.push({
            governorate: row[1],
            receiptsCount: parseInt(row[2]) || 0,
            materialsDistributed: parseInt(row[3]) || 0
          });
        } else if (row[0] === 'مادة بالمحافظة' && index >= 8) { // من الصف 9
          const gov = row[1];
          const material = row[2];
          const received = parseInt(row[3]) || 0;
          const allocated = parseInt(row[4]) || 0;
          const notDelivered = parseInt(row[5]) || 0;

          if (!materialsByGovernorate[material]) {
            materialsByGovernorate[material] = {};
          }
          materialsByGovernorate[material][gov] = {
            allocated,
            received,
            notDelivered
          };
        }
      });

      // قراءة بيانات المواد بالمحافظات من الخلايا المحددة في Reports
      try {
        // قراءة رؤوس المحافظات من الصف 3
        const headersRow = await sheetsService.getData('Reports!A3:Z3');
        const governorates = [];

        // استخراج أسماء المحافظات (كل 3 أعمدة تمثل محافظة واحدة)
        for (let i = 0; i < (headersRow[0] || []).length; i += 3) {
          const govName = headersRow[0][i];
          if (govName) {
            governorates.push(govName);
          }
        }

        // قراءة بيانات المواد من الصف 5 فما بعد (الصف 4 هو sub-headers)
        const materialsData = await sheetsService.getData('Reports!A5:Z50');

        materialsData.forEach((row, rowIndex) => {
          if (row[0] && rowIndex < materialsData.length) { // العمود A يحتوي على اسم المادة
            const materialName = row[0];

            // لكل محافظة، قراءة البيانات من الأعمدة المناسبة
            governorates.forEach((gov, govIndex) => {
              const baseCol = govIndex * 3; // كل محافظة تأخذ 3 أعمدة
              const allocated = parseFloat(row[baseCol + 1]) || 0; // العمود B, E, H, etc.
              const received = parseFloat(row[baseCol + 2]) || 0;  // العمود C, F, I, etc.
              const notDelivered = parseFloat(row[baseCol + 3]) || 0; // العمود D, G, J, etc.

              if (!materialsByGovernorate[materialName]) {
                materialsByGovernorate[materialName] = {};
              }

              materialsByGovernorate[materialName][gov] = {
                allocated,
                received,
                notDelivered
              };
            });
          }
        });

        console.log('✅ تم قراءة بيانات المواد بالمحافظات من جدول Reports');
        console.log('المحافظات المقروءة:', governorates);
      } catch (materialsError) {
        console.log('⚠️ لم يتم العثور على بيانات المواد بالمحافظات في جدول Reports، سيتم استخدام البيانات المحسوبة');
        console.error('تفاصيل الخطأ:', materialsError.message);
      }

      return {
        summary,
        monthlyData,
        governorateData,
        materialsByGovernorate
      };
    } catch (error) {
      console.error('❌ خطأ في قراءة بيانات التقارير:', error);
      throw error;
    }
  }

  // تحديث جميع التقارير
  async updateAllReports() {
    try {
      console.log('🔄 بدء تحديث جميع التقارير...');

      await this.updateSummaryReport();
      console.log('✅ تم تحديث الملخص العام');

      await this.updateMonthlyReports();
      console.log('✅ تم تحديث التقارير الشهرية');

      await this.updateGovernorateReports();
      console.log('✅ تم تحديث تقارير المحافظات');

      const materialsData = await this.updateMaterialsByGovernorate();
      console.log('✅ تم تحديث المواد بالمحافظات');

      console.log('🎉 تم تحديث جميع التقارير بنجاح!');
      return materialsData;
    } catch (error) {
      console.error('❌ خطأ في تحديث التقارير:', error);
      throw error;
    }
  }
}

export default new ReportsService();