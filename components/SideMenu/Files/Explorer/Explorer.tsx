import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAst } from "../../../../hooks/useAST";
import { FilesDTO } from "../../../../pages/api/files";
import * as S from "./Explorer.atoms";
import { File } from "./File/File";

export const Explorer = () => {
  const { functionName, ast } = useAst();

  const mutation = useMutation((newFile) => {
    return axios.post("/api/files", newFile);
  });

  const { data } = useQuery<{ files: FilesDTO[] }>(
    ["files"],
    () => axios.get("/api/files").then((res) => res.data),
    {
      onSuccess: (data) => {
        if (data.files.length === 0) {
          mutation.mutate({
            name: functionName,
            path: `/${functionName}`,
            ast,
          } as any);
        }
      },
    }
  );

  return (
    <S.Container>
      <S.Menu>
        <S.MenuItem src={"/new_file.png"} />
        <S.MenuItem src={"/new_folder.png"} />
        <S.MenuItem src={"/refresh.png"} />
        <S.MenuItem src={"/collapse_all.png"} />
      </S.Menu>
      <S.FileContainer>
        {data?.files?.map((file: any) => (
          <File {...file} key={file.path} />
        ))}
      </S.FileContainer>
    </S.Container>
  );
};
