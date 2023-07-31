'use client';

import * as SM from '../SideMenu.atoms';
import { useSession, signIn } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/i18n/client';

const Explorer = dynamic(
  () => import('./Explorer/Explorer').then((mod) => mod.Explorer as any),
  { ssr: false },
);

export const Files = () => {
  const { status } = useSession();
  const { t } = useTranslation(['common'], { keyPrefix: 'menu.files' });

  return (
    <SM.Container>
      <SM.Title>{t('title')}</SM.Title>

      {status === 'unauthenticated' && (
        <>
          <SM.Span>{t('signInToSaveYourStructograms')}</SM.Span>
          <SM.Button onClick={() => signIn('google')}>Google</SM.Button>
          <SM.Button onClick={() => signIn('github')}>Github</SM.Button>
        </>
      )}
      {status === 'authenticated' && <Explorer />}
    </SM.Container>
  );
};
