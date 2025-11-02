import { useState, useEffect } from 'react';
import { api } from '../services/api';
import UserManagement from '../components/UserManagement';
import MaterialManagement from '../components/MaterialManagement';
import Reports from '../components/Reports';
import Search from '../components/Search';
import '../styles/AdminDashboard.css';

export default function AdminDashboard({ setUser }) {
  const [activeTab, setActiveTab] = useState('users');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <img src="https://drive.google.com/thumbnail?id=17Vs_ZMZ2xjHMDfzM442bIyftEsRhdJlB&sz=s4000" alt="شعار" className="logo" />
        <h1>لوحة الإدارة</h1>
        <div className="header-info">
          <span>👨‍💼 المسؤول: {user.name}</span>
          <button onClick={handleLogout} className="logout-btn">تسجيل الخروج</button>
        </div>
      </header>

      <div className="admin-nav">
        <button
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 المستخدمين
        </button>
        <button
          className={`nav-btn ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          🧹 مواد النظافة
        </button>
        <button
          className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📊 التقارير
        </button>
        <button
          className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 البحث
        </button>
      </div>

      <main className="admin-content">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'materials' && <MaterialManagement />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'search' && <Search />}
      </main>
    </div>
  );
}