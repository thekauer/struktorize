import { Redis } from '@upstash/redis';
import { DEFAULT_FUNCTION } from '@/constants/defaultFunction';
import { Ast } from './ast';
import { makeId } from './serverUtils';

let redis: Redis;
export function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

export type File = {
  ast: Ast;
  type: 'file' | 'folder';
  path: string;
  sharedId?: string;
};

export type NewFile = Omit<File, 'id'>;

export type Files = Record<string, File>;

export type UserData = {
  recent: string;
  files: Files;
};

type UserDataInRedis = { recent: string } & Record<`/${string}`, File>;

export async function getUserData(userId?: string) {
  if (!userId) return null;
  const userData = (await getRedis().hgetall(
    `user:${userId}`,
  )) as UserDataInRedis;
  if (!userData) return null;
  return {
    recent: userData.recent,
    files: Object.fromEntries(
      Object.entries(userData).filter(([key]) => key !== 'recent'),
    ),
  } as UserData;
}

export async function getFiles(userId: string): Promise<Files | null> {
  const userData = await getUserData(userId);
  return userData?.files || null;
}

export async function getFile(userId: string, path: string) {
  const files = await getFiles(userId);
  return files?.[path] || null;
}

export async function doesFileExist(userId: string, path: string) {
  return (await getFile(userId, path)) !== null;
}

async function createDefaultUserIfNotExists(userId: string) {
  const userData = await getUserData(userId);
  if (userData !== null) return null;
  const DEFAULT_FILE = {
    ast: DEFAULT_FUNCTION,
    type: 'file',
    path: '/main',
  } as File;
  const DEFAULT_USERDATA = {
    ['/main']: DEFAULT_FILE,
    recent: '/main',
  } as UserDataInRedis;

  return await getRedis().hset(`user:${userId}`, DEFAULT_USERDATA);
}

export async function updateFile(userId: string, file: NewFile) {
  const path = file.path;

  const updatedFile = await getRedis().hset(`user:${userId}`, {
    [path]: file,
  });
  return updatedFile;
}

export async function updateFileAndRecent(
  userId: string,
  file: NewFile,
  recent?: string,
) {
  const newFile = await createDefaultUserIfNotExists(userId);
  if (newFile) return newFile;

  const path = file.path;

  const updatedFile = await getRedis().hset(`user:${userId}`, {
    [path]: file,
    recent: recent || path,
  });
  return updatedFile;
}

export async function deleteFile(userId: string, path: string) {
  const userData = await getUserData(userId);
  const filesInRedis = userData?.files;
  const paths = Object.keys(filesInRedis || {})
    .sort((a, b) => a.localeCompare(b))
    .filter((p) => p !== path);
  if (paths.length === 0) return false;
  const file = filesInRedis![path];

  await getRedis().hdel(`user:${userId}`, path);
  if (userData?.recent === path)
    await getRedis().hset(`user:${userId}`, { recent: paths[0] });
  if (file.sharedId) await getRedis().json.del(`shared:${file.sharedId}`);

  return true;
}

type SharedFile = { key: string; path: string };

export async function shareFile(userId: string, path: string) {
  const id = makeId();

  try {
    const shareResult = getRedis().json.set(`shared:${id}`, '$', {
      key: `user:${userId}`,
      path,
    });
    if (shareResult === null) return null;

    const file = await getFile(userId, path);
    if (file === null) return null;

    const addIdResult = getRedis().hset(`user:${userId}`, {
      [path]: { ...file, sharedId: id },
    });
    if (addIdResult === null) return null;

    return id;
  } catch (err) {
    return null;
  }
}

export async function getSharedFile(id: string) {
  const sharedFile = (await getRedis().json.get(`shared:${id}`)) as SharedFile;
  if (!sharedFile) return null;
  const { key, path } = sharedFile;

  return (await getRedis().hget(key, path)) as File;
}
export async function getRecent(userId: string) {
  const userData = await getUserData(userId);
  return userData?.recent || null;
}

export async function setRecent(userId: string, path: string) {
  return await getRedis().hset(`user:${userId}`, {
    recent: path,
  });
}
