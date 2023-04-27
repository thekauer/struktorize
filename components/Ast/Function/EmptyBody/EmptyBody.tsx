import { useTranslation } from "next-i18next";
import * as S from "./EmptyBody.atoms";

const OPEN_CHEATSHEET_FALLBACK = ["Press", "to open the", "cheat sheet"];

export const EmptyBody = () => {
  const { t, i18n } = useTranslation(["common"], {
    keyPrefix: "main.emptyBody",
  });
  const shouldFallback = !i18n.language;

  const openCheatSheet = shouldFallback
    ? OPEN_CHEATSHEET_FALLBACK
    : t("openCheatSheet", { returnObjects: true });

  return (
    <S.Container>
      <span>
        {openCheatSheet[0]} <S.Kbd>Ctrl</S.Kbd> + <S.Kbd>i</S.Kbd>{" "}
        {openCheatSheet[1]} <S.Blue>{openCheatSheet[2]}</S.Blue>.
      </span>
    </S.Container>
  );
};
