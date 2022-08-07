import { useAST } from "../../hooks/useAST";
import { Ast } from "../../lib/ast";
import { Latex } from "../Latex/Latex";
import * as S from "./Signature.atoms";

export interface SignatureAst extends Ast {
  text: string;
}

export const Signature = ({ text, path }: SignatureAst) => {
  const { isSelected } = useAST();
  const selected = isSelected(path);

  return (
    <>
      <S.Container selected={selected}>
        <Latex>{text}</Latex>
      </S.Container>
      <S.Line />
    </>
  );
};
