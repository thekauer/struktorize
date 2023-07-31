import { auth } from '@/auth/auth';
import { getFile, shareFile } from 'lib/repository';
import {
  BadRequest,
  Created,
  getBody,
  InternalServerError,
  NotFound,
  Ok,
  Unauthorized,
} from 'lib/serverUtils';
import { z } from 'zod';

const shareValidator = z.object({
  path: z.string(),
});

export type ShareBody = z.infer<typeof shareValidator>;
export type ShareResponse = { code: string };

export type ShareDTO = {
  id: string;
};

export const POST = auth(async (req) => {
  const user = req.auth.user;

  if (!user) {
    return Unauthorized();
  }

  const body = await getBody(req);
  const shareSchema = shareValidator.safeParse(body);
  if (!shareSchema.success) {
    return BadRequest();
  }
  const { path } = shareSchema.data;
  const userId = user.id;

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
});

export const runtime = 'edge';
