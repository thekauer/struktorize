import { ReactNode } from "react";
import { Ast } from "../../lib/ast";
import { SignatureAst } from "../Signature/Signature";
import * as S from "./Function.atoms";

export interface FunctionAst extends Ast {
  signature: SignatureAst;
  body: Ast[];
}

interface FunctionProps {
  signature: ReactNode;
  body: ReactNode;
}

export const Function = ({ signature, body }: FunctionProps) => {
  return (
    <S.Container>
      {signature}
      {body}
    </S.Container>
  );
};
