import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserDataDTO } from '@/api/files/route';
import { useSession } from 'next-auth/react';

export const useFiles = () => {
  const queryClient = useQueryClient();
  const { status } = useSession();

  const { data, refetch, isLoading } = useQuery(
    ['files'],
    () => axios.get<UserDataDTO>('/api/files').then((res) => res.data),
    {
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
    isLoading,
    files,
    recent,
    setActivePath,
  };
};
