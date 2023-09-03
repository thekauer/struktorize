import React, {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
  MouseEvent,
} from 'react';
import { DEFAULT_FUNCTION } from '../constants/defaultFunction';
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
  AstNode,
  AbstractChar,
  Script,
} from '../lib/ast';
import {
  addAbstractChar,
  addText,
  Cursor,
  InsertMode,
  type Jump,
  deleteAbstractChar,
  editAdapter,
  deleteAbstractText,
  getScriptIndex,
} from '@/lib/abstractText';
import { useTheme } from './useTheme';
import { parseIdsText, parseSignatureText } from '@/lib/parser';

type ChangeListener = (state: State) => void;

type StateContext = {
  ast: Ast;
  scope: string[];
  functionName: string;
  changed: boolean;
  selected: Set<string>;
  insertMode: InsertMode;
  editing: boolean;
  cursor: number;
  indexCursor: number;
};

export const AstContext = createContext<Dispatch<Action>>(null as any);
export const AstStateContext = createContext<StateContext>(null as any);

type State = {
  ast: Ast;
  scope: string[];
  path: string;
  changeListeners: Record<string, ChangeListener>;
  changed: boolean;
  editing: boolean;
  selected: Set<string>;
  history: CST[];
  history_index: number;
  insertMode: InsertMode;
  cursor: number;
  indexCursor: number;
};

type NavigationPayload = { select?: boolean; move?: boolean; jump?: Jump };

type Action =
  | { type: 'up'; payload: NavigationPayload }
  | { type: 'down'; payload: NavigationPayload }
  | { type: 'left'; payload: NavigationPayload }
  | { type: 'right'; payload: NavigationPayload }
  | { type: 'add'; payload: Ast }
  | {
      type: 'text';
      payload: {
        text: string;
        insertMode?: InsertMode;
        jump?: Jump;
        last?: boolean;
      };
    }
  | {
      type: 'insertSymbol';
      payload: { symbol: AbstractChar; insertMode?: InsertMode };
    }
  | { type: 'setInsertMode'; payload: { insertMode: InsertMode } }
  | { type: 'backspace'; payload: { force: boolean } }
  | { type: 'popLastText' }
  | { type: 'setScope'; payload: string[] }
  | { type: 'setEditing'; payload: boolean }
  | { type: 'toggleEditing' }
  | { type: 'load'; payload: { ast: Ast; path: string } }
  | {
      type: 'addChangeListener';
      payload: { key: string; listener: ChangeListener };
    }
  | { type: 'callChangeListeners' }
  | { type: 'save' }
  | { type: 'select'; payload: string[][] }
  | { type: 'deselect'; payload: string[][] }
  | { type: 'deselectAll' }
  | { type: 'undo' }
  | { type: 'redo' };

function navigateText(
  type: 'up' | 'down' | 'left' | 'right',
  state: State,
  jump: Jump = 'none',
): State {
  const current = get(state.scope, state.ast);
  const text = current.text;
  const cursor = state.cursor;
  switch (type) {
    case 'left':
      return {
        ...state,
        ...Cursor.left(text, cursor, state.indexCursor, state.insertMode, jump),
      };

    case 'right':
      return {
        ...state,
        ...Cursor.right(
          text,
          cursor,
          state.indexCursor,
          state.insertMode,
          jump,
        ),
      };
    case 'down':
      return {
        ...state,
        ...Cursor.down(text, cursor, state.indexCursor, state.insertMode),
      };
    case 'up':
      return {
        ...state,
        ...Cursor.up(text, cursor, state.indexCursor, state.insertMode),
      };
  }
}

