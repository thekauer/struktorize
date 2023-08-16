'use client';

import { SwitchAst } from '../../../lib/ast';
import { Render } from '../Render/Render';
import * as S from './Switch.atoms';

export const Switch = ({ cases }: SwitchAst) => {
  return (
    <S.Container>
      <Render head={cases} />
    </S.Container>
  );
};
