import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";
import { Ast } from "../../../../lib/ast";
import { FileDTO, NodeDTO } from "../../../../pages/api/files";

export const useFiles = (
  onFirstLoad?: ({ files, file }: { files: string[]; file: FileDTO }) => void
) => {
  const loadedRef = useRef(false);
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery(
    ["files"],
    () => axios.get("/api/files").then((res) => res.data),
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
      isMove,
    }: {
      file: any;
      method: "post" | "delete" | "put";
      isMove?: boolean;
    }) => {
      if (method === "delete") {
        return axios.delete(`/api/files?path=${file.path}`);
      }
      if (method === "post" && isMove) {
        return axios.post(`/api/files/move`, file);
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

  const moveFile = (from: string, to: string) => {
    mutate({
      file: {
        from,
        to,
      },
      method: "post",
      isMove: true,
    });
  };

  const files = data?.files || [];

  return { createFile, deleteFile, saveFile, moveFile, refetch, files };
};
