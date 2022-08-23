import { useScreenshot } from "../../../hooks/useScreenshot";
import * as SM from "../SideMenu.atoms";

export const Export = () => {
  const [image, takeScreenShot] = useScreenshot();

  const exportClick = () => {
    const rootContainer = document.getElementById("root-container");
    if (!rootContainer?.firstChild) {
      return;
    }

    takeScreenShot(rootContainer.firstChild as HTMLElement);
  };

  return (
    <SM.Container>
      <SM.Title>Export</SM.Title>
      <SM.Button onClick={exportClick}>Export</SM.Button>
    </SM.Container>
  );
};
