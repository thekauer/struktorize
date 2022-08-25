import * as S from "./EmptyBody.atoms";

export const EmptyBody = () => (
  <S.Container>
    <span>
      Press <S.Kbd>Enter</S.Kbd> or type <S.Mark>if</S.Mark> or{" "}
      <S.Mark>loop</S.Mark> to get started.
    </span>
    <br />
    <br />
    <span>
      Press <S.Kbd>Ctrl</S.Kbd> + <S.Kbd>i</S.Kbd> to open the{" "}
      <S.Blue>cheat sheet</S.Blue>.
    </span>
  </S.Container>
);
