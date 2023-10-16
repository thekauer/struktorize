import { useAst, useAstState } from '@/hooks/useAST';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FileDTO, UserDataDTO } from '@/api/files/route';

export const useSaveCurrentFile = () => {
  const queryClient = useQueryClient();
  const { save } = useAst();
  const { ast, path } = useAstState();
  const file: FileDTO = { type: 'file', ast, path };

  return useMutation(
    () => {
      return axios['put']('/api/files', file);
    },
    {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: ['files'] });
        const previousFiles = queryClient.getQueryData<UserDataDTO>(['files']);

        const updater = (userDataDto?: UserDataDTO): UserDataDTO => {
          if (!userDataDto) return previousFiles!;
          const { files, recent } = userDataDto;
          const filesWithNewFile = files.filter((f) => f.path !== path);
          filesWithNewFile.push(file);
          const isRecent = recent.path === path;
          const newRecent = isRecent ? { ...recent, ast } : recent;

          return {
            recent: newRecent,
            files: filesWithNewFile,
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
