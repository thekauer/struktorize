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

function unwrap<T>(result: T[] | null) {
  return result?.[0] || null;
}

function addQuotes(text: string) {
  return `"${text}"`;
}

export async function getUserData(userId: string) {
  return await getRedis().json.get(`user:${userId}`, "$").then(unwrap<UserData>);
}

export async function getFiles(userId: string): Promise<Files | null> {
  return await getRedis().json.get(`user:${userId}`, "$.files");
}

export async function getFile(userId: string, path: string) {
  return await getRedis().json.get(`user:${userId}`, `$.files["${path}"]`).then(unwrap<File>);
}

export async function doesFileExist(userId: string, path: string) {
  return await getFile(userId, path) !== null;
}

async function createDefaultUserIfNotExists(userId: string) {
  const DEFAULT_FILE = { ast: DEFAULT_FUNCTION, type: "file", path: "/main" } as File;
  const DEFAULT_USERDATA = { files: { ["/main"]: DEFAULT_FILE }, recent: "/main" } as UserData;

  return await getRedis().json.set(`user:${userId}`, '$', DEFAULT_USERDATA, { nx: true });
}

export async function updateFileAndRecent(userId: string, file: NewFile) {
  const result = await createDefaultUserIfNotExists(userId);
  if (result === "OK") {
    return result;
  }

  const path = file.path;

  const updatedFile = await getRedis().json.set(`user:${userId}`, `$.files["${path}"]`, file);
  await getRedis().json.set(`user:${userId}`, `$.recent`, addQuotes(path));
  return updatedFile;
}

export async function deleteFile(userId: string, path: string) {
  return await getRedis().json.del(`user:${userId}`, `$.files["${path}"]`);
}

type SharedFile = { key: string; path: string; };

export async function shareFile(userId: string, path: string) {
  const id = makeId();

  const pipeline = getRedis().multi();
  pipeline.json.set(`user:${userId}`, `$.files["${path}"].sharedId`, addQuotes(id));
  pipeline.json.set(`shared:${id}`, "$", { key: `user:${userId}`, path });
  await pipeline.exec();

  return id;
}

export async function getSharedFile(id: string) {
  const sharedFile = await getRedis().json.get(`shared:${id}`) as SharedFile;
  if (!sharedFile) return null;
  const { key, path } = sharedFile;

  return await getRedis().json.get(key, `$.files["${path}"]`).then(unwrap<File>);
}


