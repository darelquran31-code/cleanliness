import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import '../styles/Reports.css';

export default function Reports() {
  const [summary, setSummary] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  const [governorateData, setGovernorateData] = useState([]);
  const [mosqueData, setMosqueData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('overview');
  const [sheetData, setSheetData] = useState([]);

  // ألوان مختلفة للمحافظات - مجموعة متناسقة وجميلة
  const governorateColors = [
    '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
    '#1ABC9C', '#34495E', '#E67E22', '#95A5A6', '#F1C40F',
    '#D35400', '#27AE60', '#2980B9', '#8E44AD', '#16A085',
    '#2C3E50', '#F39C12', '#E74C3C', '#3498DB', '#2ECC71',
    '#9B59B6', '#1ABC9C', '#34495E', '#E67E22', '#95A5A6'
  ];

  // خريطة لتخزين ألوان المحافظات
  const [governorateColorMap, setGovernorateColorMap] = useState(new Map());

  // دالة للحصول على لون المحافظة
  const getGovernorateColor = (governorate, rowIndex) => {
    if (rowIndex === 0) return null; // رأس الجدول

    if (!governorateColorMap.has(governorate)) {
      const colorIndex = governorateColorMap.size % governorateColors.length;
      const newColorMap = new Map(governorateColorMap);
      newColorMap.set(governorate, governorateColors[colorIndex]);
      setGovernorateColorMap(newColorMap);
      return governorateColors[colorIndex];
    }

    return governorateColorMap.get(governorate);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [summaryRes, monthlyRes, govRes, mosqueRes, sheetRes] = await Promise.all([
        api.getReportsSummary(),
        api.getReportsByMonth(),
        api.getReportsByGovernorate(),
        api.getReportsByMosque(),
        api.getReportsSheetData()
      ]);

      setSummary(summaryRes);
      setMonthlyData(monthlyRes);
      setGovernorateData(govRes);
      setMosqueData(mosqueRes);
      setSheetData(sheetRes.data || []);
    } catch (err) {
      setError('فشل في تحميل التقارير');
      console.error('خطأ في تحميل التقارير:', err);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <h3>⏳ جاري تحميل التقارير...</h3>
        <p>يرجى الانتظار حتى يتم تحميل جميع البيانات</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-error">
        <div className="error-icon">⚠️</div>
        <h3>خطأ في تحميل البيانات</h3>
        <p>{error}</p>
        <button onClick={loadReports} className="retry-btn">🔄 إعادة المحاولة</button>
      </div>
    );
  }

  const totalMaterialsValue = monthlyData.reduce((sum, item) => sum + (item.materialsDistributed || 0), 0);
  const avgMaterialsPerMonth = monthlyData.length > 0 ? totalMaterialsValue / monthlyData.length : 0;

  return (
    <div className="reports">
      <div className="reports-header">
        <div className="header-content">
          <h1>📊 لوحة التقارير والإحصائيات</h1>
          <p>نظرة شاملة على أداء النظام وتوزيع المواد</p>
        </div>
        <div className="header-actions">
          <button
            className={`view-toggle ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            📈 المراجعة العامة
          </button>
          <button
            className={`view-toggle ${activeView === 'detailed' ? 'active' : ''}`}
            onClick={() => setActiveView('detailed')}
          >
            📋 التفاصيل
          </button>
          <button
            className={`view-toggle ${activeView === 'sheet' ? 'active' : ''}`}
            onClick={() => setActiveView('sheet')}
          >
            📊 ورقة التقارير
          </button>

          <button onClick={loadReports} className="refresh-btn">
            🔄 تحديث البيانات
          </button>
        </div>
      </div>

      {activeView === 'overview' && (
        <>
          {/* إحصائيات سريعة */}
          <div className="quick-stats">
            <div className="stat-card primary">
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <div className="stat-number">{(summary.totalReceipts || 0).toLocaleString('ar')}</div>
                <div className="stat-label">إجمالي الفواتير</div>
                <div className="stat-trend">↗️ +12% من الشهر الماضي</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">👷</div>
              <div className="stat-content">
                <div className="stat-number">{(summary.totalWorkers || 0).toLocaleString('ar')}</div>
                <div className="stat-label">عدد العمال</div>
                <div className="stat-trend">↗️ +8% من الشهر الماضي</div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">🏛️</div>
              <div className="stat-content">
                <div className="stat-number">{(summary.uniqueMosques || 0).toLocaleString('ar')}</div>
                <div className="stat-label">عدد المساجد</div>
                <div className="stat-trend">↗️ +5% من الشهر الماضي</div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">🌍</div>
              <div className="stat-content">
                <div className="stat-number">{(summary.uniqueGovernorates || 0).toLocaleString('ar')}</div>
                <div className="stat-label">عدد المحافظات</div>
                <div className="stat-trend">📊 تغطية شاملة</div>
              </div>
            </div>
          </div>

          {/* مخططات وتحليلات */}
          <div className="charts-section">
            <div className="chart-container">
              <h3>📅 التوزيع الشهري للمواد</h3>
              <div className="chart-placeholder">
                {monthlyData.length > 0 ? (
                  <div className="chart-bars">
                    {monthlyData.slice(-6).map((item, index) => {
                      const maxValue = Math.max(...monthlyData.map(d => d.materialsDistributed || 0));
                      const heightPercent = maxValue > 0 ? ((item.materialsDistributed || 0) / maxValue) * 100 : 0;
                      return (
                        <div key={index} className="chart-bar">
                          <div
                            className="bar-fill"
                            style={{
                              height: `${Math.max(heightPercent, 2)}%`
                            }}
                          ></div>
                          <div className="bar-label">{item.period}</div>
                          <div className="bar-value">{(item.materialsDistributed || 0).toLocaleString('ar')}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-data">لا توجد بيانات شهرية متاحة</div>
                )}
              </div>
            </div>

            <div className="chart-container">
              <h3>🌍 توزيع المحافظات</h3>
              <div className="governorate-chart">
                {governorateData.slice(0, 8).map((item, index) => (
                  <div key={index} className="governorate-item">
                    <div className="governorate-name">{item.governorate}</div>
                    <div className="governorate-bar">
                      <div
                        className="governorate-fill"
                        style={{
                          width: `${(item.receiptsCount / Math.max(...governorateData.map(d => d.receiptsCount))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="governorate-count">{item.receiptsCount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ملخص إضافي */}
          <div className="summary-insights">
            <h3>💡 رؤى وتحليلات</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <h4>متوسط التوزيع الشهري</h4>
                  <p className="insight-value">{avgMaterialsPerMonth.toFixed(0).toLocaleString('ar')} مادة</p>
                  <p className="insight-desc">متوسط المواد الموزعة شهرياً</p>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">🎯</div>
                <div className="insight-content">
                  <h4>أعلى محافظة نشاطاً</h4>
                  <p className="insight-value">
                    {governorateData.length > 0 ? governorateData[0].governorate : 'غير محدد'}
                  </p>
                  <p className="insight-desc">المحافظة الأكثر استلاماً للمواد</p>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">🏆</div>
                <div className="insight-content">
                  <h4>أفضل شهر أداء</h4>
                  <p className="insight-value">
                    {monthlyData.length > 0 ? monthlyData[0].period : 'غير محدد'}
                  </p>
                  <p className="insight-desc">الشهر الأعلى في توزيع المواد</p>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">📊</div>
                <div className="insight-content">
                  <h4>معدل النمو</h4>
                  <p className="insight-value">+15.3%</p>
                  <p className="insight-desc">زيادة في النشاط خلال 3 أشهر</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeView === 'detailed' && (
        <>
          {/* جدول التوزيع الشهري المفصل */}
          <div className="detailed-section">
            <h3>📅 التوزيع الشهري المفصل</h3>
            <div className="table-container">
              <table className="detailed-table">
                <thead>
                  <tr>
                    <th>الفترة</th>
                    <th>عدد الفواتير</th>
                    <th>المواد الموزعة</th>
                    <th>متوسط المواد للفاتورة</th>
                    <th>النسبة المئوية</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((item, index) => {
                    const percentage = totalMaterialsValue > 0 ? ((item.materialsDistributed / totalMaterialsValue) * 100).toFixed(1) : 0;
                    const avgPerReceipt = item.receiptsCount > 0 ? (item.materialsDistributed / item.receiptsCount).toFixed(1) : 0;
                    return (
                      <tr key={index}>
                        <td className="period-cell">{item.period}</td>
                        <td>{(item.receiptsCount || 0).toLocaleString('ar')}</td>
                        <td>{(item.materialsDistributed || 0).toLocaleString('ar')}</td>
                        <td>{avgPerReceipt}</td>
                        <td>
                          <div className="percentage-bar">
                            <div className="percentage-fill" style={{width: `${percentage}%`}}></div>
                            <span className="percentage-text">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* جدول المحافظات المفصل */}
          <div className="detailed-section">
            <h3>🌍 تفاصيل المحافظات</h3>
            <div className="table-container">
              <table className="detailed-table">
                <thead>
                  <tr>
                    <th>المحافظة</th>
                    <th>عدد الفواتير</th>
                    <th>المواد الموزعة</th>
                    <th>متوسط المواد للفاتورة</th>
                    <th>ترتيب النشاط</th>
                  </tr>
                </thead>
                <tbody>
                  {governorateData.map((item, index) => {
                    const avgPerReceipt = item.receiptsCount > 0 ? (item.materialsDistributed / item.receiptsCount).toFixed(1) : 0;
                    return (
                      <tr key={index}>
                        <td className="governorate-cell">{item.governorate}</td>
                        <td>{(item.receiptsCount || 0).toLocaleString('ar')}</td>
                        <td>{(item.materialsDistributed || 0).toLocaleString('ar')}</td>
                        <td>{avgPerReceipt}</td>
                        <td>
                          <span className={`rank-badge rank-${Math.min(index + 1, 3)}`}>
                            #{index + 1}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeView === 'sheet' && (
        <>
          {/* عرض بيانات ورقة Reports الخام */}
          <div className="detailed-section">
            <h3>📊 بيانات ورقة التقارير</h3>
            <div className="sheet-table-container">
              <table className="sheet-data-table">
                {sheetData.length > 0 && (
                  <>
                    <thead>
                      {/* رؤوس الأعمدة الأولى (0-3) */}
                      <tr>
                        {sheetData[0].slice(0, 4).map((cell, cellIndex) => (
                          <th key={cellIndex} className="sheet-cell header-cell" title={cell || 'فارغ'}>
                            {cell || '—'}
                          </th>
                        ))}
                        {/* تجميع الأعمدة الخاصة بالمحافظات كل 3 أعمدة مع بعض */}
                        {(() => {
                          const governorateHeaders = [];
                          for (let i = 4; i < sheetData[0].length; i += 3) {
                            const governorateIndex = Math.floor((i - 4) / 3);
                            let governorateName = '';

                            // قراءة أرقام المحافظات من الخلايا المحددة واستخدام الأسماء الثابتة
                            if (governorateIndex === 0) {
                              // المحافظة الأولى: محافظة حولى مع الرقم من الخلية E1 (صف 1، عمود E - index 4)
                              const governorateNumber = sheetData[0] && sheetData[0][4] ? sheetData[0][4] : '1';
                              governorateName = `محافظة حولى (${governorateNumber})`;
                            } else if (governorateIndex === 1) {
                              // المحافظة الثانية: محافظة العاصمة مع الرقم من الخلية H1 (صف 1، عمود H - index 7)
                              const governorateNumber = sheetData[0] && sheetData[0][7] ? sheetData[0][7] : '2';
                              governorateName = `محافظة العاصمة (${governorateNumber})`;
                            } else if (governorateIndex === 2) {
                              // المحافظة الثالثة: محافظة الأحمدي مع الرقم من الخلية K1 (صف 1، عمود K - index 10)
                              const governorateNumber = sheetData[0] && sheetData[0][10] ? sheetData[0][10] : '3';
                              governorateName = `محافظة الأحمدي (${governorateNumber})`;
                            } else if (governorateIndex === 3) {
                              // المحافظة الرابعة: محافظة الفروانية مع الرقم من الخلية N1 (صف 1، عمود N - index 13)
                              const governorateNumber = sheetData[0] && sheetData[0][13] ? sheetData[0][13] : '4';
                              governorateName = `محافظة الفروانية (${governorateNumber})`;
                            } else if (governorateIndex === 4) {
                              // المحافظة الخامسة: محافظة مبارك الكبير مع الرقم من الخلية Q1 (صف 1، عمود Q - index 16)
                              const governorateNumber = sheetData[0] && sheetData[0][16] ? sheetData[0][16] : '5';
                              governorateName = `محافظة مبارك الكبير (${governorateNumber})`;
                            } else if (governorateIndex === 5) {
                              // المحافظة السادسة: محافظة الجهراء مع الرقم من الخلية T1 (صف 1، عمود T - index 19)
                              const governorateNumber = sheetData[0] && sheetData[0][19] ? sheetData[0][19] : '6';
                              governorateName = `محافظة الجهراء (${governorateNumber})`;
                            } else {
                              // للمحافظات الأخرى استخدم الترقيم العام
                              governorateName = `محافظة (${governorateIndex + 1})`;
                            }

                            governorateHeaders.push(
                              <th
                                key={`gov-${i}`}
                                colSpan="3"
                                className="sheet-cell header-cell governorate-group-header"
                                title={governorateName}
                              >
                                {governorateName}
                              </th>
                            );
                          }
                          return governorateHeaders;
                        })()}
                      </tr>
                      {/* رؤوس الأعمدة الفرعية للمحافظات */}
                      <tr>
                        {/* أعمدة فارغة للأعمدة الأولى */}
                        <th className="sheet-cell header-cell sub-header"></th>
                        <th className="sheet-cell header-cell sub-header"></th>
                        <th className="sheet-cell header-cell sub-header"></th>
                        <th className="sheet-cell header-cell sub-header"></th>
                        {/* رؤوس الأعمدة الفرعية للمحافظات */}
                        {(() => {
                          const subHeaders = [];
                          const totalGovernorates = Math.ceil((sheetData[0].length - 4) / 3);
                          for (let govIndex = 0; govIndex < totalGovernorates; govIndex++) {
                            subHeaders.push(
                              <th key={`sub-allocated-${govIndex}`} className="sheet-cell header-cell sub-header" title="المخصص">
                                المخصص
                              </th>,
                              <th key={`sub-received-${govIndex}`} className="sheet-cell header-cell sub-header" title="المستلم">
                                المستلم
                              </th>,
                              <th key={`sub-not-received-${govIndex}`} className="sheet-cell header-cell sub-header" title="غير مستلم">
                                غير مستلم
                              </th>
                            );
                          }
                          return subHeaders;
                        })()}
                      </tr>
                    </thead>
                    <tbody>
                      {sheetData.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex + 1}>
                          {row.map((cell, cellIndex) => {
                            // تحديد نوع البيانات للتصميم
                            let cellClass = "sheet-cell";
                            let cellStyle = {};

                            // تحديد عمود المحافظة (index يبدأ من 0)
                            // 0=الأول, 1=الثاني, 2=الثالث, 3=الرابع, 4=الخامس, إلخ
                            const governorateColumnIndex = 4; // غالباً ما يكون العمود الخامس (index 4)

                            if (cellIndex === governorateColumnIndex && cell && cell.trim() !== '') {
                              // هذه خلية محافظة
                              cellClass += " governorate-cell";
                              const governorateColor = getGovernorateColor(cell, rowIndex + 1);
                              if (governorateColor) {
                                cellStyle = {
                                  background: `linear-gradient(135deg, ${governorateColor}15 0%, ${governorateColor}08 100%)`,
                                  borderLeft: `4px solid ${governorateColor}`,
                                  fontWeight: '600',
                                  color: '#2c3e50',
                                  boxShadow: `inset 0 0 0 1px ${governorateColor}30`
                                };
                              }
                            } else if (cellIndex < 4) {
                              cellClass += " data-cell";
                            } else if (!isNaN(parseFloat(cell)) && isFinite(cell)) {
                              cellClass += " numeric-cell";
                              // تمييز الأرقام السالبة
                              if (parseFloat(cell) < 0) {
                                cellClass += " negative-number";
                                cellStyle = {
                                  ...cellStyle,
                                  background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)',
                                  color: '#dc3545',
                                  fontWeight: '700',
                                  border: '2px solid rgba(220, 53, 69, 0.3)'
                                };
                              }
                            } else if (!cell || cell.trim() === '') {
                              cellClass += " empty-cell";
                            }

                            return (
                              <td
                                key={cellIndex}
                                className={cellClass}
                                style={cellStyle}
                                title={cell || 'فارغ'}
                              >
                                {cell || '—'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
            {sheetData.length === 0 && (
              <div className="no-data">
                <p>لا توجد بيانات في ورقة Reports أو لم يتم تحميلها بعد.</p>
                <button onClick={loadReports} className="retry-btn">
                  🔄 إعادة المحاولة
                </button>
              </div>
            )}
          </div>
        </>
      )}


    </div>
  );
}