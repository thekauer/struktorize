import React, {
  useEffect,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
  useContext,
} from 'react';
import { useAst, useAstState } from '../../../../hooks/useAST';
import { debounce } from '../../../../lib/debounce';
import { FileDTO } from '@/api/files/route';
import { File } from '@/lib/repository';
import { useFiles } from './useFiles';
import { FileProps } from './File/File';
import { useSession } from 'next-auth/react';
import { useSetAtom } from 'jotai';
import { codeCompletionVisibleAtom } from '@/components/Editor/CodeCompletion/useCodeCompletion';
import { useSaveCurrentFile } from './useSaveCurrentFile';
import { useSelectFile } from './useSelectFile';

const warnBeforeExit = (e: any) => {
  const confirmationMessage =
    'It looks like you have been editing something. ' +
    'If you leave before saving, your changes will be lost.';

  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
};

const explorerContext = createContext<{
  newPath: string | null;
  setNewPath: Dispatch<SetStateAction<string | null>>;
}>({} as any);

export const ExplorerProvider = ({ children }: { children: ReactNode }) => {
  const [newPath, setNewPath] = useState<string | null>(null);

  return (
    <explorerContext.Provider value={{ newPath, setNewPath }}>
      {children}
    </explorerContext.Provider>
  );
};

export const useExplorer = () => {
  const { addChangeListener } = useAst();
  const { newPath, setNewPath } = useContext(explorerContext);
  const { changed } = useAstState();
  const { status } = useSession();
  const { refetch, files, recent } = useFiles();
  const saveCurrentFile = useSaveCurrentFile();
  const selectFile = useSelectFile();
  const activePath = recent?.path!;
  const setCCVisible = useSetAtom(codeCompletionVisibleAtom);
  const [newEntryType, setNewEntryType] = useState<'file' | 'folder'>('file');

  useEffect(() => {
    if (!recent) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (changed) {
          saveCurrentFile.mutate();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [recent, changed]);

  useEffect(() => {
    addChangeListener(
      debounce((state) => {
        if (state.changed) {
          saveCurrentFile.mutate();
        }
      }, 10000),
      'save',
    );
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;

    addChangeListener((state) => {
      if (state.changed) {
        window.addEventListener('beforeunload', warnBeforeExit);
      } else {
        window.removeEventListener('beforeunload', warnBeforeExit);
      }
    }, 'warnExit');
  }, [status]);

  const newFileClick = () => {
    setCCVisible(false);
    setNewEntryType('file');
    setNewPath('/');
  };
  const newFolderClick = () => {
    setCCVisible(false);
    setNewEntryType('folder');
    setNewPath('/');
  };

  const focusRoot = () =>
    document.querySelector<HTMLDivElement>('#root-container')?.focus();

  const onFileClick = (path: string) => {
    if (activePath === path) return;

    const nextFile = files.find((f: any) => f.path === path);
    if (nextFile?.type === 'file') {
      saveCurrentFile.mutate();
      selectFile.mutate(path);
      focusRoot();
    }
  };

  const refreshClick = () => refetch();

  const activeFile = files.find(
    (f: FileDTO) => f.path === activePath && f.type === 'file',
  ) as FileDTO;

  const newFile: FileProps & { newType: 'file' | 'folder' } = {
    path: newPath!,
    isNew: true,
    newType: newEntryType,
  };

  const filesWithNewFile = !newPath
    ? files
    : [...files, newFile as any as File].sort((a, b) =>
        b.path.localeCompare(a.path),
      );

  return {
    newFileClick,
    newFolderClick,
    refreshClick,
    onFileClick,
    files: filesWithNewFile,
    activePath,
    activeFile,
    setNewPath,
  };
};
