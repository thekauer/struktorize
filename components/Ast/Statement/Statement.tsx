import { useSelected } from "../../../hooks/useAST";
import { StatementAst } from "../../../lib/ast";
import { Latex } from "../Latex/Latex";
import * as S from "./Statement.atoms";

export const Statement = ({ text, path }: StatementAst) => {
  const selected = useSelected(path);
  return (
    <S.Container selected={selected}>
      <Latex>{text}</Latex>
    </S.Container>
  );
};
