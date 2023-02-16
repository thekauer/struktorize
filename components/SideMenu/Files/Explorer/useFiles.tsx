import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";
import { Files, FileDTO} from "../../../../pages/api/files";

export const useFiles = (onFirstLoad?: ({ files, file }: Files) => void) => {
  const loadedRef = useRef(false);
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery(
    ["files"],
    () => axios.get<Files>("/api/files").then((res) => res.data),
    {
      onSuccess: ({ files, file }) => {
        if (!loadedRef.current) {
          loadedRef.current = true;
          onFirstLoad?.({ files, file });
        }
      },
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const { mutate } = useMutation(
    ({
      file,
      method,
      isRename,
    }: {
      file: any;
      method: "post" | "delete" | "put";
      isRename?: boolean;
    }) => {
      if (method === "delete") {
        return axios.delete(`/api/files?path=${file.path}`);
      }
      if (method === "post" && isRename) {
        return axios.post(`/api/files/rename`, file);
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
    } as FileDTO,
      method: "post",
    });

  const createFile = (path: string) => {
    mutate({
      file: {
        path,
        type: "file",
      },
      method: "put",
    });
  };

  const deleteFile = (path: string) => {
    mutate({
      file: {
        path,
      },
      method: "delete",
    });
  };

  const renameFile = (file: any, from: string, to: string) => {
    mutate({
      file: {
        from,
        ast: file.ast as any,
        to,
      },
      method: "post",
      isRename: true,
    });
  };

  const files = data?.files || [];

  return { createFile, deleteFile, saveFile, renameFile, refetch, files };
};
