import { useAstState } from '@/hooks/useAST';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FileDTO, UserDataDTO } from '@/api/files/route';
import { useSession } from 'next-auth/react';

export const useFiles = () => {
  const queryClient = useQueryClient();
  const { functionName, ast } = useAstState();
  const { status } = useSession();

  const { data, refetch } = useQuery(
    ['files'],
    () => axios.get<UserDataDTO>('/api/files').then((res) => res.data),
    {
      onSuccess: async ({ files }) => {
        const isFirstLoad = files.length === 0;
        if (!isFirstLoad) return;

        const firstFileDto: FileDTO = {
          ast,
          path: `/${functionName}`,
          type: 'file',
        };
        await axios.post('/api/files', firstFileDto);
        queryClient.invalidateQueries(['files']);
      },
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: status === 'authenticated',
    },
  );
  const files = data?.files || [];
  const recent = data?.recent;

  const setActivePath = (recentPath: string) => {
    queryClient.setQueryData(['files'], {
      files,
      recent: files.find((f) => f.path === recentPath) || recent,
    });
  };

  return {
    refetch,
    files,
    recent,
    setActivePath,
  };
};
