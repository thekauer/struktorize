import { unstable_getServerSession } from "next-auth/next";
import { authOptions, redis } from "../auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";

export type FilesDTO = {
  name: string;
  path: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).end();
  }

  if (req.method === "GET") {
    const keys = (await redis.keys(`file:${session!.user!.email}:*`)) || [];
    const files = keys.map((key) => ({
      name: key.substring(key.lastIndexOf("/") + 1),
      path: key.substring(key.lastIndexOf(":") + 1),
    }));

    return res.status(200).json({ files });
  }
}
