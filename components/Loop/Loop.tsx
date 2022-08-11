import { useSelected } from "../../hooks/useAST";
import { LoopAst } from "../../lib/ast";
import { Latex } from "../Latex/Latex";
import { Render } from "../Render/Render";
import * as S from "./Loop.atoms";

export const Loop = ({ condition, body, path }: LoopAst) => {
  const selected = useSelected(path);

  return (
    <S.Container>
      <S.Loop selected={selected}>
        <Latex>{condition}</Latex>
      </S.Loop>
      <S.Left />
      <S.Right>
        <Render head={body} />
      </S.Right>
    </S.Container>
  );
};
