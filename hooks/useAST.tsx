import React, {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
  MouseEvent,
  useRef,
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
  select,
  deselect,
  navigateAndToggleSelection,
  CST,
  get,
} from "../lib/ast";
import { addText, deleteLast, getFunctionName } from "../lib/textTransform";
import { useTheme } from "./useTheme";

type ChangeListener = (state: State) => void;

type StateContext = {
  ast: Ast;
  scope: string[];
  functionName: string;
  changed: boolean;
  selected: Set<string>;
};

export const AstContext = createContext<Dispatch<Action>>(null as any);
export const AstStateContext = createContext<StateContext>(null as any);

type State = {
  ast: Ast;
  scope: string[];
  path: string;
  changeListeners: Record<string, ChangeListener>;
  changed: boolean;
  selected: Set<string>;
  history: CST[];
  history_index: number;
};

type Action =
  | { type: "up"; payload: { select?: boolean; move?: boolean } }
  | { type: "down"; payload: { select?: boolean; move?: boolean } }
  | { type: "left"; payload: { select?: boolean; move?: boolean } }
  | { type: "right"; payload: { select?: boolean; move?: boolean } }
  | { type: "add"; payload: Ast }
  | { type: "text"; payload: { text: string; insertMode: string } }
  | { type: "backspace" }
  | { type: "setScope"; payload: string[] }
  | { type: "load"; payload: { ast: Ast; path: string } }
  | {
    type: "addChangeListener";
    payload: { key: string; listener: ChangeListener };
  }
  | { type: "callChangeListeners" }
  | { type: "save" }
  | { type: "select"; payload: string[][] }
  | { type: "deselect"; payload: string[][] }
  | { type: "deselectAll" }
  | { type: "undo" }
  | { type: "redo" };

function navigate(
  moveScope: (scope: string[], ast: Ast) => string[],
  state: State,
  action: Action & { payload: { select?: boolean; move?: boolean } }
) {
  const { scope, ast } = state;

  const newScope = moveScope(scope, ast);
  if (action.payload.select) {
    return {
      ...state,
      ...navigateAndToggleSelection(state.selected, scope, newScope, state.ast),
    };
  }

  return {
    ...state,
    scope: newScope,
  };
}

/** Add current ast to the history */
function pushHistory(state: State): State {
  const cst = { ast: state.ast, scope: state.scope };
  const historyBeforePush = state.history.slice(0, state.history_index + 1);
  return {
    ...state,
    history: [...historyBeforePush, cst],
    history_index: state.history_index + 1,
  };
}

/** Update last ast in history */
function updateHistory(state: State): State {
  const history = state.history.slice(0, state.history_index + 1);
  const cst = { ast: state.ast, scope: state.scope };
  history[state.history_index] = cst;

  return {
    ...state,
    history,
  };
}

function reducer(state: State, action: Action): State {
  const { ast, scope } = state;
  switch (action.type) {
    case "up":
      return navigate(up, state, action);
    case "down":
      return navigate(down, state, action);
    case "left":
      return navigate(left, state, action);
    case "right":
      return navigate(right, state, action);
    case "add": {
      return pushHistory({
        ...state,
        ...add(scope, ast, action.payload),
        changed: true,
      });
    }

    case "text": {
      const cst = edit(
        scope,
        ast,
        addText(action.payload.text, action.payload.insertMode)
      );

      return updateHistory({
        ...state,
        ...cst,
        changed: true,
      });
    }

    case "backspace":
      if (!isEmpty(scope, ast))
        return { ...state, ...edit(scope, ast, deleteLast) };

      const removed = remove(scope, ast, true);
      const newScope = up(removed.scope, removed.ast);
      return { ...state, scope: newScope, ast: removed.ast, changed: true };
    case "setScope":
      return { ...state, ast, scope: action.payload };
    case "load":
      return {
        ...state,
        ...action.payload,
        scope: ["signature"],
        changed: false,
      };
    case "addChangeListener":
      return {
        ...state,
        changeListeners: {
          ...state.changeListeners,
          [action.payload.key]: action.payload.listener,
        },
      };
    case "callChangeListeners":
      Object.values(state.changeListeners).forEach((listener) =>
        listener?.(state)
      );
      return state;
    case "save":
      return { ...state, changed: false };
    case "select":
      return {
        ...state,
        selected: select(state.selected, action.payload, state.ast),
      };
    case "deselect":
      return {
        ...state,
        selected: deselect(state.selected, action.payload, state.ast),
      };
    case "deselectAll":
      return { ...state, selected: new Set<string>() };

    case "undo": {
      const index = Math.max(state.history_index - 1, 0);
      const cst = state.history[index];
      return { ...state, ...cst, history_index: index };
    }

    case "redo": {
      const index = Math.min(state.history_index + 1, state.history.length - 1);
      const cst = state.history[index];
      return { ...state, ...cst, history_index: index };
    }
    default:
      return state;
  }
}

const defaultCST = {
  scope: ["signature"],
  ast: DEFAULT_FUNCTION,
};

const defaultState: State = {
  ...defaultCST,
  path: "/main",
  changeListeners: {},
  changed: false,
  selected: new Set<string>(),
  history: [defaultCST],
  history_index: 0,
};

interface AstProviderProps {
  children: ReactNode;
}

export const AstProvider = ({ children }: AstProviderProps) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { showScope } = useTheme();

  const { ast, scope, changed, selected } = state;

  const functionName = getFunctionName((ast as FunctionAst).signature?.text);
  const stateContext = {
    ast,
    scope: showScope ? scope : [],
    functionName,
    changed,
    selected,
  };

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
  const defaultNavigationPayload = {
    select: false,
    move: false,
  };

  const up = (payload = defaultNavigationPayload) =>
    dispatch({ type: "up", payload });
  const down = (payload = defaultNavigationPayload) =>
    dispatch({ type: "down", payload });
  const left = (payload = defaultNavigationPayload) =>
    dispatch({ type: "left", payload });
  const right = (payload = defaultNavigationPayload) =>
    dispatch({ type: "right", payload });
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
  const addChangeListener = (
    listener: ChangeListener,
    key = `${Date.now()}_${Math.random()}`
  ) => dispatch({ type: "addChangeListener", payload: { key, listener } });
  const save = () => {
    dispatch({ type: "save" });
    callChangeListeners();
  };
  const select = (selection: string[][]) =>
    dispatch({ type: "select", payload: selection });
  const deselect = (selection: string[][]) =>
    dispatch({ type: "deselect", payload: selection });
  const deselectAll = () => dispatch({ type: "deselectAll" });
  const undo = () => dispatch({ type: "undo" });
  const redo = () => dispatch({ type: "redo" });

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
    save,
    select,
    deselect,
    deselectAll,
    undo,
    redo,
  };
};

export const useNode = (path: string | null) => {
  const { scope, selected } = useContext(AstStateContext);

  const hovered = scope.join(".") === path;
  const isSelected = selected.has(path || "");
  const { setScope, select, deselect, deselectAll } = useAst();
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const scopeToSet = path?.split(".") || [];
    setScope(scopeToSet);

    if (!(e.ctrlKey || e.shiftKey)) {
      deselectAll();
      return;
    }
    if (e.ctrlKey) {
      if (isSelected) {
        deselect([scopeToSet]);
      } else {
        select([scopeToSet]);
      }
    }
  };

  return { hovered, selected: isSelected, onClick, className: hovered ? "hovered" : undefined };
};

export const useNodeInScope = () => {
  const { scope, ast } = useContext(AstStateContext);
  return get(scope, ast) as Ast;
}
