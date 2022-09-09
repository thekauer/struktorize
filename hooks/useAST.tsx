import React, {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from "react";
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

type ChangeListener = (state: State) => void;

type StateContext = {
  ast: Ast;
  scope: string[];
  functionName: string;
};

export const AstContext = createContext<Dispatch<Action>>(null as any);
export const AstStateContext = createContext<StateContext>(null as any);

type State = {
  ast: Ast;
  scope: string[];
  path: string;
  changeListeners: ChangeListener[];
};

type Action =
  | { type: "up" }
  | { type: "down" }
  | { type: "left" }
  | { type: "right" }
  | { type: "add"; payload: Ast }
  | { type: "text"; payload: { text: string; insertMode: string } }
  | { type: "backspace" }
  | { type: "setScope"; payload: string[] }
  | { type: "load"; payload: { ast: Ast; path: string } }
  | { type: "addChangeListener"; payload: ChangeListener }
  | { type: "callChangeListeners" };

function reducer(state: State, action: Action): State {
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
      return { ...state, ...add(scope, ast, action.payload) };

    case "text":
      return {
        ...state,
        ...edit(
          scope,
          ast,
          addText(action.payload.text, action.payload.insertMode)
        ),
      };

    case "backspace":
      if (!isEmpty(scope, ast))
        return { ...state, ...edit(scope, ast, deleteLast) };

      const removed = remove(scope, ast, true);
      const newScope = up(removed.scope, removed.ast);
      return { ...state, scope: newScope, ast: removed.ast };
    case "setScope":
      return { ...state, ast, scope: action.payload };
    case "load":
      return { ...state, ...action.payload, scope: ["signature"] };
    case "addChangeListener":
      return {
        ...state,
        changeListeners: [...state.changeListeners, action.payload],
      };
    case "callChangeListeners":
      state.changeListeners.forEach((listener) => listener(state));
      return state;

    default:
      return state;
  }
}

const defaultState: State = {
  scope: ["signature"],
  ast: DEFAULT_FUNCTION,
  path: "/main",
  changeListeners: [],
};

interface AstProviderProps {
  children: ReactNode;
  showScope?: boolean;
}

export const AstProvider = ({ children, showScope }: AstProviderProps) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  const { ast, scope } = state;

  const functionName = getFunctionName((ast as FunctionAst).signature?.text);
  const stateContext = { ast, scope: showScope ? scope : [], functionName };

  return (
    <AstContext.Provider value={dispatch}>
      <AstStateContext.Provider value={stateContext}>
        {children}
      </AstStateContext.Provider>
    </AstContext.Provider>
  );
};

export const useAstState = () => useContext(AstStateContext);

export const useAst = () => {
  const dispatch = useContext(AstContext);
  const callChangeListeners = () => dispatch({ type: "callChangeListeners" });

  const up = () => dispatch({ type: "up" });
  const down = () => dispatch({ type: "down" });
  const left = () => dispatch({ type: "left" });
  const right = () => dispatch({ type: "right" });
  const addStatement = () => {
    dispatch({
      type: "add",
      payload: { type: "statement", path: "", text: " " },
    });
    callChangeListeners();
  };
  const addIf = () => {
    dispatch({
      type: "add",
      payload: {
        type: "branch",
        path: "",
        text: " ",
      },
    });
    callChangeListeners();
  };
  const addLoop = () => {
    dispatch({
      type: "add",
      payload: { type: "loop", body: [], path: "", text: " " },
    });
    callChangeListeners();
  };
  const backspace = (n = 1) => {
    for (let i = 0; i < n; i++) dispatch({ type: "backspace" });
    callChangeListeners();
  };
  const edit = (text: string, insertMode = "normal") => {
    dispatch({ type: "text", payload: { text, insertMode } });
    callChangeListeners();
  };
  const setScope = (scope: string[]) =>
    dispatch({ type: "setScope", payload: scope });
  const load = (ast: Ast, path: string) => {
    dispatch({ type: "load", payload: { ast, path } });
  };
  const addChangeListener = (listener: ChangeListener) =>
    dispatch({ type: "addChangeListener", payload: listener });

  return {
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
    load,
    addChangeListener,
  };
};

export const useNode = (path: string | null) => {
  const { scope } = useContext(AstStateContext);

  const selected = scope.join(".") === path;
  const { setScope } = useAst();
  const onClick = () => {
    setScope(path?.split(".") || []);
  };

  return { selected, onClick };
};
