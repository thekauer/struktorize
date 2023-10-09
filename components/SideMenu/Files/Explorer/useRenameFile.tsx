import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserDataDTO } from '@/api/files/route';
import { File } from '@/lib/repository';
import { Ast } from '@/lib/ast';

export const useRenameFile = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ to, from, ast }: { to: string; from: string; ast: Ast }) => {
      return axios.post(`/api/files/rename`, { to, from, ast });
    },
    {
      onMutate: async ({ to, from, ast }) => {
        await queryClient.cancelQueries({ queryKey: ['files'] });
        const previousFiles = queryClient.getQueryData<UserDataDTO>(['files']);

        const updater = (userDataDto?: UserDataDTO): UserDataDTO => {
          if (!userDataDto) return previousFiles!;
          const { files, recent } = userDataDto;

          const isMovingIntoFolder =
            to === '/' || files.find((f) => f.path === to)?.type === 'folder';

          const fromName = from.split('/').pop();
          const newPath = isMovingIntoFolder
            ? `${to === '/' ? '' : to}/${fromName}`
            : to;

          const renamedFile: File = {
            path: newPath,
            ast: ast,
            type: files.find((f) => f.path === from)?.type || 'file',
          };
          const filesAndRenamedFile = [
            ...files.filter((f) => f.path !== from),
            renamedFile,
          ];
          return { recent, files: filesAndRenamedFile };
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
