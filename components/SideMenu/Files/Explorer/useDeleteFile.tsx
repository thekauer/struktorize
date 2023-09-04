import { useAst } from '@/hooks/useAST';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserDataDTO } from '@/api/files/route';

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  const { load } = useAst();

  return useMutation(
    (path: string) => {
      return axios.delete(`/api/files?path=${path}`);
    },
    {
      onMutate: async (path) => {
        await queryClient.cancelQueries({ queryKey: ['files'] });
        const previousFiles = queryClient.getQueryData<UserDataDTO>(['files']);

        const updater = (userDataDto?: UserDataDTO): UserDataDTO => {
          if (!userDataDto) return previousFiles!;
          const { files } = userDataDto;

          const filesWithoutFile = files.filter((f) => f.path !== path);
          const nextFile = filesWithoutFile[0];
          load(nextFile.ast as any, nextFile.path);
          return {
            recent: nextFile,
            files: filesWithoutFile,
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
