import { Ast } from "../../lib/ast";
import { Render } from "../Render/Render";
import * as S from "./Loop.atoms";

export interface LoopAst extends Ast {
  condition?: string;
  body: Ast[];
}

export const Loop = ({ condition, body }: LoopAst) => {
  return (
    <S.Container>
      <S.Loop>{condition}</S.Loop>
      <S.Left />
      <S.Right>
        <Render head={body} />
      </S.Right>
    </S.Container>
  );
};
