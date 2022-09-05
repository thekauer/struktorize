import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useAst } from "../../../../hooks/useAST";
import { FileDTO, FilesDTO, NewFileDTO } from "../../../../pages/api/files";
import * as S from "./Explorer.atoms";
import { File, FileProps } from "./File/File";

export const Explorer = () => {
  const { functionName, ast } = useAst();
  const [activePath, setActivePath] = useState<string>("/main");
  const [newPath, setNewPath] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, refetch } = useQuery<{ files: FilesDTO[] }>(
    ["files"],
    () => axios.get("/api/files").then((res) => res.data),
    {
      onSuccess: (data) => {
        if (data.files.length === 0) {
          mutate({
            file: {
              name: functionName,
              path: `/${functionName}`,
              ast,
              type: "file",
            } as FileDTO,
            method: "post",
          });
        }
      },
    }
  );

  const { mutate } = useMutation(
    ({ file, method }: { file: any; method: "post" | "delete" | "put" }) => {
      if (method === "delete") {
        return axios.delete(`/api/files?path=${file.path}`);
      }
      return axios[method]("/api/files", file);
    },
    {
      onMutate: async ({ file, method }) => {
        await queryClient.cancelQueries(["files"]);
        const previousFiles = queryClient.getQueryData(["files"]);
        const updater = {
          post: ({ files }: any) => files,
          delete: ({ files }: any) => {
            files: files.filter((f: any) => f.path !== file.path);
          },
          put: ({ files }: any) => {
            files: [...files, file];
          },
        };
        queryClient.setQueryData(["files"], updater[method]);

        return { previousFiles };
      },
      onError: (err, newFile, context: any) => {
        queryClient.setQueryData(["files"], context.previousFiles);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["files"]);
      },
    }
  );

  const newFileClick = () => {
    setNewPath(activePath.substring(0, activePath.lastIndexOf("/") + 1));
  };

  const files = data?.files || [];
  const newFile: FileProps = {
    path: newPath!,
    isNew: true,
    onSubmit: (path, name) => {
      mutate({
        file: {
          name,
          path,
          type: "file",
        },
        method: "put",
      });
      setNewPath(null);
    },
    onEscape: () => {
      setNewPath(null);
    },
  };

  const filesWithNewFile = !newPath ? files : [...files, newFile];

  return (
    <S.Container>
      <S.Menu>
        <S.MenuItem src={"/new_file.png"} onClick={newFileClick} />
        <S.MenuItem src={"/new_folder.png"} />
        <S.MenuItem src={"/refresh.png"} onClick={() => refetch()} />
        <S.MenuItem src={"/collapse_all.png"} />
      </S.Menu>
      <S.FileContainer>
        {filesWithNewFile.map((file: any) => (
          <File
            {...file}
            key={file.path}
            isActive={file.path === activePath}
            onClick={(path) => setActivePath(path)}
            onDelete={(path) => {
              mutate({
                file: {
                  path,
                },
                method: "delete",
              });
            }}
          />
        ))}
      </S.FileContainer>
    </S.Container>
  );
};
