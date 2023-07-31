import { auth } from '@/auth/auth';
import { Ast } from 'lib/ast';
import {
  getFile,
  getUserData,
  File,
  doesFileExist,
  updateFileAndRecent,
  deleteFile,
} from 'lib/repository';
import {
  BadRequest,
  NotFound,
  Ok,
  Unauthorized,
  getBody,
  Conflict,
  astSchmea,
  Created,
} from 'lib/serverUtils';
import { NextRequest } from 'next/server';
import z from 'zod';

export type FilesDTO = FileDTO[];

const pathParam = z.string();

export type UserDataDTO = {
  recent: File;
  files: File[];
};

export const GET = auth(async (req) => {
  const user = req.auth.user;

  if (!user) {
    return Unauthorized();
  }

  const userId = user.id;

  const param = req.nextUrl.searchParams.get('path');
  if (param !== null) {
    const path = pathParam.safeParse(param);
    if (!path.success) {
      return BadRequest('Invalid path');
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
    b.path.localeCompare(a.path),
  );
  const recent =
    userData.files[userData.recent] || Object.values(userData.files)[0];

  return Ok({ files, recent });
});

const fileValidator = z.object({
  type: z.literal('file'),
  path: z.string(),
  ast: astSchmea,
  recent: z.string().optional(),
});

export type FileDTO = z.infer<typeof fileValidator>;

export const PUT = auth(async (req) => {
  const user = req.auth.user;

  if (!user) {
    return Unauthorized();
  }

  const userId = user.id;
  const body = await getBody(req);

  const schema = fileValidator.safeParse(body);
  if (!schema.success) {
    return BadRequest();
  }

  await updateFileAndRecent(userId, schema.data, schema.data.recent);
  return Ok();
});

const newFileValidator = z.object({
  type: z.literal('file'),
  path: z.string(),
  ast: astSchmea.optional(),
});

export type NewFileDTO = z.infer<typeof newFileValidator>;

export const POST = auth(async (req) => {
  const user = req.auth.user;

  if (!user) {
    return Unauthorized();
  }

  const userId = user.id;
  const body = await getBody(req);

  const schema = newFileValidator.safeParse(body);
  if (!schema.success) {
    return BadRequest();
  }

  const { data: file } = schema;

  if (await doesFileExist(userId, file.path)) {
    return Conflict();
  }

  const name = file.path.split('/').pop();
  const ast = {
    signature: {
      text: [{ type: 'variable', name: `${name}` }],
      type: 'signature',
      path: 'signature',
    },
    body: [],
    type: 'function',
    path: '',
  } as Ast;

  await updateFileAndRecent(userId, { ...file, ast: file.ast || ast });
  return Created();
});

export const DELETE = auth(async (req) => {
  const user = req.auth.user;

  if (!user) {
    return Unauthorized();
  }

  const userId = user.id;

  const pathValidator = pathParam.safeParse(
    req.nextUrl.searchParams.get('path'),
  );
  if (!pathValidator.success) {
    return BadRequest();
  }

  const path = pathValidator.data;

  await deleteFile(userId, path);
  return Ok();
});

export const runtime = 'edge';
