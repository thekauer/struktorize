import { useTranslation } from "next-i18next";
import * as S from "./EmptyBody.atoms";
const GET_STARTED_FALLBACK = [
  "Press",
  "or type",
  "or",
  "to get started"
];

const OPEN_CHEATSHEET_FALLBACK = [
  "Press",
  "to open the",
  "cheat sheet"
]

export const EmptyBody = () => {
  const { t, i18n } = useTranslation(["common"], { keyPrefix: "main.emptyBody" });
  const shouldFallback = !i18n.language;

  const getStarted = shouldFallback ? GET_STARTED_FALLBACK : t("getStarted", { returnObjects: true });
  const openCheatSheet = shouldFallback ? OPEN_CHEATSHEET_FALLBACK : t("openCheatSheet", { returnObjects: true });

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
