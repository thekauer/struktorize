'use client';

import { useNode } from '../../../hooks/useAST';
import { LoopAst } from '../../../lib/ast';
import { AbstractText } from '../AbstractText/AbstractText';
import { Render } from '../Render/Render';
import * as S from './Loop.atoms';

export const Loop = ({ text, body, path }: LoopAst) => {
  const containerProps = useNode(path);

  return (
    <S.Container>
      <S.Loop {...containerProps}>
        <S.Text>
          <AbstractText hovered={containerProps.$hovered}>{text}</AbstractText>
        </S.Text>
      </S.Loop>
      <S.Left />
      <S.Right>
        <Render head={body} />
      </S.Right>
    </S.Container>
  );
};
