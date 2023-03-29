import { useTheme } from "../../hooks/useTheme";
import { KeyboardEvent, useRef, useState } from "react";
import { useAst } from "../../hooks/useAST";

interface UseEditorProps {
  readonly?: boolean;
  disableNavigation?: boolean;
}

export const useEditor = ({ readonly, disableNavigation }: UseEditorProps) => {
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
    deselectAll,
    undo,
    redo,
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

  const handleUndoRedo = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.shiftKey && e.key === "Z") {
      redo();
    }
    if (e.ctrlKey && e.key === "z") {
      undo();
    }
  };

  const handleKeydown = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = getKey(e);

    if (!readonly) handleUndoRedo(e);
    if (e.ctrlKey) return;

    const navigationPayload = { select: e.shiftKey, move: e.altKey };
    const canDeselect = !(e.shiftKey || e.altKey);
    if (!disableNavigation) {
      switch (key) {
        case "ArrowUp":
          if (insertMode === "subscript") {
            setInsertMode("normal");
            edit("", "normal");
            return;
          }

          up(navigationPayload);
          if (canDeselect) deselectAll();
          return;
        case "ArrowDown":
          if (insertMode === "superscript") {
            setInsertMode("normal");
            edit("", "normal");
            return;
          }

          down(navigationPayload);
          if (canDeselect) deselectAll();
          return;
        case "ArrowLeft":
          left(navigationPayload);
          if (canDeselect) deselectAll();
          return;
        case "ArrowRight":
          if (insertMode !== "normal") {
            setInsertMode("normal");
            edit("", "normal");
            return;
          }

          right(navigationPayload);
          if (canDeselect) deselectAll();
          return;
      }
    }
    if (readonly) return;

    switch (key) {
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

      // switch (true) {
      //   case (buffer + key).endsWith("if"):
      //     backspace();
      //     addIf();
      //     return;
      //   case (buffer + key).endsWith("loop"):
      //     backspace(3);
      //     addLoop();
      //     edit("for", insertMode);
      //     return;
      // }

      const finalKey = e.shiftKey ? key.toUpperCase() : key;
      edit(finalKey, insertMode);
    }
  };

  const containerProps = {
    id: "root-container",
    className: `s-${astTheme}`,
    onKeyDown: handleKeydown,
    ref: rootRef,
    tabIndex: 0,
  };
  return { containerProps, rootRef };
};
