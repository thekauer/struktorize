import { useAst, useAstState } from '@/hooks/useAST';
import { useSession } from 'next-auth/react';
import * as S from './Save.atoms';
import { useTranslation } from 'react-i18next';

export const Save = () => {
  const { changed } = useAstState();
  const { save } = useAst();
  const { status } = useSession();
  const { t } = useTranslation(['common'], { keyPrefix: 'bottomMenu' });
  if (status !== 'authenticated') return null;

  return (
    <S.Container>
      {changed ? (
        <>
          <S.ImageContainer>
            <S.Image $src="/cloud-off-line.png" onClick={() => save()} />
          </S.ImageContainer>
          <span>{t('saving')}</span>
        </>
      ) : (
        <>
          <S.ImageContainer>
            <S.Image $src="/cloud-line.png" />
          </S.ImageContainer>
          <span>{t('saved')}</span>
        </>
      )}
    </S.Container>
  );
};
