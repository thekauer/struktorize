import { getFile, shareFile } from 'lib/repository';
import {
  BadRequest,
  Created,
  getBody,
  getToken,
  InternalServerError,
  NotAllowed,
  NotFound,
  Ok,
  Unauthorized,
} from 'lib/serverUtils';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const shareValidator = z.object({
  path: z.string(),
});

export type ShareBody = z.infer<typeof shareValidator>;
export type ShareResponse = { code: string };

export type ShareDTO = {
  id: string;
};

export default async function handler(req: NextRequest) {
  const token = await getToken(req);

  if (!token) {
    return Unauthorized();
  }

  try {
    if (req.method !== 'POST') throw NotAllowed();
  } catch (err) {
    return err;
  }

  const body = await getBody(req);
  const shareSchema = shareValidator.safeParse(body);
  if (!shareSchema.success) {
    return BadRequest();
  }
  const { path } = shareSchema.data;
  const userId = token.id;

  const file = await getFile(userId, path);
  if (!file) {
    return NotFound();
  }

  if (file.sharedId) {
    return Ok({ id: file.sharedId });
  }

  const id = await shareFile(userId, path);
  if (id === null) return InternalServerError();

  return Created({ id });
}

export const config = {
  runtime: 'experimental-edge',
};
