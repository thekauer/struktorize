import { ShareDTO } from "@/pages/api/files/share";
import { useAstState } from "@/hooks/useAST";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FileDTO, NewFileDTO, UserDataDTO } from "../../../../pages/api/files";
import { File } from "@/lib/repository"
import { Ast } from "@/lib/ast";

export const useFiles = () => {
  const queryClient = useQueryClient();
  const { functionName, ast } = useAstState(); //TODO: insted of this use Zustand store.getState inside onSuccess

  const { data, refetch } = useQuery(
    ["files"],
    () => axios.get<UserDataDTO>("/api/files").then((res) => res.data),
    {
      onSuccess: async ({ files }) => {
        const isFirstLoad = files.length === 0;
        if (!isFirstLoad) return;

        const firstFileDto: FileDTO = { ast, path: `/${functionName}`, type: "file" };
        await axios.post("/api/files", firstFileDto);
        queryClient.invalidateQueries(["files"]);
      },
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  type Mutation =
    | { method: "delete", payload: { path: string } }
    | { method: "post", payload: { isRename: true, to: string, from: string, ast: Ast } }
    | { method: "post", payload: { isRename: false, newFile: NewFileDTO } }
    | { method: "put", payload: { file: FileDTO } }

  const { mutate } = useMutation(
    ({
      method,
      payload,
    }: Mutation) => {
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
        await queryClient.cancelQueries(["files"]);
        const previousFiles = queryClient.getQueryData<UserDataDTO>(["files"]);

        const updater = (userDataDto?: UserDataDTO): UserDataDTO => {
          if (!userDataDto) return previousFiles!;
          const { files, recent } = userDataDto;

          switch (method) {
            case "post":
              if (payload.isRename) {
                const renamedFile: File = { path: payload.to, ast: payload.ast, type: "file" };
                const filesAndRenamedFile = [...files.filter(f => f.path === payload.from), renamedFile]
                return { recent, files: filesAndRenamedFile };
              }

              const newFile = payload.newFile as File;
              return {
                recent,
                files: [...files, newFile]
              }
            case "delete": return {
              recent,
              files: files.filter((f) => f.path !== payload.path)
            };
            case "put": return {
              recent,
              files: [...files.filter(f => f.path !== payload.file.path), payload.file]
            };
          }
        };
        queryClient.setQueryData(["files"], updater);

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

  const saveFile = (file: File) =>
    mutate({
      payload: {
        file: {
          path: file.path,
          ast: file.ast as any,
          type: "file",
        }
      },
      method: "put",
    });

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

  const renameFile = (file: File, from: string, to: string) => {
    mutate({
      payload: {
        from,
        ast: file.ast,
        to,
        isRename: true,
      },
      method: "post",
    });
  };

  const shareFile = async (path: string) => {
    const { data: { id } } = await axios.post<ShareDTO>(`/api/files/share/`, { path });
    return id;
  }

  const files = data?.files || [];

  return { createFile, deleteFile, saveFile, renameFile, shareFile, refetch, files };
};
