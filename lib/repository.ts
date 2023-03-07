import { Redis } from "@upstash/redis";
import { DEFAULT_FUNCTION } from "constants/defaultFunction";
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
  sharedId?: string
}

export type NewFile = Omit<File, "id">;

export type Files = Record<string, File>;

export type UserData = {
  recent: string;
  files: Files;
}

type UserDataInRedis = { recent: string; } & Record<`/${string}`, File>;

function addQuotes(text: string) {
  return `"${text}"`;
}

export async function getUserData(userId: string) {
  const userData = await getRedis().hgetall(`user:${userId}`) as UserDataInRedis;
  if (!userData) return null;
  return {
    recent: userData.recent,
    files: Object.fromEntries(Object.entries(userData).filter(([key]) => key !== "recent"))
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
  return await getFile(userId, path) !== null;
}

async function createDefaultUserIfNotExists(userId: string) {
  const userData = await getUserData(userId);
  if (userData !== null) return null;
  const DEFAULT_FILE = { ast: DEFAULT_FUNCTION, type: "file", path: "/main" } as File;
  const DEFAULT_USERDATA = { ["/main"]: DEFAULT_FILE, recent: "/main" } as UserDataInRedis;

  return await getRedis().hset(`user:${userId}`, DEFAULT_USERDATA);
}

export async function updateFileAndRecent(userId: string, file: NewFile) {
  const newFile = await createDefaultUserIfNotExists(userId);
  if (newFile) return newFile;

  const path = file.path;

  const updatedFile = await getRedis().hset(`user:${userId}`, { [path]: file, recent: path });
  return updatedFile;
}

export async function deleteFile(userId: string, path: string) {
  const filesInRedis = await getFiles(userId);
  const paths = Object.keys(filesInRedis || {});
  if (paths.length === 1) return false;
  await getRedis().hdel(`user:${userId}`, path);
  await getRedis().hset(`user:${userId}`, { recent: paths[0] })
  return true;
}

type SharedFile = { key: string; path: string; };

export async function shareFile(userId: string, path: string) {
  const id = makeId();

  const file = await getFile(userId, path);
  getRedis().hset(`user:${userId}`, { [path]: { ...file, sharedId: id } });
  getRedis().json.set(`shared:${id}`, "$", { key: `user:${userId}`, path });

  return id;
}

export async function getSharedFile(id: string) {
  const sharedFile = await getRedis().json.get(`shared:${id}`) as SharedFile;
  if (!sharedFile) return null;
  const { key, path } = sharedFile;

  return await getRedis().hget(key, path) as File;
}


