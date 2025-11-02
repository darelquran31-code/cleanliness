import { useState, useEffect } from 'react';
import { api } from '../services/api';
import '../styles/Management.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    nationalId: '',
    name: '',
    mosque: '',
    role: 'User',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError('خطأ في جلب المستخدمين');
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
      const response = await api.addUser(
        formData.nationalId,
        formData.name,
        formData.mosque,
        formData.role
      );

      if (response.success) {
        setSuccess('تم إضافة المستخدم بنجاح');
        setFormData({ nationalId: '', name: '', mosque: '', role: 'User' });
        loadUsers();
      } else {
        setError(response.error || 'فشل في إضافة المستخدم');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management-container">
      <h2>👥 إدارة المستخدمين</h2>

      <div className="management-form">
        <h3>➕ إضافة مستخدم جديد</h3>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>🆔 الرقم المدني:</label>
            <input
              type="text"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleInputChange}
              placeholder="أدخل الرقم المدني"
              required
            />
          </div>

          <div className="form-group">
            <label>👤 الاسم:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="أدخل الاسم"
              required
            />
          </div>

          <div className="form-group">
            <label>🕌 المسجد:</label>
            <input
              type="text"
              name="mosque"
              value={formData.mosque}
              onChange={handleInputChange}
              placeholder="أدخل اسم المسجد"
              required
            />
          </div>

          <div className="form-group">
            <label>🎯 الدور:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="User">مستخدم عادي</option>
              <option value="Admin">مدير</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'جاري الإضافة...' : 'إضافة مستخدم'}
          </button>
        </form>
      </div>

      <div className="users-list">
        <h3>📋 قائمة المستخدمين</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>🆔 الرقم المدني</th>
              <th>👤 الاسم</th>
              <th>🕌 المسجد</th>
              <th>🎯 الدور</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.nationalId}</td>
                <td>{user.name}</td>
                <td>{user.mosque}</td>
                <td>
                  <span className={`role-badge ${user.role === 'Admin' ? 'admin' : 'user'}`}>
                    {user.role === 'Admin' ? 'مدير' : 'مستخدم'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}