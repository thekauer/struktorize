import { Ast } from "../../lib/ast";
import { Render } from "../Render/Render";
import * as S from "./Branch.atoms";

export interface BranchAst extends Ast {
  condition?: string;
  ifBranch?: Ast[];
  elseBranch?: Ast[];
}

export const Branch = ({ condition, ifBranch, elseBranch }: BranchAst) => {
  //TODO: RENDER inside all of the components
  //TODO: get style from useAst hook and apply to the correct styled component
  return (
    <>
      <S.Condition>{condition}</S.Condition>
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
