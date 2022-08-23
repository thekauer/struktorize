import { useState } from "react";
import { toPng } from "html-to-image";

const useScreenshot = () => {
  const [image, setImage] = useState<string>();
  const [error, setError] = useState(null);

  const takeScreenShot = (node: HTMLElement) => {
    if (!node) {
      throw new Error("You should provide correct html node.");
    }

    return toPng(node).then(setImage).catch(setError);
  };

  return [image, takeScreenShot, error] as const;
};

export { useScreenshot };
