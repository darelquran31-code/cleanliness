import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loader">جاري التحميل...</div>;
  }

  if (!user) {
    return <Login setUser={setUser} />;
  }

  // Check if user is admin based on role
  const isAdmin = user.role === 'Admin';

  return (
    <AuthProvider>
      {isAdmin ? (
        <AdminDashboard setUser={setUser} />
      ) : (
        <Dashboard setUser={setUser} />
      )}
    </AuthProvider>
  );
}

export default App;