import * as SM from "../SideMenu.atoms";
import * as S from "./Files.atoms";

export const Files = () => {
  return (
    <SM.Container>
      <SM.Title>Files</SM.Title>
      <S.Menu>
        <S.MenuItem src={"/new_file.png"} />
        <S.MenuItem src={"/new_folder.png"} />
        <S.MenuItem src={"/refresh.png"} />
        <S.MenuItem src={"/collapse_all.png"} />
      </S.Menu>
    </SM.Container>
  );
};
