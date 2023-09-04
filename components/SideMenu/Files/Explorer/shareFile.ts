import { ShareDTO } from '@/api/files/share/route';
import axios from 'axios';

export const shareFile = async (path: string) => {
  const {
    data: { id },
  } = await axios.post<ShareDTO>(`/api/files/share/`, { path });
  return id;
};
