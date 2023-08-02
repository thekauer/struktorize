import z from 'zod';
import {
  astSchmea,
  BadRequest,
  Conflict,
  getBody,
  NotFound,
  Ok,
  Unauthorized,
} from 'lib/serverUtils';
import {
  deleteFile,
  doesFileExist,
  getUserData,
  updateFile,
  updateFileAndRecent,
} from 'lib/repository';
import { auth } from '@/auth/auth';

const rename = z.object({
  ast: astSchmea,
  from: z.string(),
  to: z.string(),
});

export type RenameDTO = z.infer<typeof rename>;

export const POST = auth(async (req) => {
  const user = req.auth.user;

  if (!user) {
    return Unauthorized();
  }

  const userId = user.id;

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
});

export const runtime = 'edge';
