import { useSelected } from "../../hooks/useAST";
import { BranchAst } from "../../lib/ast";
import { Latex } from "../Latex/Latex";
import { Render } from "../Render/Render";
import * as S from "./Branch.atoms";

export const Branch = ({
  condition,
  ifBranch,
  elseBranch,
  path,
}: BranchAst) => {
  const selected = useSelected(path);

  return (
    <>
      <S.Condition selected={selected}>
        <Latex>{condition}</Latex>
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
