'use client';

import { useEffect } from 'react';
import { useAstState } from '../../hooks/useAST';
import { Render } from '../Ast/Render/Render';
import { useEditor } from './useEditor';
import * as S from './Editor.atoms';
import { CodeCompletion } from './CodeCompletion/CodeCompletion';
import { useCodeCompletion } from './CodeCompletion/useCodeCompletion';

const Root = () => {
  const { ast, scope } = useAstState();
  console.log(scope, ast);

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
  const codeCompletionProps = useCodeCompletion();
  const { containerProps, rootRef } = useEditor({
    readonly,
    disableNavigation: codeCompletionProps.visible,
  });

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  return (
    <S.Container {...containerProps}>
      <Root />
      {!readonly && <CodeCompletion {...codeCompletionProps} />}
    </S.Container>
  );
};
