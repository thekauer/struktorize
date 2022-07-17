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
  const left = () => dispatch({ type: "left" });
  const right = () => dispatch({ type: "right" });
  const addIf = () =>
    dispatch({
      type: "add",
      payload: {
        type: "branch",
      },
    });
  const addLoop = () =>
    dispatch({ type: "add", payload: { type: "loop", body: [] } });

  return {
    ast,
    scope,
    isSelected,
    up,
    down,
    left,
    right,
    addIf,
    addLoop,
  };
};

interface AstProviderProps {
  children: ReactNode;
}

type State = {
  ast: Ast;
  scope: string[];
};

type Action =
  | { type: "up" }
  | { type: "down" }
  | { type: "left" }
  | { type: "right" }
  | { type: "add"; payload: Ast };

const get = (scope: string[], ast: Ast) =>
  scope.reduce((acc: any, curr) => acc[curr], ast);

const grandParent = (scope: string[], ast: Ast) => {
  const parent = scope.slice(0, -2);
  return parent.reduce((acc: any, curr) => acc[curr], ast);
};

const isOnIfBranch = (scope: string[]) => scope.at(-2) === "ifBranch";

const swapBranch = (scope: string[], ast: Ast) => {
  const parent = grandParent(scope, ast);
  const otherBranch = isOnIfBranch(scope) ? "elseBranch" : "ifBranch";
  const index = scopeIndex(scope);
  const { length } = parent[otherBranch];

  const branchScope = scope.slice(0, -2);
  return [...branchScope, otherBranch, Math.min(index, length - 1).toString()];
};

const bodyLength = (ast: any | Ast) => {
  switch (ast.type) {
    case "function":
      return ast.body.length;
    case "loop":
      return ast.body.length;
    case "branch":
      return ast.ifBranch.length;
  }
};

const up = (scope: string[], ast: Ast) => {
  const last = scope.at(-1);
  if (last === "0") {
    const { type } = grandParent(scope, ast);
    switch (type) {
      case "function":
        return scope.slice(0, -2).concat("signature");
      case "branch":
        return scope.slice(0, -2);
      default:
        return scope.slice(0, -2);
    }
  }

  switch (last) {
    case "signature":
      return scope;

    //number
    default:
      const newScope = scope.slice(0, -1).concat((Number(last) - 1).toString());
      const node = get(newScope, ast);
      if (node.type === "branch") {
        return node.ifBranch.at(-1).path.split(".");
      }
      if (node.type === "loop") {
        return node.body.at(-1).path.split(".");
      }

      return newScope;
  }
};

const down = (scope: string[], ast: Ast): string[] => {
  const last = scope.at(-1);
  const { type } = get(scope, ast);
  switch (type) {
    case "signature":
      return scope.slice(0, -1).concat(["body", "0"]);
    case "branch":
      return [...scope, "ifBranch", "0"];
    case "loop":
      return [...scope, "body", "0"];

    default:
      const parent = grandParent(scope, ast);
      const length = bodyLength(parent);
      const nextNumber = Number(last) + 1;
      if (nextNumber < length)
        return scope.slice(0, -1).concat(nextNumber.toString());

      if (parent.type === "function") {
        return scope;
      }

      return incrementScope(parent.path.split("."));
  }
};

const left = (scope: string[], ast: Ast) => {
  const { type } = grandParent(scope, ast);
  switch (type) {
    case "loop":
      return scope.slice(0, -2);
    default:
      const parent = grandParent(scope, ast);
      if (parent.type === "branch" && !isOnIfBranch(scope)) {
        return swapBranch(scope, ast);
      }
      return scope;
  }
};

const right = (scope: string[], ast: Ast) => {
  const { type } = get(scope, ast);
  switch (type) {
    case "loop":
      return [...scope, "body", "0"];
    default:
      const parent = grandParent(scope, ast);
      if (parent.type === "branch" && isOnIfBranch(scope)) {
        return swapBranch(scope, ast);
      }
      return scope;
  }
};

const setIndex = (path: string, index: number) =>
  path.split(".").slice(0, -1).concat(index.toString()).join(".");

const insert = (body: Ast[], index: number, node: Ast) => {
  const oldPath = body[index].path;
  return [...body.slice(0, index + 1), node, ...body.slice(index + 1)].map(
    (node, i) =>
      ({
        ...node,
        path: setIndex(oldPath, i),
      } as Ast)
  );
};

const scopeIndex = (scope: string[]) => Number(scope.at(-1)!);
const scopeWithoutIndex = (scope: string[]) => scope.slice(0, -1);

const withScope = (scope: string[], ast: any): any => {
  const [first, ...rest] = scope;
  if (rest.length === 0) {
    return { [first]: ast };
  }
  return {
    [first]: withScope(rest, ast),
  };
};

const incrementScope = (scope: string[]) => {
  const last = Number(scope.at(-1));
  //if last is a number
  if (!isNaN(last)) {
    return scope.slice(0, -1).concat((last + 1).toString());
  }
  return scope.concat("0");
};

const prepare = (scope: string[], node: Ast): Ast => {
  const path = incrementScope(scope).join(".");
  switch (node.type) {
    case "branch":
      return {
        ...node,
        path,
        ifBranch: [{ type: "statement", path: `${path}.ifBranch.0`, text: "" }],
        elseBranch: [
          { type: "statement", path: `${path}.elseBranch.0`, text: "" },
        ],
      } as Ast;
    case "loop":
      return {
        ...node,
        path,
        body: [{ type: "statement", path: `${path}.body.0`, text: "" }],
      } as Ast;
  }

  //TODO: remove this
  return node;
};

const add = (scope: string[], ast: Ast, node: Ast) => {
  //TODO: what if there is no body yet?
  //TODO: tests
  const newNode = prepare(scope, node);

  //create new body
  const where = grandParent(scope, ast);
  const index = scopeIndex(scope);
  const newBody = insert(where.body, index, newNode);

  //set new body
  const bodyScope = scopeWithoutIndex(scope);
  const bodyInScope = withScope(bodyScope, newBody);
  const newAst = { ...ast, ...bodyInScope };

  const newScope = down(scope, newAst);
  return { scope: newScope, ast: newAst };
};

function reducer(state: State, action: Action) {
  const { ast, scope } = state;
  switch (action.type) {
    case "up":
      return {
        ...state,
        scope: up(scope, ast),
      };
    case "down":
      return {
        ...state,
        scope: down(scope, ast),
      };
    case "left":
      return {
        ...state,
        scope: left(scope, ast),
      };
    case "right":
      return {
        ...state,
        scope: right(scope, ast),
      };
    case "add":
      return add(scope, ast, action.payload);

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
