import { NextRequest } from 'next/server';
import z from 'zod';
import {
  astSchmea,
  BadRequest,
  Conflict,
  getBody,
  getToken,
  NotAllowed,
  NotFound,
  Ok,
  Unauthorized,
} from 'lib/serverUtils';
import {
  deleteFile,
  doesFileExist,
  getFile,
  getUserData,
  updateFile,
  updateFileAndRecent,
} from 'lib/repository';

const rename = z.object({
  ast: astSchmea,
  from: z.string(),
  to: z.string(),
});

export type RenameDTO = z.infer<typeof rename>;

export default async function handler(req: NextRequest) {
  const token = await getToken(req);

  if (!token) {
    return Unauthorized();
  }

  const userId = token.id;

  if (req.method !== 'POST') return NotAllowed();

  const body = await getBody(req);
  const moveSchema = rename.safeParse(body);
  if (!moveSchema.success) {
    return BadRequest('Invalid schema');
  }

  const { from, to, ast } = moveSchema.data;

  const userData = await getUserData(userId);
  const oldFile = userData?.files[userData?.recent];
  if (!oldFile) {
    return NotFound('File not found');
  }

  if (await doesFileExist(userId, to)) {
    return Conflict('File already exists');
  }

  const newFile = { path: to, type: 'file' as const, ast };

  const recentWillChange = from === userData.recent;

  if (recentWillChange) await updateFileAndRecent(userId, newFile);
  else await updateFile(userId, newFile);

  await deleteFile(userId, from);

  return Ok();
}

export const config = {
  runtime: 'experimental-edge',
};
