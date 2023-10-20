import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserDataDTO } from '@/api/files/route';
import { RenameDTO } from '@/api/files/rename/route';
import * as Files from '@/lib/files';

export const useRenameFile = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ to, from }: RenameDTO) => {
      return axios.post(`/api/files/rename`, { to, from });
    },
    {
      onMutate: async ({ to, from }) => {
        await queryClient.cancelQueries({ queryKey: ['files'] });
        const previousFiles = queryClient.getQueryData<UserDataDTO>(['files']);

        const updater = (userDataDto?: UserDataDTO): UserDataDTO => {
          if (!userDataDto) return previousFiles!;
          const { files, recent } = userDataDto;

          const fromFile = files.find((f) => f.path === from)!;
          const isRenamingFolder = fromFile.type === 'folder';
          if (isRenamingFolder) {
            debugger;
            const diff = Object.values(files).reduce(
              (acc, curr) => {
                const isRenaming = curr.path.startsWith(fromFile.path);
                if (isRenaming) {
                  const newPath = Files.path(
                    to,
                    Files.relative(curr.path, fromFile.path),
                  );
                  acc.update.files.push({ ...curr, path: newPath });
                  acc.delete.push(curr.path);
                  const isRenamingRecent = curr.path === recent.path;
                  if (isRenamingRecent) {
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
              .concat(diff.update.files)
              .sort((a, b) => a.path.localeCompare(b.path));

            return { recent: diff.update.recent, files: newFiles };
          }

          const newPath = Files.path(to, Files.name(fromFile.path));
          const newFile = { ...fromFile, path: newPath };
          const isRenamingRecent = fromFile.path === recent.path;
          const filesAndRenamedFile = files
            .filter((f) => f.path !== fromFile.path)
            .concat(newFile);

          const newRecent = isRenamingRecent ? newFile : recent;

          return { recent: newRecent, files: filesAndRenamedFile };
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
