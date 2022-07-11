import { Ast } from "../../lib/ast";
import { StyleProps } from "../../style/styleProps";
import * as S from "./Signature.atoms";

export interface SignatureAst extends Ast {
  text: string;
}

interface SignatureProps extends StyleProps {
  text?: string;
}

export const Signature = ({ text, ...style }: SignatureProps) => {
  return (
    <>
      <S.Container {...style}>{text}</S.Container>
      <S.Line />
    </>
  );
};
