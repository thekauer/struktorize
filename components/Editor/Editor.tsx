import { useEffect } from "react";
import { useAstState } from "../../hooks/useAST";
import { Render } from "../Ast/Render/Render";
import { useEditor } from "./useEditor";
import * as S from "./Editor.atoms";

const Root = () => {
  const { ast } = useAstState();

  return (
    <S.Root>
      <Render head={ast} />
    </S.Root>
  );
};

export const Editor = () => {
  const { containerProps, rootRef } = useEditor();

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  return (
    <S.Container {...containerProps}>
      <Root />
    </S.Container>
  );
};
