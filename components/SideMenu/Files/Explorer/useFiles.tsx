import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UserDataDTO } from '@/api/files/route';
import { useSession } from 'next-auth/react';

export const useFiles = () => {
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

  return {
    refetch,
    isLoading,
    files,
    recent,
  };
};
