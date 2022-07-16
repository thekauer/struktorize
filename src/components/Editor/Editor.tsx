import { useEffect, useState } from "react";
import { useAST } from "../../hooks/useAST";
import { Render } from "../Render/Render";
import * as S from "./Editor.atoms";

export const Editor = () => {
  const ast = useAST();

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      ast.down();
    }
    if (e.key === "ArrowUp") {
      ast.up();
    }

    if (e.key === "a") {
      ast.addIf();
    }
    if (e.key === "s") {
      ast.addLoop();
    }
  };
  useEffect(() => {
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
