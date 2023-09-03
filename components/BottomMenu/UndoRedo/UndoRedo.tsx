import { useAst } from '@/hooks/useAST';
import * as S from './UndoRedo.atoms';

export const UndoRedo = () => {
  const { undo, redo } = useAst();

  return (
    <S.Container>
      <S.ImageContainer>
        <S.Image $src="/undo2.png" onClick={() => undo()} />
      </S.ImageContainer>
      <S.ImageContainer>
        <S.Image $src="/redo2.png" onClick={() => redo()} />
      </S.ImageContainer>
    </S.Container>
  );
};
