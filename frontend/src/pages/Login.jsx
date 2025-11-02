import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../styles/Login.css';

export default function Login({ setUser }) {
  const { t } = useTranslation();
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(nationalId, password);

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('role', response.user.role);
        setUser(response.user);
      } else {
        setError(response.error || t('auth.loginError'));
      }
    } catch (err) {
      setError(t('auth.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <LanguageSwitcher />
        </div>
        <img src="https://drive.google.com/thumbnail?id=17Vs_ZMZ2xjHMDfzM442bIyftEsRhdJlB&sz=s4000" alt="شعار" className="logo" />
        <h1>{t('app.title')}</h1>
        <h2>{t('auth.login')}</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>{t('auth.nationalId')}:</label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder={t('auth.enterNationalId')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('auth.password')}:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.enterPassword')}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? t('app.loading') : t('auth.loginButton')}
          </button>
        </form>
      </div>
    </div>
  );
}