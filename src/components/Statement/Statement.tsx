import { Ast } from "../../lib/ast";
import { StyleProps } from "../../style/styleProps";
import * as S from "./Statement.atoms";

export interface StatementAst extends Ast {
  text: string;
}

interface StatementProps extends StyleProps {
  text?: string;
}

export const Statement = ({ text, ...style }: StatementProps) => {
  return <S.Container {...style}>{text}</S.Container>;
};
