'use client';

import * as SM from '../SideMenu.atoms';
import * as S from './Profile.atoms';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from '@/i18n/client';
import { ChangeEvent, useState } from 'react';

export const Profile = () => {
  const { data: session } = useSession();
  const { t, i18n } = useTranslation(['common'], { keyPrefix: 'menu.profile' });
  const [language, setLanguage] = useState(i18n.language);
  const onLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setLanguage(value);
    i18n.changeLanguage(value);
  };
  const email = session?.user?.email;

  return (
    <SM.Container>
      <SM.Title>{t('title')}</SM.Title>
      <S.Container>
        <S.Profile src={session!.user?.image!} />
        <SM.Span>{session!.user?.name}</SM.Span>
        <SM.Span>{email}</SM.Span>
        <SM.Label htmlFor="language">
          {t('language')}{' '}
          <SM.Select value={language} onChange={onLanguageChange}>
            <SM.Option value="en">English</SM.Option>
            <SM.Option value="hu">Magyar</SM.Option>
          </SM.Select>
        </SM.Label>
        <SM.Button onClick={() => signOut()}>{t('signOut')}</SM.Button>
      </S.Container>
    </SM.Container>
  );
};
