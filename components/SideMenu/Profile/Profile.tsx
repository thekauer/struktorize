'use client';

import * as SM from '../SideMenu.atoms';
import * as S from './Profile.atoms';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from '@/i18n/client';

export const Profile = () => {
  const { data: session } = useSession();
  const { t } = useTranslation(['common'], { keyPrefix: 'menu.profile' });
  const email = session?.user?.email;

  return (
    <SM.Container>
      <SM.Title>{t('title')}</SM.Title>
      <S.Container>
        <S.Profile src={session!.user?.image!} />
        <SM.Span>{session!.user?.name}</SM.Span>
        <SM.Span>{email}</SM.Span>
        <SM.Button onClick={() => signOut()}>{t('signOut')}</SM.Button>
      </S.Container>
    </SM.Container>
  );
};
