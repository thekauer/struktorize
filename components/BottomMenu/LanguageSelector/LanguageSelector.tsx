import { useTranslation } from '@/i18n/client';
import * as S from './LanguageSelector.atoms';

export const LanguageSelector = () => {
  const { t, i18n } = useTranslation(['common'], { keyPrefix: 'menu.profile' });

  return i18n.language === 'hu' ? (
    <S.Item onClick={() => i18n.changeLanguage('en')}>Magyar</S.Item>
  ) : (
    <S.Item onClick={() => i18n.changeLanguage('hu')}>English</S.Item>
  );
};
