import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
} from "react";
import { DEFAULT_FUNCTION } from "../constants/defaultFunction";
import { Ast, up, down, left, right, add, edit } from "../lib/ast";
import { deleteLast } from "../lib/textTransform";

const AstContext = createContext(null as any);

export const useAST = () => {
  const { state, dispatch } = useContext(AstContext);
  const { ast, scope } = state;
  const isSelected = (path: string | null) => {
    return scope.join(".") === path;
  };

  const up = useCallback(() => dispatch({ type: "up" }), [dispatch]);
  const down = useCallback(() => dispatch({ type: "down" }), [dispatch]);
  const left = useCallback(() => dispatch({ type: "left" }), [dispatch]);
  const right = useCallback(() => dispatch({ type: "right" }), [dispatch]);
  const addIf = useCallback(
    () =>
      dispatch({
        type: "add",
        payload: {
          type: "branch",
        },
      }),
    [dispatch]
  );
  const addLoop = useCallback(
    () => dispatch({ type: "add", payload: { type: "loop", body: [] } }),
    [dispatch]
  );
  const backspace = useCallback(
    () => dispatch({ type: "backspace" }),
    [dispatch]
  );
  const edit = useCallback(
    (text: string) => dispatch({ type: "text", payload: text }),
    [dispatch]
  );

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
    backspace,
    edit,
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
  | { type: "add"; payload: Ast }
  | { type: "text"; payload: string }
  | { type: "backspace" };

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
      return edit(scope, ast, (text) => text + action.payload);

    case "backspace":
      return edit(scope, ast, deleteLast);

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
