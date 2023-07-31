'use client';

import { useNode } from '../../../hooks/useAST';
import { BranchAst } from '../../../lib/ast';
import { AbstractText } from '../AbstractText/AbstractText';
import { Render } from '../Render/Render';
import * as S from './Branch.atoms';

export const Branch = ({ text, ifBranch, elseBranch, path }: BranchAst) => {
  const containerProps = useNode(path);

  return (
    <>
      <S.Condition {...containerProps}>
        <S.True>t</S.True>
        <S.False>f</S.False>
        <AbstractText>{text}</AbstractText>
      </S.Condition>
      <S.Container>
        <S.TrueBranch>
          <Render head={ifBranch} />
        </S.TrueBranch>
        <S.FalseBranch>
          <Render head={elseBranch} />
        </S.FalseBranch>
      </S.Container>
    </>
  );
};
