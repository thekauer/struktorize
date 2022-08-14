import * as S from "./Files.atoms";

export const Files = () => {
  return (
    <S.Container>
      <S.Title>Files</S.Title>
      <S.Menu>
        <S.MenuItem src={"/new_file.png"} />
        <S.MenuItem src={"/new_folder.png"} />
        <S.MenuItem src={"/refresh.png"} />
        <S.MenuItem src={"/collapse_all.png"} />
      </S.Menu>
    </S.Container>
  );
};
