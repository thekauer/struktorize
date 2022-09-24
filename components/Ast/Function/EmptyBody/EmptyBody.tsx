import { useTranslation } from "next-i18next";
import * as S from "./EmptyBody.atoms";

export const EmptyBody = () => {
  const { t } = useTranslation(["common"], { keyPrefix: "main.emptyBody" });
  const getStarted = t("getStarted", { returnObjects: true });
  const openCheatSheet = t("openCheatSheet", { returnObjects: true });

  return (
    <S.Container>
      <span>
        {getStarted[0]} <S.Kbd>Enter</S.Kbd> {getStarted[1]} <S.Mark>if</S.Mark>{" "}
        {getStarted[2]} <S.Mark>loop</S.Mark> {getStarted[3]}.
      </span>
      <br />
      <br />
      <span>
        {openCheatSheet[0]} <S.Kbd>Ctrl</S.Kbd> + <S.Kbd>i</S.Kbd>{" "}
        {openCheatSheet[1]} <S.Blue>{openCheatSheet[2]}</S.Blue>.
      </span>
    </S.Container>
  );
};
