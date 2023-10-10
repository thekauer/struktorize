import { useSetAtom } from 'jotai';
import {
  multiEditorAtom,
  multiEditorFiles,
  multiEditorPath,
} from '@/components/Editor/Editor';
import { useFiles } from './useFiles';

export const useSelectFolder = () => {
  const setMultiEditor = useSetAtom(multiEditorAtom);
  const setFiles = useSetAtom(multiEditorFiles);
  const setPath = useSetAtom(multiEditorPath);
  const { files } = useFiles();

  const selectFolder = (path: string) => {
    const folder = files.find((f) => f.path === path && f.type === 'folder');
    if (!folder) return;
    const folderSegmentCount = folder.path.split('/').length;
    const filesInFolder = files.filter(
      (f) =>
        f.path.startsWith(folder.path) &&
        f.path !== folder.path &&
        f.type === 'file' &&
        folderSegmentCount === f.path.split('/').length - 1,
    );

    setMultiEditor(true);
    setFiles(filesInFolder);
    setPath(path);
  };

  const deselectFolder = () => {
    setMultiEditor(false);
    setFiles([]);
    setPath(null);
  };

  return { selectFolder, deselectFolder };
};
