import { useEffect } from "react";
import { useAST } from "../../hooks/useAST";
import { Render } from "../Render/Render";
import * as S from "./Editor.atoms";

export const Editor = () => {
  const ast = useAST();

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case "ArrowUp":
            ast.up();
            break;
          case "ArrowDown":
            ast.down();
            break;
          case "ArrowLeft":
            ast.left();
            break;
          case "ArrowRight":
            ast.right();
            break;

          //misc
          case "e":
            ast.addIf();
            break;
          case "s":
            ast.addLoop();
            break;
        }
        return;
      }

      if (e.key === "Backspace") {
        ast.backspace();
      }

      ast.edit(e.shiftKey ? e.key.toUpperCase() : e.key);
    };

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  return (
    <S.Container>
      <Render head={ast.ast} />
    </S.Container>
  );
};
