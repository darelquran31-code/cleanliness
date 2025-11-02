import { useState, useEffect } from 'react';
import { FiSave, FiMapPin, FiPhone, FiUser, FiHash } from 'react-icons/fi';
import { api } from '../services/api';
import '../styles/ReceiptForm.css';

export default function ReceiptForm({ onReceiptAdded }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({
    governorate: '',
    zone: '',
    section: '',
    mosqueName: '',
    registrarPhone: '',
    workerName: '',
    workerNationalId: '',
    secondWorkerName: '',
    secondWorkerNationalId: '',
    month: '',
    year: '',
  });
  const [availableZones, setAvailableZones] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [governoratesZones, setGovernoratesZones] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allocationsData = await api.getAllocations(user.mosque);
      setAllocations(allocationsData);

      // Initialize materials array من البيانات الموحدة
      const initialMaterials = allocationsData.map(material => ({
        materialId: material.id,
        allocatedQuantity: material.quantity,
        receivedQuantity: 0,
      }));
      setMaterials(initialMaterials);

      // تحميل المحافظات والمناطق من قاعدة البيانات
      const govZones = await api.getGovernoratesZones();
      setGovernoratesZones(govZones);
    } catch (err) {
      setError('خطأ في تحميل البيانات');
      console.error('خطأ في التحميل:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'governorate') {
      // عند تغيير المحافظة، تحديث المناطق المتاحة من قاعدة البيانات
      setAvailableZones(governoratesZones[value] || []);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        zone: '', // إعادة تعيين المنطقة
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMaterialChange = (index, value) => {
    const newMaterials = [...materials];
    newMaterials[index].receivedQuantity = parseFloat(value) || 0;
    setMaterials(newMaterials);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.addReceipt(
        user.mosque,
        formData.governorate,
        formData.zone,
        formData.section,
        formData.mosqueName,
        formData.registrarPhone,
        formData.workerName,
        formData.workerNationalId,
        formData.secondWorkerName,
        formData.secondWorkerNationalId,
        materials,
        formData.month,
        formData.year
      );

      if (response.success) {
        setFormData({ governorate: '', zone: '', section: '', mosqueName: '', registrarPhone: '', workerName: '', workerNationalId: '', secondWorkerName: '', secondWorkerNationalId: '', month: '', year: '' });
        setMaterials(materials.map(m => ({ ...m, receivedQuantity: 0 })));
        onReceiptAdded();
      } else {
        setError(response.error || 'فشل في إضافة الفاتورة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="receipt-form">
      <h3>📝 فاتورة استلام جديدة</h3>
      
      {error && <div className="error-message">⚠️ {error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>🏛️ المحافظة:</label>
            <select
              name="governorate"
              value={formData.governorate}
              onChange={handleInputChange}
              required
            >
              <option value="">-- اختر المحافظة --</option>
              {Object.keys(governoratesZones).map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label><FiMapPin size={16} /> المنطقة:</label>
            <select
              name="zone"
              value={formData.zone}
              onChange={handleInputChange}
              disabled={!formData.governorate}
              required
            >
              <option value="">-- اختر المنطقة --</option>
              {availableZones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
            {!formData.governorate && <small className="help-text">📌 اختر محافظة أولاً</small>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>📍 القطعة:</label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>🏢 اسم المسجد:</label>
            <input
              type="text"
              name="mosqueName"
              value={formData.mosqueName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><FiPhone size={16} /> رقم الهاتف:</label>
            <input
              type="tel"
              name="registrarPhone"
              value={formData.registrarPhone}
              onChange={handleInputChange}
              placeholder="00965 9 xxxx xxxx"
              required
            />
          </div>

          <div className="form-group">
            <label><FiUser size={16} /> اسم العامل الأول:</label>
            <input
              type="text"
              name="workerName"
              value={formData.workerName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><FiHash size={16} /> الرقم المدني للعامل الأول:</label>
            <input
              type="text"
              name="workerNationalId"
              value={formData.workerNationalId}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label><FiUser size={16} /> اسم العامل الثاني:</label>
            <input
              type="text"
              name="secondWorkerName"
              value={formData.secondWorkerName}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><FiHash size={16} /> الرقم المدني للعامل الثاني:</label>
            <input
              type="text"
              name="secondWorkerNationalId"
              value={formData.secondWorkerNationalId}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>📅 الشهر:</label>
            <select
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              required
            >
              <option value="">-- اختر الشهر --</option>
              <option value="1">يناير</option>
              <option value="2">فبراير</option>
              <option value="3">مارس</option>
              <option value="4">أبريل</option>
              <option value="5">مايو</option>
              <option value="6">يونيو</option>
              <option value="7">يوليو</option>
              <option value="8">أغسطس</option>
              <option value="9">سبتمبر</option>
              <option value="10">أكتوبر</option>
              <option value="11">نوفمبر</option>
              <option value="12">ديسمبر</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>📆 السنة:</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="2024"
              min="2020"
              max="2030"
              required
            />
          </div>
        </div>



        <div className="materials-section">
          <h4>🧹 مواد النظافة:</h4>
          <table className="materials-table">
            <thead>
              <tr>
                <th>📦 المادة</th>
                <th>⚖️ الوحدة</th>
                <th>📊 المخصصة</th>
                <th>✅ المستلمة</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((allocation, index) => (
                <tr key={index}>
                  <td>{allocation.name}</td>
                  <td>{allocation.unit}</td>
                  <td>{allocation.quantity}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={materials[index]?.receivedQuantity || 0}
                      onChange={(e) => handleMaterialChange(index, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <>⏳ جاري الحفظ...</>
          ) : (
            <><FiSave size={18} /> حفظ الفاتورة</>
          )}
        </button>
      </form>
    </div>
  );
}