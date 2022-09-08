import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAst } from "../../../../hooks/useAST";
import { Ast } from "../../../../lib/ast";
import { debounce } from "../../../../lib/debounce";
import { FileDTO, NodeDTO, NodesDTO } from "../../../../pages/api/files";
import * as S from "./Explorer.atoms";
import { File, FileProps } from "./File/File";

export const Explorer = () => {
  const { functionName, ast, load, addChangeListener } = useAst();
  const [activePath, setActivePath] = useState<string>("/main");
  const [newPath, setNewPath] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, refetch } = useQuery<{ files: NodesDTO }>(
    ["files"],
    () => axios.get("/api/files").then((res) => res.data),
    {
      onSuccess: (data) => {
        if (data.files.length === 0) {
          mutate({
            file: {
              path: `/${functionName}`,
              ast: ast as any,
              type: "file",
            } as NodeDTO,
            method: "post",
          });
        }
      },
      staleTime: Infinity,
      cacheTime: Infinity,
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
          post: ({ files }: any) => ({ files }),
          delete: ({ files }: any) => ({
            files: files.filter((f: any) => f.path !== file.path),
          }),
          put: ({ files }: any) => ({
            files: [...files, file],
          }),
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

  const saveFile = (file: any) =>
    mutate({
      file: {
        path: file.path,
        ast: file.ast as any,
        type: "file",
      } as NodeDTO,
      method: "post",
    });

  useEffect(() => {
    addChangeListener((state) =>
      debounce(() => {
        saveFile(state);
      }, 300)()
    );
  }, []);

  const newFileClick = () => {
    setNewPath(activePath.substring(0, activePath.lastIndexOf("/") + 1));
  };

  const files = data?.files || [];
  const activeFile = files.find(
    (f) => f.path === activePath && f.type === "file"
  ) as FileDTO;

  const newFile: FileProps = {
    path: newPath!,
    isNew: true,
    onSubmit: (path) => {
      mutate({
        file: {
          path,
          type: "file",
        },
        method: "put",
      });
      setNewPath(null);
      setActivePath(path);

      const name = path.substring(path.lastIndexOf("/") + 1);
      const newAst = {
        signature: {
          text: `\\text{${name}}()`,
          type: "signature",
          path: "signature",
        },
        body: [],
        type: "function",
        path: "",
      } as Ast;

      load(newAst, path);
      document.querySelector<HTMLDivElement>("#root-container")?.focus();
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
            name={file.path.substring(file.path.lastIndexOf("/") + 1)}
            key={file.path}
            isActive={file.path === activePath}
            onClick={(path) => {
              const nextFile = files.find((f: any) => f.path === path);
              if (nextFile?.type === "file") {
                saveFile(activeFile);
                load(nextFile.ast as any, nextFile.path);
                setActivePath(path);
                document
                  .querySelector<HTMLDivElement>("#root-container")
                  ?.focus();
              }
            }}
            onDelete={(path) => {
              const nextFile: any = files.filter(
                (f) => f.path !== path && f.type === "file"
              )[0];
              setActivePath(nextFile.path);
              load(nextFile.ast as any, nextFile.path);
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
