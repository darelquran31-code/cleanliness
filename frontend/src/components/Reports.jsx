import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import '../styles/Reports.css';

export default function Reports() {
  const [summary, setSummary] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  const [governorateData, setGovernorateData] = useState([]);
  const [mosqueData, setMosqueData] = useState([]);
  const [materialsByGovernorate, setMaterialsByGovernorate] = useState({});
  const [materialsList, setMaterialsList] = useState([]);
  const [governoratesList, setGovernoratesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [summaryRes, monthlyRes, govRes, mosqueRes, materialsRes] = await Promise.all([
        api.getReportsSummary(),
        api.getReportsByMonth(),
        api.getReportsByGovernorate(),
        api.getReportsByMosque(),
        api.getMaterialsByGovernorate()
      ]);

      setSummary(summaryRes);
      setMonthlyData(monthlyRes);
      setGovernorateData(govRes);
      setMosqueData(mosqueRes);
      setMaterialsByGovernorate(materialsRes.data || {});
      setMaterialsList(materialsRes.materials || []);
      setGovernoratesList(materialsRes.governorates || []);
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
            className={`view-toggle ${activeView === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveView('materials')}
          >
            📦 المواد بالمحافظات
          </button>
          <button onClick={loadReports} className="refresh-btn">
            🔄 تحديث
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

      {activeView === 'materials' && (
        <>
          {/* تقرير المواد المفصل حسب المحافظة */}
          <div className="detailed-section">
            <h3>📦 تفاصيل المواد حسب المحافظة</h3>
            <div className="materials-table-container">
              <table className="materials-governorate-table">
                <thead>
                  <tr>
                    <th rowSpan="2" className="material-column">الصنف</th>
                    {governoratesList.map((gov, index) => (
                      <th key={index} colSpan="3" className="governorate-header">{gov}</th>
                    ))}
                  </tr>
                  <tr>
                    {governoratesList.map((gov, index) => (
                      <React.Fragment key={`sub-${index}`}>
                        <th className="sub-header">المخصص</th>
                        <th className="sub-header">المستلم</th>
                        <th className="sub-header">غير مستلم</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {materialsList.map((material, materialIndex) => (
                    <tr key={materialIndex}>
                      <td className="material-name">{material}</td>
                      {governoratesList.map((gov, govIndex) => {
                        const data = materialsByGovernorate[material]?.[gov] || { allocated: 0, received: 0, notDelivered: 0 };
                        return (
                          <React.Fragment key={`data-${govIndex}`}>
                            <td className="data-cell allocated">{data.allocated.toLocaleString('ar')}</td>
                            <td className="data-cell received">{data.received.toLocaleString('ar')}</td>
                            <td className={`data-cell not-delivered ${data.notDelivered > 0 ? 'warning' : ''}`}>
                              {data.notDelivered.toLocaleString('ar')}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}