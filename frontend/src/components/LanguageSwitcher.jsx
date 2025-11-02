import { useTranslation } from 'react-i18next';
import '../styles/LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${i18n.language === 'ar' ? 'active' : ''}`}
        onClick={() => changeLanguage('ar')}
      >
        العربية
      </button>
      <button
        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
      >
        English
      </button>
    </div>
  );
}