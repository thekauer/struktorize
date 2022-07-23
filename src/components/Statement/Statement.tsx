import { useAST } from "../../hooks/useAST";
import { Ast } from "../../lib/ast";
import * as S from "./Statement.atoms";
import { InlineMath } from 'react-katex';

export interface StatementAst extends Ast {
  text: string;
}

export const Statement = ({ text, path }: StatementAst) => {
  const { isSelected } = useAST();
  const selected = isSelected(path);
  return <S.Container selected={selected}><InlineMath>{text}</InlineMath></S.Container>;
};
