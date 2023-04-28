import { Ast } from "lib/ast";
import {
  getFile,
  getUserData,
  File,
  doesFileExist,
  updateFileAndRecent,
  deleteFile,
} from "lib/repository";
import {
  BadRequest,
  NotFound,
  Ok,
  Unauthorized,
  getBody,
  Conflict,
  Token,
  getToken,
  astSchmea,
  Created,
} from "lib/serverUtils";
import { NextRequest } from "next/server";
import z from "zod";

export type FilesDTO = FileDTO[];

const pathParam = z.string();

export type UserDataDTO = {
  recent: File;
  files: File[];
};

const get = async (req: NextRequest, token: Token) => {
  const userId = token.id;

  const param = req.nextUrl.searchParams.get("path");
  if (param !== null) {
    const path = pathParam.safeParse(param);
    if (!path.success) {
      return BadRequest("Invalid path");
    }

    const file = await getFile(userId, path.data);
    if (file === null) {
      return NotFound();
    }

    return Ok({ file });
  }

  const userData = await getUserData(userId);
  if (!userData) {
    return Ok({ files: [], recent: undefined });
  }

  const files = Object.values(userData.files).sort((a, b) =>
    b.path.localeCompare(a.path)
  );
  const recent =
    userData.files[userData.recent] || Object.values(userData.files)[0];

  return Ok({ files, recent });
};

const fileValidator = z.object({
  type: z.literal("file"),
  path: z.string(),
  ast: astSchmea,
  recent: z.string().optional(),
});

export type FileDTO = z.infer<typeof fileValidator>;

const put = async (req: NextRequest, token: Token) => {
  const userId = token.id;
  const body = await getBody(req);

  const schema = fileValidator.safeParse(body);
  if (!schema.success) {
    return BadRequest();
  }

  await updateFileAndRecent(userId, schema.data, schema.data.recent);
  return Ok();
};

const newFileValidator = z.object({
  type: z.literal("file"),
  path: z.string(),
  ast: astSchmea.optional(),
});

export type NewFileDTO = z.infer<typeof newFileValidator>;

const post = async (req: NextRequest, token: Token) => {
  const userId = token.id;
  const body = await getBody(req);

  const schema = newFileValidator.safeParse(body);
  if (!schema.success) {
    return BadRequest();
  }

  const { data: file } = schema;

  if (await doesFileExist(userId, file.path)) {
    return Conflict();
  }

  const name = file.path.split("/").pop();
  const ast = {
    signature: {
      text: [{ type: "variable", name: `${name}` }],
      type: "signature",
      path: "signature",
    },
    body: [],
    type: "function",
    path: "",
  } as Ast;

  await updateFileAndRecent(userId, { ...file, ast: file.ast || ast });
  return Created();
};

const del = async (req: NextRequest, token: Token) => {
  const userId = token.id;

  const pathValidator = pathParam.safeParse(
    req.nextUrl.searchParams.get("path")
  );
  if (!pathValidator.success) {
    return BadRequest();
  }

  const path = pathValidator.data;

  await deleteFile(userId, path);
  return Ok();
};

export default async function handler(req: NextRequest) {
  const token = await getToken(req);

  if (!token) {
    return Unauthorized();
  }

  switch (req.method) {
    case "GET":
      return get(req, token);
    case "PUT":
      return put(req, token);
    case "POST":
      return post(req, token);
    case "DELETE":
      return del(req, token);
  }

  return BadRequest();
}

export const config = {
  runtime: "experimental-edge",
};
