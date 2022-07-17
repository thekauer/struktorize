import { useEffect } from "react";
import { useAST } from "../../hooks/useAST";
import { Render } from "../Render/Render";
import * as S from "./Editor.atoms";

export const Editor = () => {
  const ast = useAST();

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        ast.down();
      }
      if (e.key === "ArrowUp") {
        ast.up();
      }
      if (e.key === "ArrowLeft") {
        ast.left();
      }
      if (e.key === "ArrowRight") {
        ast.right();
      }

      if (e.key === "a") {
        ast.addIf();
      }
      if (e.key === "s") {
        ast.addLoop();
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
