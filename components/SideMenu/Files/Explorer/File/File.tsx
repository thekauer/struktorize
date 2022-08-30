import * as S from "./File.atoms";

interface FileProps {
  name: string;
  path: string;
}

export const File = ({ name, path }: FileProps) => {
  return (
    <S.Container>
      <S.Image src={"/structogram.png"} />
      <S.Name>{name}</S.Name>
    </S.Container>
  );
};
