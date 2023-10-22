'use client';

import * as S from './Explorer.atoms';
import { useExplorer } from './useExplorer';
import { File as FileType } from '@/lib/repository';
import { useLoadTempFile } from './useTempFiles';
import { FileTree } from './FileTree/FileTree';

export const Explorer = () => {
  const { newFileClick, newFolderClick, refreshClick, files, recent } =
    useExplorer();

  useLoadTempFile();
  const getName = (file: FileType) => file.path.split('/').pop()!;
  const sortedFiles = files.sort((a, b) =>
    getName(a).localeCompare(getName(b)),
  );

  return (
    <S.Container>
      <S.Menu>
        <S.MenuItem $src={'/file-add-line.png'} onClick={newFileClick} />
        <S.MenuItem $src={'/folder-add-line.png'} onClick={newFolderClick} />
        <S.MenuItem $src={'/refresh.png'} onClick={refreshClick} />
      </S.Menu>
      <S.FileContainer>
        <FileTree files={files as any} recent={recent as any} />
      </S.FileContainer>
    </S.Container>
  );
};