function navigate(
  moveScope: (scope: string[], ast: Ast) => string[],
  state: State,
  action: Action & { payload: NavigationPayload },
) {
  const { scope, ast, editing } = state;

  if (editing) {
    if (
      action.type === 'up' ||
      action.type === 'down' ||
      action.type === 'left' ||
      action.type === 'right'
    )
      return navigateText(action.type, state, action.payload.jump);
  }

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
    case 'up':
      return navigate(up, state, action);
    case 'down':
      return navigate(down, state, action);
    case 'left':
      return navigate(left, state, action);
    case 'right':
      return navigate(right, state, action);
    case 'add': {
      return pushHistory({
        ...state,
        insertMode: 'normal',
        ...add(scope, ast, action.payload),
        changed: true,
      });
    }

    case 'text': {
      const current = get(scope, ast);

      const adder = editAdapter(
        current.text,
        addText(
          action.payload.text,
          action.payload.insertMode ?? state.insertMode,
          state.editing ? state.cursor : -1,
          state.editing ? state.indexCursor : -1,
        ),
      );

      const { editCallback, cursor, indexCursor } = adder;
      const cst = edit(scope, ast, editCallback);

      return updateHistory({
        ...state,
        ...cst,
        cursor,
        indexCursor,
        changed: true,
      });
    }

    case 'setInsertMode': {
      if (action.payload.insertMode !== 'normal') {
        const current = get(scope, ast);
        const text = current.text;
        const isOnLeft = text[state.cursor]?.type === 'script';
        if (isOnLeft)
          return {
            ...state,
            insertMode: action.payload.insertMode,
            indexCursor: 0,
          };
        const index = getScriptIndex(text, state.cursor);
        if (!index)
          return {
            ...state,
            insertMode: action.payload.insertMode,
            indexCursor: 0,
          };
        const script = text[index] as Script;
        const scriptText =
          script[state.insertMode as 'superscript' | 'subscript']?.text;
        const indexCursor = scriptText?.length ?? 0;
        return {
          ...state,
          insertMode: action.payload.insertMode,
          indexCursor,
        };
      }

      return {
        ...state,
        insertMode: action.payload.insertMode,
      };
    }

    case 'insertSymbol': {
      const current = get(scope, ast);
      const adder = editAdapter(
        current.text,
        addAbstractChar(
          action.payload.symbol,
          action.payload.insertMode ?? state.insertMode,
          state.editing ? state.cursor : -1,
          state.editing ? state.indexCursor : -1,
        ),
      );

      const { editCallback, cursor, indexCursor } = adder;
      const cst = edit(scope, ast, editCallback);

      return updateHistory({
        ...state,
        ...cst,
        cursor,
        indexCursor,
        changed: true,
      });
    }

    case 'backspace': {
      if (isEmpty(scope, ast) || action.payload.force) {
        return {
          ...state,
          ...remove(scope, ast, true),
          changed: true,
        };
      }

      const current = get(scope, ast);
      const editor = editAdapter(
        current.text,
        deleteAbstractChar(
          state.insertMode,
          state.editing ? state.cursor : -1,
          state.editing ? state.indexCursor : -1,
        ),
      );

      const cst = edit(scope, ast, editor.editCallback);

      return {
        ...state,
        ...cst,
        cursor: editor.cursor,
        indexCursor: editor.indexCursor,
        changed: true,
      };
    }

    case 'popLastText': {
      const current = get(scope, ast);
      const word = Cursor.currentWord(
        current.text,
        state.cursor,
        state.indexCursor,
        state.insertMode,
      );
      if (!word) return state;

      const editor = editAdapter(
        current.text,
        deleteAbstractText(
          state.insertMode,
          state.editing ? state.cursor : -1,
          state.editing ? state.indexCursor : -1,
          word.length,
        ),
      );

      const cst = edit(scope, ast, editor.editCallback);

      return {
        ...state,
        ...cst,
        cursor: editor.cursor,
        indexCursor: editor.indexCursor,
        changed: true,
      };
    }

    case 'setScope':
      return { ...state, ast, scope: action.payload };
    case 'setEditing':
      return { ...state, editing: action.payload };
    case 'toggleEditing':
      return { ...state, editing: !state.editing };
    case 'load':
      return {
        ...state,
        ...action.payload,
        scope: ['signature'],
        changed: false,
      };
    case 'addChangeListener':
      return {
        ...state,
        changeListeners: {
          ...state.changeListeners,
          [action.payload.key]: action.payload.listener,
        },
      };
    case 'callChangeListeners':
      Object.values(state.changeListeners).forEach((listener) =>
        listener?.(state),
      );
      return state;
    case 'save':
      return { ...state, changed: false };
    case 'select':
      return {
        ...state,
        selected: select(state.selected, action.payload, state.ast),
      };
    case 'deselect':
      return {
        ...state,
        selected: deselect(state.selected, action.payload, state.ast),
      };
    case 'deselectAll':
      return { ...state, selected: new Set<string>() };

    case 'undo': {
      const index = Math.max(state.history_index - 1, 0);
      const cst = state.history[index];
      return { ...state, ...cst, history_index: index };
    }

    case 'redo': {
      const index = Math.min(state.history_index + 1, state.history.length - 1);
      const cst = state.history[index];
      return { ...state, ...cst, history_index: index };
    }
    default:
      return state;
  }
}

const defaultCST = {
  scope: ['signature'],
  ast: DEFAULT_FUNCTION,
};

const defaultState: State = {
  ...defaultCST,
  path: '/main',
  changeListeners: {},
  changed: false,
  editing: false,
  cursor: defaultCST.ast.signature.text.length,
  indexCursor: 0,
  selected: new Set<string>(),
  history: [defaultCST],
  history_index: 0,
  insertMode: 'normal',
};

interface AstProviderProps {
  children: ReactNode;
}

