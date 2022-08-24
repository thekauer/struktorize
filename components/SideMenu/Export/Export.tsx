import { ChangeEventHandler } from "react";
import { useScreenshot } from "../../../hooks/useScreenshot";
import { useTheme } from "../../../hooks/useTheme";
import * as SM from "../SideMenu.atoms";

export const Export = () => {
  const { downloadScreenshot, screenshotToClipboard } = useScreenshot();
  const { astTheme, setAstTheme, setShowScope } = useTheme();

  const prepareScreenshot = async (
    cb: (root: HTMLElement) => Promise<void>
  ) => {
    const root = document.getElementById("root-container")
      ?.firstChild as HTMLElement;
    if (!root) return;

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
      <SM.Title>Export</SM.Title>
      <SM.Label htmlFor="themes">Theme:</SM.Label>
      <SM.Select id="themes" onChange={onThemeChange} value={astTheme}>
        <SM.Option value="dark">Dark</SM.Option>
        <SM.Option value="light">Light</SM.Option>
        <SM.Option value="black-on-white">Black on white</SM.Option>
        <SM.Option value="white-on-black">White on black</SM.Option>
      </SM.Select>
      <SM.Button onClick={exportClick}>Download</SM.Button>
      <SM.Button onClick={copyToClipboardClick}>Copy to Clipboard</SM.Button>
    </SM.Container>
  );
};
