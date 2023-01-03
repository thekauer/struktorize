import { NextRequest } from "next/server";
import { getBody, getRedis } from ".";
import { getToken } from "next-auth/jwt";
import z from "zod";

const move = z.object({
  from: z.string(),
  to: z.string(),
});

export type MoveDTO = z.infer<typeof move>;

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
  const moveSchema = move.safeParse(body);
  if (!moveSchema.success) {
    return new Response("Invalid schema", { status: 400 });
  }

  const from = moveSchema.data.from.replace(/^\//, "");
  const to = moveSchema.data.to.replace(/^\//, "");

  const file = await redis.hget(key, from);
  if (file === null) {
    return new Response("File not found", { status: 404 });
  }

  const fileExists = await redis.hget(key, to);
  if (fileExists !== null) {
    return new Response("File already exists", { status: 409 });
  }

  await redis.hset(key, { [to]: file });
  await redis.hdel(key, from);

  return new Response("OK", { status: 200 });
}

export const config = {
  runtime: "experimental-edge",
};
