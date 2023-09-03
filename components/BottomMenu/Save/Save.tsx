import { useAst, useAstState } from '@/hooks/useAST';
import { useSession } from 'next-auth/react';
import * as S from './Save.atoms';
import { useTranslation } from 'react-i18next';

export const Save = () => {
  const { changed } = useAstState();
  const { save } = useAst(); // TODO: use save file insted
  const { status } = useSession();
  const { t } = useTranslation(['common'], { keyPrefix: 'bottomMenu' });
  if (status !== 'authenticated') return null;

  return (
    <>
      {changed ? (
        <S.Container onClick={() => save()}>
          <S.ImageContainer>
            <S.Image $src="/cloud-off-line.png" />
          </S.ImageContainer>
          <span>{t('saving')}</span>
        </S.Container>
      ) : (
        <S.Container>
          <S.ImageContainer>
            <S.Image $src="/cloud-line.png" />
          </S.ImageContainer>
          <span>{t('saved')}</span>
        </S.Container>
      )}
    </>
  );
};
