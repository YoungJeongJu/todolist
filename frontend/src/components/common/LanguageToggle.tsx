import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

export default function LanguageToggle() {
  const { t } = useTranslation();
  const currentLng = i18n.language;

  const toggle = () => {
    const next = currentLng === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(next);
    localStorage.setItem('i18nextLng', next);
  };

  return (
    <button
      type="button"
      className="btn-text"
      onClick={toggle}
      style={{ fontSize: 'var(--text-sm)' }}
    >
      {currentLng === 'ko' ? t('lang.en') : t('lang.ko')}
    </button>
  );
}
