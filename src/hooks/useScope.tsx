import { useState } from "react";
import { FunctionAst } from "../components/Function/Function";

export const useScope = (initialScope: string[], ast: FunctionAst) => {
  const [scope, setScope] = useState(initialScope);

  const get = () => {
    return scope.reduce((acc: any, curr) => acc[curr], ast);
  };

  const getParent = () => {
    return scope.slice(0, -2).reduce((acc: any, curr) => acc[curr], ast);
  };

  const down = () => {
    setScope((prev) => {
      const last = prev.at(-1);
      switch (last) {
        case "signature":
          return prev.slice(0, -1).concat(["body", "0"]);

        //number
        default:
          const { length } = getParent().body;
          const nextNumber = Number(last) + 1;
          return nextNumber < length
            ? prev.slice(0, -1).concat(nextNumber.toString())
            : prev;
      }
    });
  };

  const up = () => {
    setScope((prev) => {
      const last = prev.at(-1);
      switch (last) {
        case "signature":
          return prev;
        case "0":
          return prev.slice(0, -2).concat("signature");

        //number
        default:
          return prev.slice(0, -1).concat((Number(last) - 1).toString());
      }
    });
  };

  const path = scope.join(".");

  return {
    scope,
    path,
    up,
    down,
    get,
  };
};
