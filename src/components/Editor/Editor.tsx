import { Function } from "../Function/Function";
import { Signature } from "../Signature/Signature";
import { Statement } from "../Statement/Statement";
import * as S from "./Editor.atoms";

export const Editor = () => {
  return (
    <S.Container>
      <Function signature={<Signature />} body={[<Statement />]} />
    </S.Container>
  );
};
