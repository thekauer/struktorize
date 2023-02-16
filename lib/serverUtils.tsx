import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";
import { z } from "zod";

export function Ok(payload?: Object) {
  return new Response(JSON.stringify(payload) || "ok", { status: 200 });
}

export function BadRequest(reason?: string) {
  return new Response(reason || "Bad Request", { status: 400 });
}

export function Unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

export function NotFound() {
  return new Response("Not Found", { status: 404 });
}

export function Conflict() {
  return new Response("Conflict", { status: 409 })
}

export async function getBody(req: NextRequest) {
  const blob = await req.blob();
  const text = await blob.text();
  const body = JSON.parse(text);
  return body;
};

export function makeId(userId: string) {
  return btoa(userId + Date.now().toString(36));
}


export function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
};


const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
export type Json = Literal | { [key: string]: Json } | Json[];
export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);
