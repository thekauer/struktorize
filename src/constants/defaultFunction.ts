import { FunctionAst } from "../components/Function/Function";
import { StatementAst } from "../components/Statement/Statement";

export const DEFAULT_FUNCTION: FunctionAst = {
  signature: { text: "main(a in N )", type: "signature", path: "signature" },
  body: [
    { path: "body.0", type: "statement", text: "a:=1" } as StatementAst,
    { path: "body.1", type: "statement", text: "return a" } as StatementAst,
  ],
  type: "function",
  path: "",
};
