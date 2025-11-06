import { useState } from 'react';
import { api } from '../services/api';
import '../styles/Search.css';

export default function Search() {
  const [filters, setFilters] = useState({
    governorate: '',
    zone: '',
    mosque: '',
    registrarName: '',
    registrarPhone: '',
    workerName: '',
    month: '',
    year: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // إزالة الفلاتر الفارغة
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value.trim() !== '')
      );

      const searchResults = await api.searchReceipts(activeFilters);
      setResults(searchResults);
    } catch (err) {
      setError('فشل في البحث');
      console.error('خطأ في البحث:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('ar-EG');
  };

  return (
    <div className="search">
      <h2>🔍 البحث في الفواتير</h2>

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-row">
          <div className="form-group">
            <label>🏛️ المحافظة:</label>
            <input
              type="text"
              name="governorate"
              value={filters.governorate}
              onChange={handleInputChange}
              placeholder="ابحث بالمحافظة"
            />
          </div>

          <div className="form-group">
            <label>🗺️ المنطقة:</label>
            <input
              type="text"
              name="zone"
              value={filters.zone}
              onChange={handleInputChange}
              placeholder="ابحث بالمنطقة"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>🏢 اسم المسجد:</label>
            <input
              type="text"
              name="mosque"
              value={filters.mosque}
              onChange={handleInputChange}
              placeholder="ابحث باسم المسجد"
            />
          </div>

          <div className="form-group">
            <label>👨‍💼 اسم الإمام:</label>
            <input
              type="text"
              name="registrarName"
              value={filters.registrarName}
              onChange={handleInputChange}
              placeholder="ابحث باسم الإمام"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>📞 رقم الهاتف:</label>
            <input
              type="text"
              name="registrarPhone"
              value={filters.registrarPhone}
              onChange={handleInputChange}
              placeholder="ابحث برقم الهاتف"
            />
          </div>

          <div className="form-group">
            <label>👷 اسم العامل:</label>
            <input
              type="text"
              name="workerName"
              value={filters.workerName}
              onChange={handleInputChange}
              placeholder="ابحث باسم العامل"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>📅 الشهر:</label>
            <input
              type="number"
              name="month"
              value={filters.month}
              onChange={handleInputChange}
              placeholder="ابحث بالشهر (1-12)"
              min="1"
              max="12"
            />
          </div>

          <div className="form-group">
            <label>📆 السنة:</label>
            <input
              type="number"
              name="year"
              value={filters.year}
              onChange={handleInputChange}
              placeholder="ابحث بالسنة"
              min="2020"
              max="2030"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '⏳ جاري البحث...' : '🔍 بحث'}
        </button>
      </form>

      {error && <div className="error-message">⚠️ {error}</div>}

      {results.length > 0 && (
        <div className="search-results">
          <h3>📋 نتائج البحث ({results.length} فاتورة)</h3>
          <div className="table-container">
            <table className="search-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>المحافظة</th>
                  <th>المنطقة</th>
                  <th>المسجد</th>
                  <th>اسم المسجد</th>
                  <th>الإمام</th>
                  <th>الهاتف</th>
                  <th>العامل</th>
                  <th>المواد</th>
                  <th>التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {results.map((receipt, index) => (
                  <tr key={index}>
                    <td>{formatDate(receipt.timestamp)}</td>
                    <td>{receipt.governorate}</td>
                    <td>{receipt.zone}</td>
                    <td>{receipt.mosque}</td>
                    <td>{receipt.mosqueName}</td>
                    <td>{receipt.registrarName}</td>
                    <td>{receipt.registrarPhone}</td>
                    <td>
                      {receipt.workerName}
                      {receipt.secondWorkerName && ` / ${receipt.secondWorkerName}`}
                    </td>
                    <td>
                      {receipt.materials.length > 0 ? (
                        <div className="materials-summary">
                          {receipt.materials.slice(0, 2).map((mat, i) => (
                            <div key={i} className="material-item">
                              {mat.materialName}: {mat.receivedQuantity}
                            </div>
                          ))}
                          {receipt.materials.length > 2 && (
                            <div className="material-item">+{receipt.materials.length - 2} أخرى</div>
                          )}
                        </div>
                      ) : (
                        'لا توجد مواد'
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleRowExpansion(index)}
                        className="btn-details"
                      >
                        {expandedRows.has(index) ? 'إخفاء' : 'عرض'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* تفاصيل إضافية للصفوف الموسعة */}
          {results.map((receipt, index) => (
            expandedRows.has(index) && (
              <div key={`details-${index}`} className="receipt-details">
                <h4>تفاصيل الفاتورة #{index + 1}</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>التاريخ والوقت:</strong> {formatDate(receipt.timestamp)}
                  </div>
                  <div className="detail-item">
                    <strong>المحافظة:</strong> {receipt.governorate}
                  </div>
                  <div className="detail-item">
                    <strong>المنطقة:</strong> {receipt.zone}
                  </div>
                  <div className="detail-item">
                    <strong>القطعة:</strong> {receipt.section}
                  </div>
                  <div className="detail-item">
                    <strong>المسجد:</strong> {receipt.mosque}
                  </div>
                  <div className="detail-item">
                    <strong>اسم المسجد:</strong> {receipt.mosqueName}
                  </div>
                  <div className="detail-item">
                    <strong>اسم الإمام:</strong> {receipt.registrarName}
                  </div>
                  <div className="detail-item">
                    <strong>رقم الهاتف:</strong> {receipt.registrarPhone}
                  </div>
                  <div className="detail-item">
                    <strong>العامل الأول:</strong> {receipt.workerName}
                  </div>
                  <div className="detail-item">
                    <strong>رقم المدني للعامل الأول:</strong> {receipt.workerNationalId}
                  </div>
                  {receipt.secondWorkerName && (
                    <>
                      <div className="detail-item">
                        <strong>العامل الثاني:</strong> {receipt.secondWorkerName}
                      </div>
                      <div className="detail-item">
                        <strong>رقم المدني للعامل الثاني:</strong> {receipt.secondWorkerNationalId}
                      </div>
                    </>
                  )}
                  <div className="detail-item">
                    <strong>الشهر:</strong> {receipt.month}
                  </div>
                  <div className="detail-item">
                    <strong>السنة:</strong> {receipt.year}
                  </div>
                </div>

                <h5>🧹 المواد المستلمة:</h5>
                {receipt.materials.length > 0 ? (
                  <div className="materials-list">
                    {receipt.materials.map((mat, i) => (
                      <div key={i} className="material-detail">
                        <span className="material-name">{mat.materialName}</span>
                        <span className="material-quantity">{mat.receivedQuantity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>لا توجد مواد مستلمة</p>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {results.length === 0 && !loading && !error && (
        <div className="no-results">
          <p>🔍 ابحث عن الفواتير باستخدام الفلاتر أعلاه</p>
        </div>
      )}
    </div>
  );
}