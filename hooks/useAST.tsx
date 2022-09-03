import React, { createContext, ReactNode, useContext, useReducer } from "react";
import { DEFAULT_FUNCTION } from "../constants/defaultFunction";
import {
  Ast,
  up,
  down,
  left,
  right,
  add,
  edit,
  isEmpty,
  remove,
  FunctionAst,
} from "../lib/ast";
import { addText, deleteLast, getFunctionName } from "../lib/textTransform";

export const AstContext = createContext(null as any);

interface AstProviderProps {
  children: ReactNode;
  showScope?: boolean;
}

export const AstProvider = ({ children, showScope }: AstProviderProps) => {
  const [state, dispatch] = useReducer(reducer, {
    scope: ["signature"],
    ast: DEFAULT_FUNCTION,
  });
  const { ast, scope } = state;

  const up = () => dispatch({ type: "up" });
  const down = () => dispatch({ type: "down" });
  const left = () => dispatch({ type: "left" });
  const right = () => dispatch({ type: "right" });
  const addStatement = () =>
    dispatch({
      type: "add",
      payload: { type: "statement", path: "", text: " " },
    });
  const addIf = () =>
    dispatch({
      type: "add",
      payload: {
        type: "branch",
        path: "",
        text: " ",
      },
    });
  const addLoop = () =>
    dispatch({
      type: "add",
      payload: { type: "loop", body: [], path: "", text: " " },
    });
  const backspace = (n = 1) => {
    for (let i = 0; i < n; i++) dispatch({ type: "backspace" });
  };
  const edit = (text: string, insertMode = "normal") =>
    dispatch({ type: "text", payload: { text, insertMode } });
  const setScope = (scope: string[]) =>
    dispatch({ type: "setScope", payload: scope });

  const functionName = getFunctionName((ast as FunctionAst).signature.text);

  const context = {
    ast,
    scope: showScope ? scope : [],
    functionName,
    up,
    down,
    left,
    right,
    addStatement,
    addIf,
    addLoop,
    backspace,
    edit,
    setScope,
    dispatch,
  };

  return <AstContext.Provider value={context}>{children}</AstContext.Provider>;
};

export const useAst = () => {
  return useContext(AstContext);
};

export const useSelected = (path: string | null) => {
  const { scope } = useContext(AstContext);

  return scope.join(".") === path;
};

export const useNode = (path: string | null) => {
  const selected = useSelected(path);
  const ast = useAst();
  const onClick = () => {
    ast.setScope(path?.split("."));
  };

  return { selected, onClick };
};

type State = {
  ast: Ast;
  scope: string[];
};

type Action =
  | { type: "up" }
  | { type: "down" }
  | { type: "left" }
  | { type: "right" }
  | { type: "add"; payload: Ast }
  | { type: "text"; payload: { text: string; insertMode: string } }
  | { type: "backspace" }
  | { type: "setScope"; payload: string[] };

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

    case "text":
      return edit(
        scope,
        ast,
        addText(action.payload.text, action.payload.insertMode)
      );

    case "backspace":
      if (!isEmpty(scope, ast)) return edit(scope, ast, deleteLast);

      const removed = remove(scope, ast, true);
      const newScope = up(removed.scope, removed.ast);
      return { scope: newScope, ast: removed.ast };
    case "setScope":
      return { ast, scope: action.payload };

    default:
      return state;
  }
}
