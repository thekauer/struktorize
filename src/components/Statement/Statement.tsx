import { useAST } from "../../hooks/useAST";
import { Ast } from "../../lib/ast";
import * as S from "./Statement.atoms";

export interface StatementAst extends Ast {
  text: string;
}

export const Statement = ({ text, path }: StatementAst) => {
  const { isSelected } = useAST();
  const selected = isSelected(path);
  return <S.Container selected={selected}>{text}</S.Container>;
};
