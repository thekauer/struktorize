import { useEffect } from "react";
import { useAST } from "../../hooks/useAST";
import { Render } from "../Render/Render";
import * as S from "./Editor.atoms";

export const Editor = () => {
  const ast = useAST();

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          ast.up();
          return;
        case "ArrowDown":
          ast.down();
          return;
        case "ArrowLeft":
          ast.left();
          return;
        case "ArrowRight":
          ast.right();
          return;
        case "Backspace":
          ast.backspace();
          return;
      }

      const allowedChars = /^[a-zA-Z0-9_:\+\/\(\)\*\- \"\^]{1}$/;
      if (allowedChars.test(e.key)) {
        ast.edit(e.shiftKey ? e.key.toUpperCase() : e.key);
      }
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
