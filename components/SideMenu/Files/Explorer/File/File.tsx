import { MouseEvent, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import * as S from './File.atoms';
import * as ES from '../Explorer.atoms';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { useAst, useAstState } from '@/hooks/useAST';
import { useExplorer } from '../useExplorer';
import { useFiles } from '../useFiles';
import { Ast } from 'lib/ast';
import { useSetAtom } from 'jotai';
import { codeCompletionVisibleAtom } from '@/components/Editor/CodeCompletion/useCodeCompletion';

export interface FileProps {
  path: string;
  isNew?: boolean;
}

export const File = ({ path, isNew }: FileProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(isNew);
  const { t } = useTranslation(['common'], { keyPrefix: 'menu.files' });
  const { files, activePath, setNewPath } = useExplorer();
  const { changed, ast } = useAstState();
  const { load } = useAst();
  const {
    saveFile,
    createFile,
    deleteFile,
    renameFile,
    shareFile,
    setActivePath,
    recent,
  } = useFiles();
  const thisFile = files.find((f) => f.path === path)!;
  const setCCVisivle = useSetAtom(codeCompletionVisibleAtom);

  useEffect(() => {
    if (isNew) {
      inputRef.current?.focus();
    }
  }, [isNew]);

  const focusRoot = () =>
    document.querySelector<HTMLDivElement>('#root-container')?.focus();

  const onFileClick = () => {
    if (path === activePath) return;
    const nextFile = files.find((f: any) => f.path === path);
    if (nextFile?.type === 'file') {
      saveFile({ ...recent!, ast, recent: nextFile.path });
      load(nextFile.ast as any, nextFile.path);
      setActivePath(path);
      focusRoot();
    }
  };

  const handleDelete = () => {
    if (isNew) return;

    deleteFile(path);
  };

  const createNewFile = (path: string) => {
    const newName = inputRef.current?.value!;
    setCCVisivle(false);
    if (!validName(newName)) return;
    if (changed) {
      saveFile({ ...recent!, ast });
    }
    createFile(path);
    setNewPath(null);

    const name = path.substring(path.lastIndexOf('/') + 1);
    const newAst = {
      signature: {
        text: [{ type: 'variable', name: `${name}` }],
        type: 'signature',
        path: 'signature',
      },
      body: [],
      type: 'function',
      path: '',
    } as Ast;

    load(newAst, path);
    focusRoot();
  };

  const onEscape = () => {
    setNewPath(null);
  };

  const validName = (name: string) => {
    if (name === '') return false;
    const isConflictingFileName = files.find((f) => f.path === `/${name}`);
    if (isConflictingFileName) return false;
    const nameHasOnlyAsciiLetters = !/^[a-zA-Z0-9]+$/.test(name);
    if (nameHasOnlyAsciiLetters) return false;
    return true;
  };

  const handleShare = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!path) {
      toast.error(t('errorGeneratingLink'));
      return;
    }

    const shareFileAndCopyIdToClipboard = async () => {
      const id = await shareFile(path);
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_SITE_URL}/${id}`,
      );
    };

    toast.promise(shareFileAndCopyIdToClipboard(), {
      loading: t('generatingLink'),
      success: t('copyToClipboard'),
      error: t('errorGeneratingLink'),
    });
  };

  const handleRename = () => {
    const pressedEnterToStartRenaming = !editing;
    if (pressedEnterToStartRenaming) {
      flushSync(() => {
        setEditing(true);
      });
      inputRef.current?.focus();
    }
    setCCVisivle(false);

    const finishedRenaming = !isNew && editing;
    if (finishedRenaming) {
      const newName = inputRef.current?.value!;
      if (!validName(newName)) return;

      const oldPath = path.substring(0, path.lastIndexOf('/') + 1);
      renameFile(thisFile, oldPath + newName);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        handleRename();
        if (isNew) createNewFile(path + inputRef.current?.value!);
        break;

      case 'Delete':
        handleDelete();
        break;

      case 'Escape':
        if (editing) setEditing(false);
        onEscape();
        break;
    }
  };

  const isChanged = changed && path === activePath;

  return (
    <S.Container
      active={path === activePath}
      onKeyDown={onKeyDown}
      onClick={onFileClick}
      tabIndex={-1}
    >
      <S.Image src={'/structogram.png'} />
      {editing ? (
        <S.Input ref={inputRef} />
      ) : (
        <>
          <S.Name title={path.split('/').pop()}>
            {isChanged && '*'}
            {path.split('/').pop()}
          </S.Name>
          <S.FileMenu>
            <ES.MenuItem
              src="/share.svg"
              onClick={handleShare}
              title={t('share')}
            />
            <ES.MenuItem
              src="/rename.svg"
              onClick={(e) => {
                e.stopPropagation();
                handleRename();
              }}
              title={t('rename')}
            />
            <ES.MenuItem
              src="/bin.svg"
              onClick={handleDelete}
              title={t('delete')}
            />
          </S.FileMenu>
        </>
      )}
    </S.Container>
  );
};
