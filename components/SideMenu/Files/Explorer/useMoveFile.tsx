import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserDataDTO } from '@/api/files/route';
import * as Files from '@/lib/files';

export const useMoveFile = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ to, from }: { to: string; from: string }) => {
      return axios.post(`/api/files/move`, { to, from });
    },
    {
      onMutate: async ({ to, from }) => {
        await queryClient.cancelQueries({ queryKey: ['files'] });
        const previousFiles = queryClient.getQueryData<UserDataDTO>(['files']);

        const updater = (userDataDto?: UserDataDTO): UserDataDTO => {
          if (!userDataDto) return previousFiles!;
          const { files, recent } = userDataDto;

          const fromFile = files.find((f) => f.path === from);
          if (!fromFile) return userDataDto;

          const isMovingFolder = fromFile.type === 'folder';
          if (isMovingFolder) {
            const diff = Object.values(files).reduce(
              (acc, curr) => {
                const isMoving = curr.path.startsWith(from);
                if (isMoving) {
                  const newPath = Files.path(
                    to,
                    Files.relative(curr.path, Files.parent(from)),
                  );
                  acc.update.files.push({ ...curr, path: newPath });
                  acc.delete.push(curr.path);
                  const isMovingRecent = curr.path === recent.path;
                  if (isMovingRecent) {
                    acc.update.recent = { ...recent, path: newPath };
                  }
                }
                return acc;
              },
              {
                update: { files: [] } as Record<string, any>,
                delete: [] as string[],
              },
            );

            const newFiles = files
              .filter((f) => !diff.delete.includes(f.path))
              .concat(diff.update.files);
            return { recent: diff.update.recent, files: newFiles };
          }

          const newPath = Files.path(to, Files.name(from));
          const newFile = { ...fromFile, path: newPath };
          const isMovingRecent = fromFile.path === recent.path;
          const newRecent = isMovingRecent ? newFile : recent;
          const newFiles = files.filter((f) => f.path !== from).concat(newFile);

          return {
            recent: newRecent,
            files: newFiles,
          };
        };
        queryClient.setQueryData(['files'], updater);

        return { previousFiles };
      },
      onError: (_err, _newFile, context: any) => {
        queryClient.setQueryData(['files'], context.previousFiles);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['files'] });
      },
    },
  );
};
