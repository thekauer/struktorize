import { useState } from "react";
import { toPng, toBlob } from "html-to-image";

const useScreenshot = () => {
  const [image, setImage] = useState<string>();
  const [error, setError] = useState(null);

  const takeScreenShot = async (node: HTMLElement) => {
    if (!node) {
      throw new Error("You should provide correct html node.");
    }

    try {
      const image = await toPng(node);
      setImage(image);
    } catch (e) {
      setError(e as any);
    }
  };

  const screenshotToClipboard = async (node: HTMLElement) => {
    if (!node) {
      throw new Error("You should provide correct html node.");
    }
    const blob = await toBlob(node);
    navigator.clipboard.write([
      new ClipboardItem({
        [blob!.type]: blob!,
      }),
    ]);
  };

  return { image, takeScreenShot, screenshotToClipboard, error };
};

export { useScreenshot };
