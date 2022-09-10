import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Ast } from "../../../../lib/ast";
import { FileDTO, NodeDTO } from "../../../../pages/api/files";

export const useFiles = (
  onFirstLoad?: ({ files, file }: { files: string[]; file: FileDTO }) => void
) => {
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery(
    ["files"],
    () => axios.get("/api/files").then((res) => res.data),
    {
      onSuccess: ({ files, file }) => {
        onFirstLoad?.({ files, file });
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

  const files = data?.files || [];

  return { createFile, deleteFile, saveFile, refetch, files };
};
