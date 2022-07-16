import { useAST } from "../../hooks/useAST";
import { Ast } from "../../lib/ast";
import { Render } from "../Render/Render";
import * as S from "./Branch.atoms";

export interface BranchAst extends Ast {
  condition?: string;
  ifBranch?: Ast[];
  elseBranch?: Ast[];
}

export const Branch = ({
  condition,
  ifBranch,
  elseBranch,
  path,
}: BranchAst) => {
  const { isSelected } = useAST();
  const selected = isSelected(path);

  return (
    <>
      <S.Condition selected={selected}>{condition}</S.Condition>
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
