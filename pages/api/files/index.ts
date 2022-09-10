import { Redis } from "@upstash/redis";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import z from "zod";
import { Ast } from "../../../lib/ast";

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

const file = z.object({
  type: z.literal("file"),
  path: z.string(),
  ast: jsonSchema,
});

const folder = z.object({
  type: z.literal("folder"),
  path: z.string(),
});

const node = z.union([file, folder]);

export type FileDTO = {
  ast: Ast;
  type: "file";
  path: string;
};
export type FolderDTO = z.infer<typeof folder>;
export type NodeDTO = FileDTO | FolderDTO;

export type NodesDTO = NodeDTO[];

const newNode = z.object({
  type: z.union([z.literal("file"), z.literal("folder")]),
  path: z.string().min(2),
});

export type newNodeDTO = z.infer<typeof newNode>;

const deleteFile = z.string();

const getBody = async (req: NextRequest) => {
  const blob = await req.blob();
  const text = await blob.text();
  const body = JSON.parse(text);
  return body;
};

export default async function handler(req: NextRequest) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  const token = await getToken({ req });

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const key = `files:${token.email}`;

  if (req.method === "GET") {
    const hash = await redis.hgetall(key);
    if (!hash) {
      return new Response("Not found", { status: 404 });
    }

    const files = Object.values(hash);
    return new Response(JSON.stringify({ files }), { status: 200 });
  }

  if (req.method === "PUT") {
    console.log("hit");
    const body = await getBody(req);
    const newFileSchema = newNode.safeParse(body);

    if (!newFileSchema.success) {
      return new Response("Bad Request", { status: 400 });
    }
    const { path, type } = newFileSchema.data;
    const name = path.split("/").pop();

    if (await redis.hexists(key, path)) {
      return new Response("Conflict", { status: 409 });
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

    const newEntity: NodeDTO = {
      path,
      type,
      ast: type === "file" ? (ast as any) : undefined,
    };

    await redis.hmset(key, { path: newEntity });

    return new Response("OK", { status: 200 });
  }

  if (req.method === "POST") {
    const body = await getBody(req);

    const schema = node.safeParse(body);
    if (!schema.success) {
      return new Response("Bad Request", { status: 400 });
    }

    await redis.hset(key, { [schema.data.path]: schema.data });
    return new Response("OK", { status: 200 });
  }

  if (req.method === "DELETE") {
    const schema = deleteFile.safeParse(req.nextUrl.searchParams.get("path"));
    if (!schema.success) {
      return new Response("Bad Request", { status: 400 });
    }

    await redis.hdel(key, schema.data);
    return new Response("OK", { status: 200 });
  }
}

export const config = {
  runtime: "experimental-edge",
};
