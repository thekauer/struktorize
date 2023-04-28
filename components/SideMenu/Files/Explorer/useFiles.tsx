import { ShareDTO } from "@/pages/api/files/share";
import { useAst, useAstState } from "@/hooks/useAST";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FileDTO, NewFileDTO, UserDataDTO } from "../../../../pages/api/files";
import { File } from "@/lib/repository";
import { Ast } from "@/lib/ast";
import { useSession } from "next-auth/react";

export const useFiles = () => {
  const queryClient = useQueryClient();
  const { functionName, ast } = useAstState();
  const { save, load } = useAst();
  const { status } = useSession();

  const { data, refetch } = useQuery(
    ["files"],
    () => axios.get<UserDataDTO>("/api/files").then((res) => res.data),
    {
      onSuccess: async ({ files }) => {
        const isFirstLoad = files.length === 0;
        if (!isFirstLoad) return;

        const firstFileDto: FileDTO = {
          ast,
          path: `/${functionName}`,
          type: "file",
        };
        await axios.post("/api/files", firstFileDto);
        queryClient.invalidateQueries(["files"]);
      },
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: status === "authenticated",
    }
  );

  type Mutation =
    | { method: "delete"; payload: { path: string } }
    | {
        method: "post";
        payload: { isRename: true; to: string; from: string; ast: Ast };
      }
    | { method: "post"; payload: { isRename: false; newFile: NewFileDTO } }
    | { method: "put"; payload: { file: FileDTO } };

  const { mutate } = useMutation(
    ({ method, payload }: Mutation) => {
      switch (method) {
        case "delete": {
          return axios.delete(`/api/files?path=${payload.path}`);
        }
        case "post": {
          if (payload.isRename) {
            const { to, from, ast } = payload;
            return axios.post(`/api/files/rename`, { to, from, ast });
          }
          return axios.post("/api/files", payload.newFile);
        }
        case "put":
          return axios[method]("/api/files", payload.file);
      }
    },
    {
      onMutate: async ({ payload, method }) => {
        await queryClient.cancelQueries({ queryKey: ["files"] });
        const previousFiles = queryClient.getQueryData<UserDataDTO>(["files"]);

        const updater = (userDataDto?: UserDataDTO): UserDataDTO => {
          if (!userDataDto) return previousFiles!;
          const { files, recent } = userDataDto;

          switch (method) {
            case "post":
              if (payload.isRename) {
                const renamedFile: File = {
                  path: payload.to,
                  ast: payload.ast,
                  type: "file",
                };
                const filesAndRenamedFile = [
                  ...files.filter((f) => f.path !== payload.from),
                  renamedFile,
                ];
                return { recent, files: filesAndRenamedFile };
              }

              const newFile = payload.newFile as File;
              return {
                recent: newFile,
                files: [...files, newFile],
              };
            case "delete": {
              const filesWithoutFile = files.filter(
                (f) => f.path !== payload.path
              );
              const nextFile = filesWithoutFile[0];
              load(nextFile.ast as any, nextFile.path);
              return {
                recent: nextFile,
                files: filesWithoutFile,
              };
            }
            case "put":
              return {
                recent,
                files: [
                  ...files.filter((f) => f.path !== payload.file.path),
                  payload.file,
                ],
              };
          }
        };
        queryClient.setQueryData(["files"], updater);

        return { previousFiles };
      },
      onError: (_err, _newFile, context: any) => {
        queryClient.setQueryData(["files"], context.previousFiles);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["files"] });
      },
    }
  );

  const saveFile = (file: FileDTO) => {
    mutate({
      payload: { file },
      method: "put",
    });
    save();
  };

  const createFile = (path: string) => {
    mutate({
      payload: {
        newFile: { path, type: "file" },
        isRename: false,
      },
      method: "post",
    });
  };

  const deleteFile = (path: string) => {
    mutate({
      payload: { path },
      method: "delete",
    });
  };

  const renameFile = (file: File, to: string) => {
    mutate({
      payload: {
        from: file.path,
        ast: file.ast,
        to,
        isRename: true,
      },
      method: "post",
    });
    save();
  };

  const shareFile = async (path: string) => {
    const {
      data: { id },
    } = await axios.post<ShareDTO>(`/api/files/share/`, { path });
    return id;
  };

  const files = data?.files || [];
  const recent = data?.recent;

  const setActivePath = (recentPath: string) => {
    queryClient.setQueryData(["files"], {
      files,
      recent: files.find((f) => f.path === recentPath) || recent,
    });
  };

  return {
    createFile,
    deleteFile,
    saveFile,
    renameFile,
    shareFile,
    refetch,
    files,
    recent,
    setActivePath,
  };
};
