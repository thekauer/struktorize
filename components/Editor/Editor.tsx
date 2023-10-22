'use client';

import { useEffect } from 'react';
import { useAstState } from '../../hooks/useAST';
import { Render } from '../Ast/Render/Render';
import { useEditor } from './useEditor';
import * as S from './Editor.atoms';
import { CodeCompletion } from './CodeCompletion/CodeCompletion';
import { useCodeCompletion } from './CodeCompletion/useCodeCompletion';
import { useSaveTempFile } from '../SideMenu/Files/Explorer/useTempFiles';
import { File } from '@/lib/repository';
import { useTheme } from '@/hooks/useTheme';
import { atom, useAtomValue } from 'jotai';

export const multiEditorAtom = atom(false);
export const multiEditorFiles = atom([] as File[]);
export const multiEditorPath = atom<string | null>(null);

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
  const codeCompletionProps = useCodeCompletion();
  const { containerProps, rootRef } = useEditor({
    readonly,
    disableNavigation: codeCompletionProps.visible,
  });
  useSaveTempFile();

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
interface MultiEditorProps {
  files: File[];
}

export const MultiEditor = ({ files }: MultiEditorProps) => {
  const { astTheme } = useTheme();
  const containerProps = {
    id: 'root-container',
    className: `s-${astTheme}`,
    tabIndex: 0,
  };

  return files.map((file) => (
    <S.Container {...containerProps} key={file.path}>
      <Render head={file.ast} />
    </S.Container>
  ));
};

export const CompositeEditor = () => {
  const isMultiEditor = useAtomValue(multiEditorAtom);
  const files = useAtomValue(multiEditorFiles);

  return isMultiEditor ? <MultiEditor files={files} /> : <Editor />;
};
