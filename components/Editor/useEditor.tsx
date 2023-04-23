import { useTheme } from "../../hooks/useTheme";
import { KeyboardEvent, useRef } from "react";
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
    insert,
    backspace,
    addStatement,
    deselectAll,
    undo,
    redo,
    setInsertMode,
  } = useAst();
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
          up(navigationPayload);
          if (canDeselect) deselectAll();
          return;
        case "ArrowDown":
          down(navigationPayload);
          if (canDeselect) deselectAll();
          return;
        case "ArrowLeft":
          left(navigationPayload);
          if (canDeselect) deselectAll();
          return;
        case "ArrowRight":
          setInsertMode("normal");

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
        insert({ type: "superscript", text: [] }, "normal");
        setInsertMode("inside");
        return;
      case "_":
        insert({ type: "subscript", text: [] }, "normal");
        setInsertMode("inside");
        return;
    }

    const allowedChars =
      /^[a-zA-Z0-9_:\+\/\(\)\*\- \"\^=\.\&\|<>!\^\×\,\[\]\;]{1}$/;
    if (allowedChars.test(key)) {
      const finalKey = e.shiftKey ? key.toUpperCase() : key;
      edit(finalKey);
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
