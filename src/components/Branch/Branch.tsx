import * as S from "./Branch.atoms";

export const Branch = () => {
  return (
    <S.Container>
      <S.Condition></S.Condition>
      <S.TrueBranch></S.TrueBranch>
      <S.FalseBranch></S.FalseBranch>
    </S.Container>
  );
};
