import { useSelected } from "../../../hooks/useAST";
import { BranchAst } from "../../../lib/ast";
import { Latex } from "../Latex/Latex";
import { Render } from "../Render/Render";
import * as S from "./Branch.atoms";

export const Branch = ({ text, ifBranch, elseBranch, path }: BranchAst) => {
  const selected = useSelected(path);

  return (
    <>
      <S.Condition selected={selected}>
        <S.True>t</S.True>
        <S.False>f</S.False>
        <Latex>{text}</Latex>
      </S.Condition>
      <S.Container>
        <S.TrueBranch>
          <Render head={ifBranch} />
        </S.TrueBranch>
        <S.FalseBranch>
          <Render head={elseBranch} />
        </S.FalseBranch>
      </S.Container>
    </>
  );
};
