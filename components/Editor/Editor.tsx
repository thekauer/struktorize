import { useEffect, useRef, useState } from "react";
import { useAst, useAstState } from "../../hooks/useAST";
import { useTheme } from "../../hooks/useTheme";
import { Render } from "../Ast/Render/Render";
import * as S from "./Editor.atoms";
import { KeyboardEvent } from "react";

export const Editor = () => {
  const { ast } = useAstState();
  const {
    up,
    down,
    left,
    right,
    edit,
    backspace,
    addStatement,
    addIf,
    addLoop,
  } = useAst();
  const [buffer, setBuffer] = useState("");
  const [insertMode, setInsertMode] = useState<
    "normal" | "superscript" | "subscript"
  >("normal");
  const { astTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);

  const getKey = (e: KeyboardEvent) => {
    if (e.key === "Dead" && e.code === "Digit3") return "^";
    return e.key;
  };

  const handleKeydown = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = getKey(e);

    if (e.ctrlKey) return;

    switch (key) {
      case "ArrowUp":
        if (insertMode === "subscript") {
          setInsertMode("normal");
          edit("", "normal");
          return;
        }

        up();
        return;
      case "ArrowDown":
        if (insertMode === "superscript") {
          setInsertMode("normal");
          edit("", "normal");
          return;
        }

        down();
        return;
      case "ArrowLeft":
        left();
        return;
      case "ArrowRight":
        if (insertMode !== "normal") {
          setInsertMode("normal");
          edit("", "normal");
          return;
        }

        right();
        return;
      case "Backspace":
        setInsertMode("normal");
        backspace();
        return;
      case "Enter":
        addStatement();
        return;
      case "^":
        setInsertMode("superscript");
        edit("", "superscript");
        return;
      case "_":
        setInsertMode("subscript");
        edit("", "subscript");
        return;
    }

    const allowedChars =
      /^[a-zA-Z0-9_:\+\/\(\)\*\- \"\^=\.\&\|<>!\^\×\,\[\]\;]{1}$/;
    if (allowedChars.test(key)) {
      setBuffer((prev) => prev.substring(prev.length - 3) + key);

      switch (true) {
        case (buffer + key).endsWith("if"):
          backspace();
          addIf();
          return;
        case (buffer + key).endsWith("loop"):
          backspace(3);
          addLoop();
          edit("for", insertMode);
          return;
      }

      const finalKey = e.shiftKey ? key.toUpperCase() : key;
      edit(finalKey, insertMode);
    }
  };

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  return (
    <S.Container
      id="root-container"
      className={`s-${astTheme}`}
      onKeyDown={handleKeydown}
      ref={rootRef}
      tabIndex={0}
    >
      <S.Root>
        <Render head={ast} />
      </S.Root>
    </S.Container>
  );
};
