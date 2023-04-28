import { FunctionAst } from "../lib/ast";

export const DEFAULT_FUNCTION: FunctionAst = {
  signature: {
    text: [
      { type: "variable", name: "main" },
      { type: "lp" },
      { type: "variable", name: "args" },
      { type: "in" },
      { type: "mathbb", value: "S" },
      { type: "superscript", text: [{ type: "star" }] },
      { type: "rp" },
    ],
    type: "signature",
    path: "signature",
  },
  body: [],
  type: "function",
  path: "",
};
