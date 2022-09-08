import { unstable_getServerSession } from "next-auth/next";
import { authOptions, redis } from "../auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).end();
  }

  if (req.method === "GET") {
    const keys = (await redis.keys(`file:${session!.user!.email}:*`)) || [];
    const files = await Promise.all(
      keys.map(async (key) => await redis.get(key))
    );

    return res.status(200).json({ files });
  }

  if (req.method === "PUT") {
    const newFileSchema = newNode.safeParse(req.body);

    if (!newFileSchema.success) {
      return res.status(400).end();
    }
    const { path, type } = newFileSchema.data;
    const redisPath = `file:${session!.user!.email}:${path}`;
    const name = path.split("/").pop();

    if (await redis.exists(redisPath)) {
      return res.status(409).end();
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

    await redis.set(redisPath, newEntity);

    return res.status(200).end();
  }

  if (req.method === "POST") {
    const schema = node.safeParse(req.body);
    if (!schema.success) {
      return res.status(400).end();
    }

    const redisPath = `file:${session!.user!.email}:${schema.data.path}`;
    await redis.set(redisPath, schema.data);
    res.status(200).end();
  }

  if (req.method === "DELETE") {
    const schema = deleteFile.safeParse(req.query.path);
    if (!schema.success) {
      return res.status(400).end();
    }

    const redisPath = `file:${session!.user!.email}:${schema.data}`;

    await redis.del(redisPath);
    res.status(200).end();
  }
}
