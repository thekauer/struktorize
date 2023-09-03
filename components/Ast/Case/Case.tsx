'use client';

import { useNode } from '../../../hooks/useAST';
import { CaseAst } from '../../../lib/ast';
import { AbstractText } from '../AbstractText/AbstractText';
import { Render } from '../Render/Render';
import * as S from './Case.atoms';

export const Case = ({ body, text, path }: CaseAst) => {
  const containerProps = useNode(path);

  return (
    <S.Container>
      <S.Condition {...containerProps}>
        <S.True> </S.True>
        <S.Text>
          <AbstractText hovered={containerProps.$hovered}>{text}</AbstractText>
        </S.Text>
      </S.Condition>
      <S.Body>
        <Render head={body} />
      </S.Body>
    </S.Container>
  );
};
