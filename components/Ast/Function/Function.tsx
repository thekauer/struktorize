import { FunctionAst } from "../../../lib/ast";
import { Render } from "../Render/Render";
import { EmptyBody } from "./EmptyBody/EmptyBody";
import * as S from "./Function.atoms";

export const Function = ({ signature, body }: FunctionAst) => {
  return (
    <S.Container>
      <>
        <Render head={signature} />
        <Render head={body} />
        {body.length === 0 && <EmptyBody />}
      </>
    </S.Container>
  );
};
