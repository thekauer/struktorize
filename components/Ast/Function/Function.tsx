import { FunctionAst } from "../../../lib/ast";
import { Render } from "../Render/Render";
import * as S from "./Function.atoms";

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
