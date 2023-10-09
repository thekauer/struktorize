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

const rename = z.union([
  z.object({
    ast: astSchmea,
    from: z.string(),
    to: z.string(),
  }),
  z.object({
    from: z.string(),
    to: z.string(),
  }),
]);

export type RenameDTO = z.infer<typeof rename>;

export const POST = auth(async (req) => {
  const user = req.auth.user;

  if (!user) {
    return Unauthorized();
  }

  const userId = user.id;

  const body = await getBody(req);
  const renameScema = rename.safeParse(body);
  if (!renameScema.success) {
    return BadRequest('Invalid schema');
  }

  const { from, to } = renameScema.data;

  const userData = await getUserData(userId);
  const oldFile = userData?.files[from];
  if (!oldFile) {
    return NotFound('File not found');
  }

  const isMovingIntoFolder =
    to === '/' || userData?.files[to]?.type === 'folder';
  if (!isMovingIntoFolder && (await doesFileExist(userId, to))) {
    return Conflict('File already exists');
  }

  const type = oldFile.type || 'file';
  const fromName = from.split('/').pop();
  const newPath = isMovingIntoFolder
    ? `${to === '/' ? '' : to}/${fromName}`
    : to;
  const newFile = { path: newPath, type, ast: (renameScema.data as any).ast };

  const recentWillChange = from === userData.recent;

  if (recentWillChange) await updateFileAndRecent(userId, newFile);
  else await updateFile(userId, newFile);

  await deleteFile(userId, from);

  return Ok();
});

export const runtime = 'edge';
