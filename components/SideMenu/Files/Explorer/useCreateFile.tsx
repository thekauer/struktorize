import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { NewFileDTO, UserDataDTO } from '@/api/files/route';
import { File } from '@/lib/repository';

export const useCreateFile = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (newFile: NewFileDTO) => {
      return axios.post('/api/files', newFile);
    },
    {
      onMutate: async (newFile) => {
        await queryClient.cancelQueries({ queryKey: ['files'] });
        const previousFiles = queryClient.getQueryData<UserDataDTO>(['files']);

        const updater = (userDataDto?: UserDataDTO): UserDataDTO => {
          if (!userDataDto) return previousFiles!;
          const { files, recent } = userDataDto;

          return {
            recent,
            files: [...files, newFile as File],
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
