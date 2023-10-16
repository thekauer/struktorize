'use client';

import { MouseEvent, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import * as S from './File.atoms';
import * as ES from '../Explorer.atoms';
import { useTranslation } from '@/i18n/client';
import toast from 'react-hot-toast';
import { useAstState } from '@/hooks/useAST';
import { useExplorer } from '../useExplorer';
import { useAtomValue, useSetAtom } from 'jotai';
import { codeCompletionVisibleAtom } from '@/components/Editor/CodeCompletion/useCodeCompletion';
import { useCreateFile } from '../useCreateFile';
import { useDeleteFile } from '../useDeleteFile';
import { useRenameFile } from '../useRenameFile';
import { shareFile } from '../shareFile';
import { useSaveCurrentFile } from '../useSaveCurrentFile';
import { useSelectFile } from '../useSelectFile';
import { useSelectFolder } from '../useSelectFolder';
import { multiEditorPath } from '@/components/Editor/Editor';
import { useMoveFile } from '../useMoveFile';
import * as Files from '@/lib/files';

export interface FileProps {
  path: string;
  isNew?: boolean;
  newType?: 'file' | 'folder';
}

export const File = ({ path, isNew, newType }: FileProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(isNew);
  const { t } = useTranslation(['common'], { keyPrefix: 'menu.files' });
  const { files, activePath, setNewPath } = useExplorer();
  const { changed } = useAstState();
  const saveCurrentFile = useSaveCurrentFile();
  const createFile = useCreateFile();
  const deleteFile = useDeleteFile();
  const renameFile = useRenameFile();
  const selectFile = useSelectFile();
  const { selectFolder, deselectFolder } = useSelectFolder();
  const folderPath = useAtomValue(multiEditorPath);
  const thisFile = files.find((f) => f.path === path)!;
  const setCCVisivle = useSetAtom(codeCompletionVisibleAtom);

  useEffect(() => {
    if (isNew) {
      inputRef.current?.focus();
    }
  }, [isNew]);

  const focusRoot = () =>
    document.querySelector<HTMLDivElement>('#root-container')?.focus();

  const onFileClick = async () => {
    if (path === activePath && folderPath === null) return;
    const nextNode = files.find((f: any) => f.path === path);
    if (nextNode?.type === 'file') {
      saveCurrentFile.mutate();
      deselectFolder();
      selectFile.mutate(path);
      focusRoot();
    }
    if (nextNode?.type === 'folder') {
      await saveCurrentFile.mutateAsync();
      selectFolder(path);
    }
  };

  const handleDelete = () => {
    if (isNew) return;

    deleteFile.mutate(path);
  };

  const createNewFile = (path: string, type: 'file' | 'folder') => {
    const newName = inputRef.current?.value!;
    setCCVisivle(false);
    if (!validName(newName)) return;
    if (changed) {
      saveCurrentFile.mutate();
    }
    createFile.mutate({ type, path });
    if (type === 'file') selectFile.mutate(path);
    setNewPath(null);

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

      const isFolder = thisFile.type === 'folder';
      if (isFolder) {
        renameFile.mutate({
          from: thisFile.path,
          to: Files.path(Files.parent(thisFile.path), newName),
        });
        return;
      }

      const oldPath = path.substring(0, path.lastIndexOf('/') + 1);
      renameFile.mutate({
        from: path,
        to: oldPath + newName,
      });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        handleRename();
        if (isNew) {
          const newPath = path + inputRef.current?.value!;
          createNewFile(newPath, newType as 'file' | 'folder');
        }
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
  const isSelected =
    folderPath !== null ? folderPath === path : path === activePath;

  return (
    <S.Container
      $active={isSelected}
      onKeyDown={onKeyDown}
      onClick={onFileClick}
      tabIndex={-1}
    >
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
              $src="/share.svg"
              onClick={handleShare}
              title={t('share')}
            />
            <ES.MenuItem
              $src="/rename.svg"
              onClick={(e) => {
                e.stopPropagation();
                handleRename();
              }}
              title={t('rename')}
            />
            <ES.MenuItem
              $src="/bin.svg"
              onClick={handleDelete}
              title={t('delete')}
            />
          </S.FileMenu>
        </>
      )}
    </S.Container>
  );
};
