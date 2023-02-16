import { Redis } from "@upstash/redis";
import { BadRequest, NotFound, Ok, Unauthorized, makeId, getBody, getRedis, jsonSchema, Conflict } from "lib/serverUtils";
import { getToken, JWT } from "next-auth/jwt";
import { NextRequest } from "next/server";
import z from "zod";
import { Ast } from "../../../lib/ast";

const file = z.object({
  type: z.literal("file"),
  path: z.string(),
  ast: jsonSchema,
});

export type File = {
  ast: Ast;
  type: "file";
  path: string;
  id: string
}

export type FileDTO = Omit<File, "id">;
export type FilesDTO = FileDTO[];

const newFile = z.object({
  type: z.literal("file"),
  path: z.string().min(2),
});

export type NewFileDto = z.infer<typeof newFile>;

export type Files = {
  file: File;
  files: File[];
};

const pathParam = z.string();

const get = async (req: NextRequest, token: JWT, redis: Redis,) => {
  const key = `files:${token.id}`;

  const param = req.nextUrl.searchParams.get("path");
  if (param !== null) {
    const path = pathParam.safeParse(param);
    if (!path.success) {
      return BadRequest("Invalid path");
    }

    const file = await redis.hget(key, path.data);
    if (file === null) {
      return NotFound();
    }

    return Ok({ file });
  }

  const hash = await redis.hgetall(key);
  if (!hash) {
    return new Response(JSON.stringify({ files: [], file: undefined }), {
      status: 200,
    });
  }

  const files = Object.entries<{ path: string } & any>(hash)
    .filter(([key]) => key !== "recent")
    .map(([, value]) => value)
    .sort((a, b) => b.path.localeCompare(a.path));
  const file = hash[hash.recent as string] || Object.values(hash)[0];

  return Ok({ files, file });

}

const put = async (req: NextRequest, token: JWT, redis: Redis) => {
  const key = `files:${token.id}`;

  const body = await getBody(req);
  const newFileSchema = newFile.safeParse(body);

  if (!newFileSchema.success) {
    return BadRequest();
  }
  const { path, type } = newFileSchema.data;
  const name = path.split("/").pop();

  if (await redis.hexists(key, path)) {
    return Conflict();
  }

  const ast = {
    signature: {
      text: `\\text{${name}}()`,
      type: "signature",
      path: "signature",
    },
    body: [],
    type: "function",
    path: "",
  };

  const newEntity: File = {
    path,
    type,
    ast: type === "file" ? (ast as any) : undefined,
    id: makeId(token.id as string),
  };

  await redis.hset(key, { [path]: newEntity, recent: path });

  return Ok();
}

const post = async (req: NextRequest, token: JWT, redis: Redis) => {
  const key = `files:${token.id}`;
  const body = await getBody(req);

  const schema = file.safeParse(body);
  if (!schema.success) {
    return BadRequest();
  }

  await redis.hset(key, {
    [schema.data.path]: schema.data,
    recent: schema.data.path,
  });
  return Ok();
}

const del = async (req: NextRequest, token: JWT, redis: Redis) => {
  const key = `files:${token.id}`;

  const schema = pathParam.safeParse(req.nextUrl.searchParams.get("path"));
  if (!schema.success) {
    return BadRequest();
  }

  await redis.hdel(key, schema.data);
  return Ok();
}

export default async function handler(req: NextRequest) {
  const redis = getRedis();
  const token = await getToken({ req });

  if (!token) {
    return Unauthorized();
  }

  switch (req.method) {
    case "GET": return get(req, token, redis);
    case "PUT": return put(req, token, redis);
    case "POST": return post(req, token, redis);
    case "DELETE": return del(req, token, redis);
  }

  return BadRequest();
}

export const config = {
  runtime: "experimental-edge",
};
