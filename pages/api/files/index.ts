import { unstable_getServerSession } from "next-auth/next";
import { authOptions, redis } from "../auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export type FilesDTO = {
  name: string;
  path: string;
};

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

const file = z.object({
  type: z.union([z.literal("file"), z.literal("folder")]),
  name: z.string(),
  path: z.string(),
  ast: jsonSchema,
});

export type FileDTO = z.infer<typeof file>;

const newFile = z.object({
  type: z.union([z.literal("file"), z.literal("folder")]),
  name: z.string(),
  path: z.string(),
});

export type NewFileDTO = z.infer<typeof newFile>;

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
    const files = keys.map((key) => ({
      name: key.substring(key.lastIndexOf("/") + 1),
      path: key.substring(key.lastIndexOf(":") + 1),
    }));

    return res.status(200).json({ files });
  }

  if (req.method === "PUT") {
    const newFileSchema = newFile.safeParse(req.body);

    if (!newFileSchema.success) {
      return res.status(400).end();
    }
    const { name, path, type } = newFileSchema.data;
    const redisPath = `file:${session!.user!.email}:${path}${name}`;

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

    const newEntity = {
      name,
      path,
      type,
      ast: type === "file" ? ast : undefined,
    };

    await redis.set(redisPath, newEntity);

    return res.status(200).end();
  }

  if (req.method === "POST") {
    const schema = file.safeParse(req.body);
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
      console.log(schema.error);
      return res.status(400).end();
    }

    const redisPath = `file:${session!.user!.email}:${schema.data}`;

    await redis.del(redisPath);
    res.status(200).end();
  }
}
