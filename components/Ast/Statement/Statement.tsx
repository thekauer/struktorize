import { useNode } from "../../../hooks/useAST";
import { StatementAst } from "../../../lib/ast";
import { Latex } from "../Latex/Latex";
import * as S from "./Statement.atoms";

export const Statement = ({ text, path }: StatementAst) => {
  const containerProps = useNode(path);

  return (
    <S.Container {...containerProps}>
      <Latex>{text}</Latex>
    </S.Container>
  );
};
