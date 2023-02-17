import { getRedis } from "lib/repository";
import { BadRequest, getBody, getToken, NotAllowed, Ok, Unauthorized } from "lib/serverUtils";
import { NextRequest } from "next/server";
import { z } from "zod";

const shareValidator = z.object({
  path: z.string(),
  id: z.string()
});

export type ShareBody = z.infer<typeof shareValidator>;
export type ShareResponse = { code: string };


export default async function handler(req: NextRequest) {
  const redis = getRedis();
  const token = await getToken(req);

  if (!token) {
    return Unauthorized();
  }

  try {
    if (req.method !== "POST")
      throw NotAllowed();
  } catch (err) {
    return err;
  }

  const body = await getBody(req);
  const shareSchema = shareValidator.safeParse(body);
  if (!shareSchema.success) {
    return BadRequest();
  }
  const { id, path } = shareSchema.data;
  const userId = token.id;

  const ast = await redis.hget(`user:${userId}`, 'files');


  return BadRequest();

}

export const config = {
  runtime: "experimental-edge",
};
