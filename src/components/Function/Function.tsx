import { Ast } from "../../lib/ast";
import { Render } from "../Render/Render";
import { SignatureAst } from "../Signature/Signature";
import * as S from "./Function.atoms";

export interface FunctionAst extends Ast {
  signature: SignatureAst;
  body: Ast[];
}

export const Function = ({ signature, body }: FunctionAst) => {
  return (
    <S.Container>
      <>
        <Render head={signature} />
        <Render head={body} />
      </>
    </S.Container>
  );
};
