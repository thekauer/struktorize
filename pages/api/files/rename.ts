import { NextRequest } from "next/server";
import { getBody, getRedis, jsonSchema } from ".";
import { getToken } from "next-auth/jwt";
import z from "zod";

const rename = z.object({
  ast: jsonSchema,
  from: z.string(),
  to: z.string(),
});

export type RenameDTO = z.infer<typeof rename>;

export default async function handler(req: NextRequest) {
  const redis = getRedis();
  const token = await getToken({ req });

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const key = `files:${token.id}`;

  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  const body = await getBody(req);
  const moveSchema = rename.safeParse(body);
  if (!moveSchema.success) {
    return new Response("Invalid schema", { status: 400 });
  }

  const { from, to, ast } = moveSchema.data;

  const oldFile = await redis.hget(key, from);
  if (oldFile === null) {
    return new Response("File not found", { status: 404 });
  }

  const fileExists = await redis.hget(key, to);
  if (fileExists !== null) {
    return new Response("File already exists", { status: 409 });
  }

  const newFile = { path: to, type: "file", ast };

  await redis.hset(key, { [to]: newFile, recent: to });
  await redis.hdel(key, from);

  return new Response("OK", { status: 200 });
}

export const config = {
  runtime: "experimental-edge",
};