export const AstProvider = ({ children }: AstProviderProps) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { showScope } = useTheme();

  const {
    ast,
    scope,
    changed,
    selected,
    insertMode,
    editing,
    cursor,
    indexCursor,
  } = state;

  const signatureText = (ast as FunctionAst).signature.text;
  const signature = parseSignatureText(signatureText);
  const functionName =
    signature?.name || parseIdsText(signatureText)[0]?.name || 'main';

  const stateContext = {
    ast,
    scope: showScope ? scope : [],
    functionName,
    changed,
    selected,
    insertMode,
    editing,
    cursor,
    indexCursor,
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
  const callChangeListeners = () => dispatch({ type: 'callChangeListeners' });
  const defaultNavigationPayload = {
    select: false,
    move: false,
    jump: 'none' as const,
  };

  const up = (payload: NavigationPayload = defaultNavigationPayload) =>
    dispatch({ type: 'up', payload });
  const down = (payload: NavigationPayload = defaultNavigationPayload) =>
    dispatch({ type: 'down', payload });
  const left = (payload: NavigationPayload = defaultNavigationPayload) =>
    dispatch({ type: 'left', payload });
  const right = (payload: NavigationPayload = defaultNavigationPayload) =>
    dispatch({ type: 'right', payload });
  const addStatement = () => {
    dispatch({
      type: 'add',
      payload: { type: 'statement', path: '', text: [] },
    });
    callChangeListeners();
  };
  const addIf = () => {
    dispatch({
      type: 'add',
      payload: {
        type: 'branch',
        path: '',
        text: [],
      },
    });
    callChangeListeners();
  };
  const addLoop = () => {
    dispatch({
      type: 'add',
      payload: { type: 'loop', body: [], path: '', text: [] },
    });
    callChangeListeners();
  };
  const addSwitch = () => {
    dispatch({
      type: 'add',
      payload: { type: 'switch', cases: [], path: '' },
    });
    callChangeListeners();
  };

  const addCase = () => {
    dispatch({
      type: 'add',
      payload: { type: 'case', body: [], path: '', text: [] },
    });
    callChangeListeners();
  };
  const backspace = (n = 1) => {
    for (let i = 0; i < n; i++)
      dispatch({ type: 'backspace', payload: { force: false } });
    callChangeListeners();
  };
  const deleteBlock = () => {
    dispatch({ type: 'backspace', payload: { force: true } });
    callChangeListeners();
  };
  const popLastText = () => {
    dispatch({ type: 'popLastText' });
    callChangeListeners();
  };
  const edit = (
    text: string,
    insertMode?: InsertMode,
    jump: Jump = 'none',
    last?: boolean,
  ) => {
    dispatch({ type: 'text', payload: { text, insertMode, jump, last } });
    callChangeListeners();
  };
  const setInsertMode = (insertMode: InsertMode) => {
    dispatch({ type: 'setInsertMode', payload: { insertMode } });
  };
  const insert = (symbol: AbstractChar, insertMode?: InsertMode) => {
    dispatch({ type: 'insertSymbol', payload: { symbol, insertMode } });
    callChangeListeners();
  };
  const setScope = (scope: string[]) =>
    dispatch({ type: 'setScope', payload: scope });
  const setEditing = (editing: boolean) =>
    dispatch({ type: 'setEditing', payload: editing });
  const toggleEditing = () => dispatch({ type: 'toggleEditing' });
  const load = (ast: Ast, path: string) => {
    dispatch({ type: 'load', payload: { ast, path } });
  };
  const addChangeListener = (
    listener: ChangeListener,
    key = `${Date.now()}_${Math.random()}`,
  ) => dispatch({ type: 'addChangeListener', payload: { key, listener } });
  const save = () => {
    dispatch({ type: 'save' });
    callChangeListeners();
  };
  const select = (selection: string[][]) =>
    dispatch({ type: 'select', payload: selection });
  const deselect = (selection: string[][]) =>
    dispatch({ type: 'deselect', payload: selection });
  const deselectAll = () => dispatch({ type: 'deselectAll' });
  const undo = () => dispatch({ type: 'undo' });
  const redo = () => dispatch({ type: 'redo' });

  return {
    up,
    down,
    left,
    right,
    addStatement,
    addIf,
    addLoop,
    addSwitch,
    addCase,
    backspace,
    deleteBlock,
    popLastText,
    edit,
    insert,
    setInsertMode,
    setScope,
    setEditing,
    toggleEditing,
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
  const { scope, selected, editing } = useContext(AstStateContext);

  const hovered = scope.join('.') === path;
  const isSelected = selected.has(path || '');
  const { setScope, select, deselect, deselectAll, setEditing } = useAst();
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const scopeToSet = path?.split('.') || [];
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

  const onDoubleClick = () => {
    setEditing(true);
  };

  return {
    $hovered: hovered,
    $selected: isSelected,
    $editing: editing && hovered,
    onClick,
    onDoubleClick,
    className: hovered ? 'hovered' : undefined,
  };
};

export const useNodeInScope = () => {
  const { scope, ast } = useContext(AstStateContext);
  if (scope.length === 0) return get(['signature'], ast);
  return get(scope, ast) as AstNode;
};
