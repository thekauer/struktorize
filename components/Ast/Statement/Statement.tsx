'use client';

import { useNode } from '../../../hooks/useAST';
import { StatementAst } from '../../../lib/ast';
import { AbstractText } from '../AbstractText/AbstractText';
import * as S from './Statement.atoms';

export const Statement = ({ text, path }: StatementAst) => {
  const containerProps = useNode(path);

  return (
    <S.Container {...containerProps}>
      <AbstractText>{text}</AbstractText>
    </S.Container>
  );
};
