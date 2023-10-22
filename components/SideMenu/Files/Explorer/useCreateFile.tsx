import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { NewFileDTO, UserDataDTO } from '@/api/files/route';
import { File } from '@/lib/repository';
import { Ast } from '@/lib/ast';

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
          if (newFile.type === 'folder') {
            return {
              recent,
              files,
            };
          }

          const path = newFile.path;
          const name = path.substring(path.lastIndexOf('/') + 1);
          const newAst = {
            signature: {
              text:
                name
                  ?.split('')
                  .map((char) => ({ type: 'char', value: char })) ?? [],
              type: 'signature',
              path: 'signature',
            },
            body: [],
            type: 'function',
            path: '',
          } as Ast;

          const file: File = !newFile.ast
            ? { ...newFile, ast: newAst }
            : (newFile as File);

          return {
            recent,
            files: [...files, file],
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
