import { useAst } from '@/hooks/useAST';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserDataDTO } from '@/api/files/route';
import { RecentDTO } from '@/api/files/recent/route';

export const useSelectFile = () => {
  const queryClient = useQueryClient();
  const { load } = useAst();

  return useMutation(
    (path: string) => {
      return axios['post']('/api/files/recent', { path } as RecentDTO);
    },
    {
      onMutate: async (path) => {
        await queryClient.cancelQueries({ queryKey: ['files'] });
        const previousFiles = queryClient.getQueryData<UserDataDTO>(['files']);

        const updater = (userDataDto?: UserDataDTO): UserDataDTO => {
          if (!userDataDto) return previousFiles!;
          const { files, recent } = userDataDto;

          const newRecent = files.find((f) => f.path === path) ?? recent;
          load(newRecent.ast, newRecent.path);

          return {
            recent: newRecent,
            files,
          };
        };
        queryClient.setQueryData(['files'], updater);

        return { previousFiles };
      },
      onError: (_err, _newFile, context: any) => {
        queryClient.setQueryData(['files'], context.previousFiles);
      },
    },
  );
};
