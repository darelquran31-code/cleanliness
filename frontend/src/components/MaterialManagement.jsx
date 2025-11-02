import { useState, useEffect } from 'react';
import { api } from '../services/api';
import '../styles/Management.css';

export default function MaterialManagement() {
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    quantity: '',
  });
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    unit: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await api.getMaterials();
      setMaterials(data);
    } catch (err) {
      setError('خطأ في جلب المواد');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.addMaterial(
        formData.name,
        formData.unit,
        formData.quantity
      );

      if (response.success) {
        setSuccess('تم إضافة المادة بنجاح');
        setFormData({ name: '', unit: '', quantity: '' });
        loadMaterials();
      } else {
        setError(response.error || 'فشل في إضافة المادة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setEditFormData({
      name: material.name,
      unit: material.unit,
      quantity: material.quantity,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.updateMaterial(
        editingMaterial.id,
        editFormData.name,
        editFormData.unit,
        editFormData.quantity
      );

      if (response.success) {
        setSuccess('تم تحديث المادة بنجاح');
        setEditingMaterial(null);
        setEditFormData({ name: '', unit: '', quantity: '' });
        loadMaterials();
      } else {
        setError(response.error || 'فشل في تحديث المادة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المادة؟')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.deleteMaterial(id);

      if (response.success) {
        setSuccess('تم حذف المادة بنجاح');
        loadMaterials();
      } else {
        setError(response.error || 'فشل في حذف المادة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="management-container">
      <h2>🧹 إدارة مواد النظافة</h2>

      <div className="management-form">
        <h3>➕ إضافة مادة جديدة</h3>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📝 اسم المادة:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="أدخل اسم المادة"
              required
            />
          </div>

          <div className="form-group">
            <label>📦 الوحدة:</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              placeholder="أدخل الوحدة (مثل: عبوة، كيس، لتر)"
              required
            />
          </div>

          <div className="form-group">
            <label>📊 الكمية لكل مسجد:</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="أدخل الكمية الموحدة"
              min="0"
              step="0.1"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'جاري الإضافة...' : 'إضافة مادة'}
          </button>
        </form>
      </div>

      {editingMaterial && (
        <div className="management-form">
          <h3>✏️ تعديل المادة</h3>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>📝 اسم المادة:</label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                placeholder="أدخل اسم المادة"
                required
              />
            </div>

            <div className="form-group">
              <label>📦 الوحدة:</label>
              <input
                type="text"
                name="unit"
                value={editFormData.unit}
                onChange={handleEditInputChange}
                placeholder="أدخل الوحدة"
                required
              />
            </div>

            <div className="form-group">
              <label>📊 الكمية لكل مسجد:</label>
              <input
                type="number"
                name="quantity"
                value={editFormData.quantity}
                onChange={handleEditInputChange}
                placeholder="أدخل الكمية"
                min="0"
                step="0.1"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'جاري التحديث...' : 'تحديث المادة'}
            </button>
            <button type="button" onClick={() => setEditingMaterial(null)} className="btn-secondary">
              إلغاء
            </button>
          </form>
        </div>
      )}

      <div className="materials-list">
        <table className="data-table">
          <caption>قائمة المواد ({materials.length})</caption>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم المادة</th>
              <th>الوحدة</th>
              <th>الكمية لكل مسجد</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, index) => (
              <tr key={index}>
                <td>{material.id}</td>
                <td>{material.name}</td>
                <td>{material.unit}</td>
                <td>{material.quantity}</td>
                <td>
                  <button onClick={() => handleEdit(material)} className="btn-edit">
                    ✏️ تعديل
                  </button>
                  <button onClick={() => handleDelete(material.id)} className="btn-delete">
                    🗑️ حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}