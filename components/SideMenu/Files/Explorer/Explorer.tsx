import * as S from "./Explorer.atoms";

export const Explorer = () => {
  return (
    <S.Menu>
      <S.MenuItem src={"/new_file.png"} />
      <S.MenuItem src={"/new_folder.png"} />
      <S.MenuItem src={"/refresh.png"} />
      <S.MenuItem src={"/collapse_all.png"} />
    </S.Menu>
  );
};
