import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Ast } from './ast';

export function Ok(payload?: Object) {
  return new Response(JSON.stringify(payload) || 'ok', { status: 200 });
}

export function Created(payload?: Object) {
  return new Response(JSON.stringify(payload) || 'created', { status: 201 });
}

export function BadRequest(reason?: string) {
  return new Response(reason || 'Bad Request', { status: 400 });
}

export function Unauthorized(reason?: string) {
  return new Response(reason || 'Unauthorized', { status: 401 });
}

export function NotFound(reason?: string) {
  return new Response(reason || 'Not Found', { status: 404 });
}

export function Conflict(reason?: string) {
  return new Response(reason || 'Conflict', { status: 409 });
}

export function NotAllowed(reason?: string) {
  return new Response(reason || 'Method not allowed', { status: 405 });
}

export function InternalServerError(reason?: string) {
  return new Response(reason || 'Internal Server Error', { status: 500 });
}

export function Forbidden(reason?: string) {
  return new Response(reason || 'Forbidden', { status: 403 });
}

export type Token = {
  name: string;
  email: string;
  picture: string;
  id: string;
  locale: string;
};

export async function getBody(req: Request) {
  return await req.json();
}

export function makeId() {
  const firstPartNo = (Math.random() * 46656) | 0;
  const secondPartNo = (Math.random() * 46656) | 0;

  const firstPart = ('000' + firstPartNo.toString(36)).slice(-3);
  const secondPart = ('000' + secondPartNo.toString(36)).slice(-3);

  return firstPart + secondPart;
}

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
export type Json = Literal | { [key: string]: Json } | Json[];
export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);
export const astSchmea: z.ZodType<Ast> = jsonSchema as any;
