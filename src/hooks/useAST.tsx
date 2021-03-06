import { createContext, ReactNode, useContext, useReducer } from "react";
import { DEFAULT_FUNCTION } from "../constants/defaultFunction";
import { Ast, up, down, left, right, add } from "../lib/ast";

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
