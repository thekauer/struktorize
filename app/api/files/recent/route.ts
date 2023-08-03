import { auth } from '@/auth/auth';
import { getRecent, setRecent } from '@/lib/repository';
import { Unauthorized, getBody, BadRequest, Ok } from '@/lib/serverUtils';
import { z } from 'zod';

const recentValidator = z.object({
  path: z.string(),
});

export type RecentDTO = z.infer<typeof recentValidator>;

export const POST = auth(async (req) => {
  const user = req.auth.user;

  if (!user) {
    return Unauthorized();
  }

  const userId = user.id;

  const body = await getBody(req);
  const recentSchema = recentValidator.safeParse(body);
  if (!recentSchema.success) {
    return BadRequest('Invalid schema');
  }

  const { path } = recentSchema.data;

  await setRecent(userId, path);
  return Ok({ recent: path });
});

export const GET = auth(async (req) => {
  const user = req.auth.user;

  if (!user) {
    return Unauthorized();
  }

  const userId = user.id;

  const recent = await getRecent(userId);
  return Ok({ recent });
});

export const runtime = 'edge';
