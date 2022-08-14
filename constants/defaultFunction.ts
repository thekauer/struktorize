import { FunctionAst } from "../lib/ast";

export const DEFAULT_FUNCTION: FunctionAst = {
  signature: {
    text: "\\text{main}(\\text{a}\\in\\mathbb{N})",
    type: "signature",
    path: "signature",
  },
  body: [
    { path: "body.0", type: "statement", text: "\\text{a}:=1" },
    { path: "body.1", type: "statement", text: "\\bold{return}\\;\\text{a}" },
  ],
  type: "function",
  path: "",
};
