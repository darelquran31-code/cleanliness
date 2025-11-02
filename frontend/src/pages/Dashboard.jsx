import { useState, useEffect } from 'react';
import { FiPlus, FiLogOut, FiFileText, FiMapPin, FiUser, FiPhone, FiCalendar } from 'react-icons/fi';
import { api } from '../services/api';
import ReceiptForm from '../components/ReceiptForm';
import '../styles/Dashboard.css';

export default function Dashboard({ setUser }) {
  const [receipts, setReceipts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const data = await api.getReceipts();
      setReceipts(data);
    } catch (err) {
      console.error('خطأ في جلب الفواتير:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  const handleReceiptAdded = () => {
    setShowForm(false);
    loadReceipts();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <img src="https://drive.google.com/thumbnail?id=17Vs_ZMZ2xjHMDfzM442bIyftEsRhdJlB&sz=s4000" alt="شعار" className="logo" />
        <h1>📊 لوحة المتابعة</h1>
        <div className="header-info">
          <span><FiUser size={16} /> {user.name}</span>
          <span><FiFileText size={16} /> {user.mosque}</span>
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="receipts-section">
          <div className="section-header">
            <h2>📋 فواتير الاستلام</h2>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              {showForm ? '❌ إغلاق' : <><FiPlus size={18} /> إضافة فاتورة جديدة</>}
            </button>
          </div>

          {showForm && <ReceiptForm onReceiptAdded={handleReceiptAdded} />}

          <div className="receipts-list">
            {receipts.length === 0 ? (
              <p className="empty-message">📭 لا توجد فواتير بعد</p>
            ) : (
              receipts.map((receipt, index) => (
                <div key={index} className="receipt-card">
                  <div className="receipt-header">
                    <h3>🕌 {receipt.mosque}</h3>
                    <span className="receipt-date">📅 {new Date(receipt.timestamp).toLocaleString('ar-EG')}</span>
                  </div>
                  
                  <div className="receipt-info">
                    <p><FiMapPin size={16} /> <strong>المحافظة:</strong> {receipt.governorate}</p>
                    <p><strong>📍 المنطقة:</strong> {receipt.zone}</p>
                    <p><strong>📌 القطعة:</strong> {receipt.section}</p>
                  </div>

                  <div className="receipt-worker">
                    <p><FiUser size={16} /> <strong>اسم العامل:</strong> {receipt.workerName}</p>
                    <p><strong>🆔 الرقم المدني:</strong> {receipt.workerNationalId}</p>
                    <p><FiPhone size={16} /> <strong>الهاتف:</strong> {receipt.registrarPhone}</p>
                  </div>

                  {receipt.materials && receipt.materials.length > 0 && (
                    <div className="receipt-materials">
                      <h4>📦 المواد المستلمة:</h4>
                      <table className="materials-simple-table">
                        <thead>
                          <tr>
                            <th>المادة</th>
                            <th>الوحدة</th>
                            <th>المخصصة</th>
                            <th>المستلمة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receipt.materials.map((material, mIndex) => (
                            <tr key={mIndex}>
                              <td>{material.materialName}</td>
                              <td>{material.unit}</td>
                              <td>{material.allocatedQuantity}</td>
                              <td className={material.receivedQuantity > 0 ? 'received-qty' : ''}>{material.receivedQuantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}