import * as S from "./Explorer.atoms";
import { File } from "./File/File";

export const Explorer = () => {
  return (
    <S.Container>
      <S.Menu>
        <S.MenuItem src={"/new_file.png"} />
        <S.MenuItem src={"/new_folder.png"} />
        <S.MenuItem src={"/refresh.png"} />
        <S.MenuItem src={"/collapse_all.png"} />
      </S.Menu>
      <S.FileContainer>
        <File name={"main"} path={"/main"} />
      </S.FileContainer>
    </S.Container>
  );
};
