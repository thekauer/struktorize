import { useAST } from "../../hooks/useAST";
import { Ast } from "../../lib/ast";
import * as S from "./Signature.atoms";
import { InlineMath } from 'react-katex';

export interface SignatureAst extends Ast {
  text: string;
}

export const Signature = ({ text, path }: SignatureAst) => {
  const { isSelected } = useAST();
  const selected = isSelected(path);

  return (
    <>
      <S.Container selected={selected}><InlineMath>{text}</InlineMath></S.Container>
      <S.Line />
    </>
  );
};
