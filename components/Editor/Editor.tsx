import useEventListener from "@use-it/event-listener";
import { useState } from "react";
import { AstContext, useAST } from "../../hooks/useAST";
import { Render } from "../Ast/Render/Render";
import * as S from "./Editor.atoms";

export const Editor = () => {
  const ast = useAST();
  const [buffer, setBuffer] = useState("");
  const [insertMode, setInsertMode] = useState<
    "normal" | "superscript" | "subscript"
  >("normal");

  const getKey = (e: KeyboardEvent) => {
    if (e.key === "Dead" && e.code === "Digit3") return "^";
    return e.key;
  };

  const handleKeydown = (e: KeyboardEvent) => {
    const key = getKey(e);

    if (e.altKey) {
      if (key === "b") {
        ast.addIf();
        return;
      }
      if (key === "v") {
        ast.addLoop();
        return;
      }
    }

    switch (key) {
      case "ArrowUp":
        if (insertMode === "subscript") {
          setInsertMode("normal");
          ast.edit("", "normal");
          return;
        }

        ast.up();
        return;
      case "ArrowDown":
        if (insertMode === "superscript") {
          setInsertMode("normal");
          ast.edit("", "normal");
          return;
        }

        ast.down();
        return;
      case "ArrowLeft":
        ast.left();
        return;
      case "ArrowRight":
        if (insertMode !== "normal") {
          setInsertMode("normal");
          ast.edit("", "normal");
          return;
        }

        ast.right();
        return;
      case "Backspace":
        setInsertMode("normal");
        ast.backspace();
        return;
      case "Enter":
        ast.addStatement();
        return;
      case "^":
        setInsertMode("superscript");
        ast.edit("", "superscript");
        return;
      case "_":
        setInsertMode("subscript");
        ast.edit("", "subscript");
        return;
    }

    const allowedChars =
      /^[a-zA-Z0-9_:\+\/\(\)\*\- \"\^=\.\&\|<>!\^\×\,\[\]\;]{1}$/;
    if (allowedChars.test(key)) {
      setBuffer((prev) => prev.substring(prev.length - 3) + key);

      switch (true) {
        case (buffer + key).endsWith("if"):
          ast.backspace();
          ast.addIf();
          return;
        case (buffer + key).endsWith("loop"):
          ast.backspace(3);
          ast.addLoop();
          ast.edit("for", insertMode);
          return;
      }

      const finalKey = e.shiftKey ? key.toUpperCase() : key;
      ast.edit(finalKey, insertMode);
    }
  };

  useEventListener("keydown", handleKeydown);

  return (
    <AstContext.Provider value={{ scope: ast.scope }}>
      <S.Container id="root-container">
        <Render head={ast.ast} />
      </S.Container>
    </AstContext.Provider>
  );
};
