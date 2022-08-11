import useEventListener from "@use-it/event-listener";
import { AstContext, useAST } from "../../hooks/useAST";
import { Render } from "../Render/Render";
import * as S from "./Editor.atoms";

export const Editor = () => {
  const ast = useAST();

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.altKey) {
      if (e.key === "b") {
        ast.addIf();
      }
      if (e.key === "v") {
        ast.addLoop();
      }
    }

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
      const key = e.shiftKey ? e.key.toUpperCase() : e.key;
      ast.edit(key);
    }
  };

  useEventListener("keydown", handleKeydown);

  return (
    <AstContext.Provider value={{ scope: ast.scope }}>
      <S.Container>
        <Render head={ast.ast} />
      </S.Container>
    </AstContext.Provider>
  );
};
