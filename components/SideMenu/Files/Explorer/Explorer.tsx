import * as S from './Explorer.atoms';
import { File } from './File/File';
import { useExplorer } from './useExplorer';
import { File as FileType } from '@/lib/repository';

export const Explorer = () => {
  const { newFileClick, refreshClick, files } = useExplorer();
  const getName = (file: FileType) => file.path.split('/').pop()!;
  const sortedFiles = files.sort((a, b) =>
    getName(a).localeCompare(getName(b)),
  );

  return (
    <S.Container>
      <S.Menu>
        <S.MenuItem src={'/new_file.png'} onClick={newFileClick} />
        <S.MenuItem src={'/refresh.png'} onClick={refreshClick} />
      </S.Menu>
      <S.FileContainer>
        {sortedFiles.map((file) => (
          <File {...file} key={file.path} />
        ))}
      </S.FileContainer>
    </S.Container>
  );
};
