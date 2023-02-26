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

interface EditorProps {
  readonly?: boolean;
}

export const Editor = ({ readonly }: EditorProps) => {
  const { containerProps, rootRef } = useEditor(readonly);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  return (
    <S.Container {...containerProps}>
      <Root />
    </S.Container>
  );
};
