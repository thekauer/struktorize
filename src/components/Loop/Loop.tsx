import { useAST } from "../../hooks/useAST";
import { Ast } from "../../lib/ast";
import { Render } from "../Render/Render";
import * as S from "./Loop.atoms";
import { InlineMath } from 'react-katex';


export interface LoopAst extends Ast {
  condition?: string;
  body: Ast[];
}

export const Loop = ({ condition, body, path }: LoopAst) => {
  const { isSelected } = useAST();
  const selected = isSelected(path);

  return (
    <S.Container>
      <S.Loop selected={selected}><InlineMath>{condition}</InlineMath></S.Loop>
      <S.Left />
      <S.Right>
        <Render head={body} />
      </S.Right>
    </S.Container>
  );
};
