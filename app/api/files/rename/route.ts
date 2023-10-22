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
  getRedis,
  getUserData,
  updateFile,
  updateFileAndRecent,
  UserData,
} from 'lib/repository';
import { auth } from '@/auth/auth';

const rename = z.object({
  from: z.string(),
  to: z.string(),
});

export type RenameDTO = z.infer<typeof rename>;

const renameFile = async (
  userId: string,
  userData: UserData,
  from: string,
  to: string,
) => {
  const oldFile = userData?.files[from];
  if (!oldFile) {
    return NotFound('File not found');
  }

  if (await doesFileExist(userId, to)) {
    return Conflict('File already exists');
  }

  const newFile = { ...oldFile, path: to };

  const recentWillChange = from === userData.recent;

  if (recentWillChange) await updateFileAndRecent(userId, newFile);
  else await updateFile(userId, newFile);

  await deleteFile(userId, from);

  return Ok();
};

const renameFolder = async (
  userId: string,
  userData: UserData,
  from: string,
  to: string,
) => {
  const recentWillChange = from === userData.recent;
  const diff = Object.values(userData.files).reduce((acc, curr) => {
    const isMoving = curr.path.startsWith(from);
    if (isMoving) {
      const newPath = curr.path.replace(from, to);
      acc[newPath] = { ...curr, path: newPath };
    }
    return acc;
  }, {} as Record<string, any>);

  if (recentWillChange) {
    diff.recent = userData.recent.replace(from, to);
  }

  const oldPaths = Object.keys(userData.files).filter((path) =>
    path.startsWith(from),
  );

  const tx = getRedis().multi();
  tx.hset(`user:${userId}`, diff);
  for (const path of oldPaths) {
    tx.hdel(`user:${userId}`, path);
  }
  await tx.exec();
  return Ok();
};

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
  if (!userData) return NotFound('User not found');

  const isRenamingFolder = userData?.files[from]?.type === 'folder';
  if (isRenamingFolder) return renameFolder(userId, userData, from, to);
  return renameFile(userId, userData, from, to);
});

export const runtime = 'edge';
