import * as S from "./Explorer.atoms";
import { File } from "./File/File";
import { useExplorer } from "./useExplorer";

export const Explorer = () => {
  const { newFileClick, refreshClick, files } = useExplorer();

  return (
    <S.Container>
      <S.Menu>
        <S.MenuItem src={"/new_file.png"} onClick={newFileClick} />
        <S.MenuItem src={"/refresh.png"} onClick={refreshClick} />
        <S.MenuItem src={"/collapse_all.png"} />
      </S.Menu>
      <S.FileContainer>
        {files.map((file) => (
          <File {...file} key={file.path} />
        ))}
      </S.FileContainer>
    </S.Container>
  );
};
