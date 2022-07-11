import { createContext, ReactNode, useContext, useReducer } from "react";
import { DEFAULT_FUNCTION } from "../constants/defaultFunction";
import { Ast } from "../lib/ast";

const AstContext = createContext(null as any);

export const useAST = () => {
  const { state, dispatch } = useContext(AstContext);
  const { ast, scope } = state;
  const isSelected = (path: string | null) => {
    return scope.join(".") === path;
  };

  const up = () => dispatch({ type: "up" });
  const down = () => dispatch({ type: "down" });
  const addIf = () => dispatch({ type: "addIf" });

  return {
    ast,
    scope,
    isSelected,
    up,
    down,
    addIf,
  };
};

interface AstProviderProps {
  children: ReactNode;
}

type State = {
  ast: Ast;
  scope: string[];
};

type Action = { type: "up" } | { type: "down" } | { type: "addIf" };

const up = (scope: string[]) => {
  const last = scope.at(-1);
  switch (last) {
    case "signature":
      return scope;
    case "0":
      return scope.slice(0, -2).concat("signature");

    //number
    default:
      return scope.slice(0, -1).concat((Number(last) - 1).toString());
  }
};

const down = (scope: string[], ast: Ast) => {
  const last = scope.at(-1);
  switch (last) {
    case "signature":
      return scope.slice(0, -1).concat(["body", "0"]);

    //number
    default:
      const { length } = scope
        .slice(0, -2)
        .reduce((acc: any, curr) => acc[curr], ast).body;
      const nextNumber = Number(last) + 1;
      return nextNumber < length
        ? scope.slice(0, -1).concat(nextNumber.toString())
        : scope;
  }
};

const addIf = (scope: string[], ast: Ast) => {
  //TODO: splice and shift everything
  //TODO: what if there is no body yet?
  //TODO: add helper functions
  //TODO: tests
  //TODO: duplicates maybe because we need keyup or better check for them here or in a helper function
  const init = scope.slice(0, -1);
  const last = scope.at(-1);
  const nextNumber = Number(last) + 1;
  const path = init.concat(nextNumber.toString()).join(".");
  init.reduce((acc: any, curr) => acc[curr], ast).push({ type: "if", path });
  const newScope = down(scope, ast);
  console.log(ast, newScope);
  return { ast, scope: newScope };
};

function reducer(state: State, action: Action) {
  const { ast, scope } = state;
  switch (action.type) {
    case "up":
      return {
        ...state,
        scope: up(scope),
      };
    case "down":
      return {
        ...state,
        scope: down(scope, ast),
      };
    case "addIf":
      return addIf(scope, ast);

    default:
      return state;
  }
}

export const AstProvider = ({ children }: AstProviderProps) => {
  const [state, dispatch] = useReducer(reducer, {
    scope: ["signature"],
    ast: DEFAULT_FUNCTION,
  });

  return (
    <AstContext.Provider value={{ state, dispatch }}>
      {children}
    </AstContext.Provider>
  );
};
