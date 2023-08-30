import { useAst, useAstState } from '@/hooks/useAST';
import { useSession } from 'next-auth/react';
import * as S from './Save.atoms';

export const Save = () => {
  const { changed } = useAstState();
  const { save } = useAst();
  const { status } = useSession();
  if (status !== 'authenticated') return null;

  return (
    <S.Container>
      {changed ? (
        <>
          <S.ImageContainer>
            <S.Image $src="/cloud-off-line.png" onClick={() => save()} />
          </S.ImageContainer>
          <span>Saving...</span>
        </>
      ) : (
        <>
          <S.ImageContainer>
            <S.Image $src="/cloud-line.png" />
          </S.ImageContainer>
          <span>Saved</span>
        </>
      )}
    </S.Container>
  );
};
