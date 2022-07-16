type AstType = "function" | "signature" | "branch" | "loop" | "statement";

export interface Ast {
  path: string;
  type: AstType;
}
