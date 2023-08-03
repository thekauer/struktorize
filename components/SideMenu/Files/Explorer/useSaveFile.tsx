import { useAst } from '@/hooks/useAST';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FileDTO, UserDataDTO } from '@/api/files/route';

export const useSaveFile = () => {
  const queryClient = useQueryClient();
  const { save } = useAst();

  return useMutation(
    (file: FileDTO) => {
      return axios['put']('/api/files', file);
    },
    {
      onMutate: async (file) => {
        await queryClient.cancelQueries({ queryKey: ['files'] });
        const previousFiles = queryClient.getQueryData<UserDataDTO>(['files']);

        const updater = (userDataDto?: UserDataDTO): UserDataDTO => {
          if (!userDataDto) return previousFiles!;
          const { files, recent } = userDataDto;

          return {
            recent,
            files: [...files.filter((f) => f.path !== file.path), file],
          };
        };
        queryClient.setQueryData(['files'], updater);

        save();
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
