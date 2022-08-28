import { useNode } from "../../../hooks/useAST";
import { SignatureAst } from "../../../lib/ast";
import { Latex } from "../Latex/Latex";
import * as S from "./Signature.atoms";

export const Signature = ({ text, path }: SignatureAst) => {
  const containerProps = useNode(path);

  return (
    <>
      <S.Container {...containerProps}>
        <Latex>{text}</Latex>
      </S.Container>
      <S.Line />
    </>
  );
};
