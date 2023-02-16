import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import z from "zod";
import { BadRequest, Conflict, getBody, getRedis, jsonSchema, NotAllowed, NotFound, Ok } from "lib/serverUtils";

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
    return NotAllowed();

  const body = await getBody(req);
  const moveSchema = rename.safeParse(body);
  if (!moveSchema.success) {
    return BadRequest("Invalid schema");
  }

  const { from, to, ast } = moveSchema.data;

  const oldFile = await redis.hget(key, from);
  if (oldFile === null) {
    return NotFound("File not found");
  }

  const fileExists = await redis.hget(key, to);
  if (fileExists !== null) {
    return Conflict("File already exists");
  }

  const newFile = { path: to, type: "file", ast };

  await redis.hset(key, { [to]: newFile, recent: to });
  await redis.hdel(key, from);

  return Ok();
}

export const config = {
  runtime: "experimental-edge",
};
