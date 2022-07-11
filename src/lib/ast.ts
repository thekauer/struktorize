type AstType = "function" | "signature" | "branch" | "loop" | "statement";

export interface Ast {
  path: string | null;
  type: AstType;
}
