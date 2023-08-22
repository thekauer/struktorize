'use client';

import { useNode } from '../../../hooks/useAST';
import { SignatureAst } from '../../../lib/ast';
import { AbstractText } from '../AbstractText/AbstractText';
import * as S from './Signature.atoms';

export const Signature = ({ text, path }: SignatureAst) => {
  const containerProps = useNode(path);

  return (
    <>
      <S.Container {...containerProps}>
        <AbstractText hovered={containerProps.$hovered}>{text}</AbstractText>
      </S.Container>
      <S.Line />
    </>
  );
};
