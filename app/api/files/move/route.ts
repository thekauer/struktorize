import z from 'zod';
import {
  BadRequest,
  Forbidden,
  getBody,
  NotFound,
  Ok,
  Unauthorized,
} from 'lib/serverUtils';
import { getRedis, getUserData, UserData } from 'lib/repository';
import { auth } from '@/auth/auth';
import * as Files from '@/lib/files';

const moveValidator = z.object({
  from: z.string(),
  to: z.string(),
});

export type MoveDTO = z.infer<typeof moveValidator>;

// TODO: rename creates dupes, use the same tx pattern there as well

const moveFile = async (
  userId: string,
  userData: UserData,
  from: string,
  to: string,
) => {
  const oldFile = userData.files[from];
  if (!oldFile) {
    return NotFound('File not found');
  }

  const newPath = Files.fileNameIfDuplicate(
    Files.path(to, Files.name(from)),
    Object.keys(userData.files),
  );
  const newFile = { ...oldFile, path: newPath };

  const tx = getRedis().multi();
  tx.hset(`user:${userId}`, { [newPath]: newFile });

  const isMovingRecent = from === userData.recent;
  if (isMovingRecent) {
    tx.hset(`user:${userId}`, { recent: newPath });
  }

  tx.hdel(`user:${userId}`, from);
  await tx.exec();

  return Ok();
};

const moveFolder = async (
  userId: string,
  userData: UserData,
  from: string,
  to: string,
) => {
  const diff = Object.values(userData.files).reduce(
    (acc, curr) => {
      const isMoving = curr.path.startsWith(from);
      if (isMoving) {
        const newPath = Files.path(
          to,
          Files.relative(curr.path, Files.parent(from)),
        );
        (acc.update as any)[newPath] = { ...curr, path: newPath };
        acc.delete.push(curr.path);
        const isMovingRecent = curr.path === userData.recent;
        if (isMovingRecent) {
          acc.update.recent = newPath;
        }
      }
      return acc;
    },
    { update: {} as Record<string, any>, delete: [] as string[] },
  );

  const tx = getRedis().multi();
  tx.hset(`user:${userId}`, diff.update);
  for (const path of diff.delete) {
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
  const moveSchema = moveValidator.safeParse(body);
  if (!moveSchema.success) {
    return BadRequest('Invalid schema');
  }

  const { from, to } = moveSchema.data;

  const userData = await getUserData(userId);
  if (!userData) return NotFound('User not found');

  const isMovingFolder = userData.files[from]?.type === 'folder';
  if (isMovingFolder) return Forbidden("Can't move folders yet");
  return await moveFile(userId, userData, from, to);
});

export const runtime = 'edge';
