import { codeCompletionVisibleAtom } from "@/components/Editor/CodeCompletion/useCodeCompletion";
import { useSetAtom } from "jotai";
import { useTranslation } from "next-i18next";
import { ChangeEventHandler } from "react";
import { useScreenshot } from "../../../hooks/useScreenshot";
import { useTheme } from "../../../hooks/useTheme";
import * as SM from "../SideMenu.atoms";

export const Export = () => {
  const { downloadScreenshot, screenshotToClipboard } = useScreenshot();
  const { astTheme, setAstTheme, setShowScope } = useTheme();
  const { t } = useTranslation(["common"], { keyPrefix: "menu.export" });
  const setCCVisible = useSetAtom(codeCompletionVisibleAtom);

  const prepareScreenshot = async (
    cb: (root: HTMLElement) => Promise<void>
  ) => {
    const root = document.getElementById("root-container")
      ?.firstChild as HTMLElement;
    if (!root) return;

    setCCVisible(false);
    setShowScope(false);
    await cb(root);
    setShowScope(true);
  };

  const exportClick = () => {
    prepareScreenshot(downloadScreenshot);
  };

  const copyToClipboardClick = () => {
    prepareScreenshot(screenshotToClipboard);
  };

  const onThemeChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const theme = e.target.value;
    setAstTheme(theme);
  };

  return (
    <SM.Container>
      <SM.Title>{t("title")}</SM.Title>
      <SM.Label htmlFor="themes">{t("theme.title")}</SM.Label>
      <SM.Select id="themes" onChange={onThemeChange} value={astTheme}>
        <SM.Option value="dark">{t("theme.themes.dark")}</SM.Option>
        <SM.Option value="light">{t("theme.themes.light")}</SM.Option>
        <SM.Option value="black-on-white">
          {t("theme.themes.blackOnWhite")}
        </SM.Option>
        <SM.Option value="white-on-black">
          {t("theme.themes.whiteOnBlack")}
        </SM.Option>
      </SM.Select>
      <SM.Button onClick={exportClick}>{t("download")}</SM.Button>
      <SM.Button onClick={copyToClipboardClick}>
        {t("copyToClipboard")}
      </SM.Button>
    </SM.Container>
  );
};
