import { Redis } from "@upstash/redis";
import { Ast } from "./ast";
import { makeId } from "./serverUtils";

let redis: Redis;
export function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

  }
  return redis;
};

export type File = {
  ast: Ast;
  type: "file";
  path: string;
  id: string
}

export type NewFile = Omit<File, "id">;

export type Files = Record<string, File>;

export type UserData = {
  recent: string;
  files: Files;
  userId: string;
}

export async function getUserData(userId: string): Promise<UserData | null> {
  return await getRedis().hgetall(`user:${userId}`) as UserData;
}

export async function getFiles(userId: string): Promise<Files | null> {
  return await getRedis().hget(`user:${userId}`, "files");
}

export async function getFile(userId: string, path: string) {
  const files = await getFiles(userId);
  if (!files) return null;

  return Object.values(files).find((file: File) => file.path === path) || null;
}

export async function doesFileExist(userId: string, path: string) {
  return await getFile(userId, path) !== null;
}

export async function newFile(userId: string, newFileEntity: NewFile) {
  const path = newFileEntity.path;
  return await redis.hset(`user:${userId}`, { files: { [path]: { ...newFileEntity, id: makeId(`${userId} ${path}`) } }, recent: path });
}

export async function updateFileAndRecent(userId: string, file: NewFile) {
  const path = file.path;

  return await getRedis().hset(`user:${userId}`, {
    files: { [path]: file },
    recent: path,
  });

}

export async function deleteFile(userId: string, path: string) {
  return await getRedis().hdel(`user:${userId}`, `files ${path}`);
}

