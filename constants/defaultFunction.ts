import { FunctionAst } from "../lib/ast";

export const DEFAULT_FUNCTION: FunctionAst = {
  signature: { text: "main(a in /N)", type: "signature", path: "signature" },
  body: [
    { path: "body.0", type: "statement", text: "a:=1" },
    { path: "body.1", type: "statement", text: "return a" },
  ],
  type: "function",
  path: "",
};
