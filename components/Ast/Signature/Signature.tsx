import { useSelected } from "../../../hooks/useAST";
import { SignatureAst } from "../../../lib/ast";
import { Latex } from "../Latex/Latex";
import * as S from "./Signature.atoms";

export const Signature = ({ text, path }: SignatureAst) => {
  const selected = useSelected(path);

  return (
    <>
      <S.Container selected={selected}>
        <Latex>{text}</Latex>
      </S.Container>
      <S.Line />
    </>
  );
};
