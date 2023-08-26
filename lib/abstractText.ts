import {
  AbstractChar,
  AbstractText,
  Operator,
  Symbol,
  Script,
  Char,
} from './ast';

const toSpliced = (
  text: AbstractText,
  index: number,
  deleteCount: number,
  ...char: AbstractChar[]
) => {
  return [...text.slice(0, index), ...char, ...text.slice(index + deleteCount)];
};

export const isScript = (char?: AbstractChar) => {
  return char?.type === 'script';
};

export const getScriptIndex = (text: AbstractText, cursor: number) => {
  if (isScript(text.at(cursor))) return cursor;
  if (isScript(text.at(cursor - 1))) return cursor - 1;
  return null;
};

const getScript = (text: AbstractText, cursor: number) => {
  const index = getScriptIndex(text, cursor);
  return index ? (text.at(index) as Script) : null;
};

const getCurrentScript = (
  text: AbstractText,
  cursor: number,
  insertMode: InsertMode,
) => {
  const script = getScript(text, cursor);

  return insertMode === 'superscript' ? script?.superscript : script?.subscript;
};

export type InsertMode = 'normal' | 'superscript' | 'subscript';

const OPERATOR_MAP: Record<string, Operator> = {
  '&': { type: 'and' },
  '|': { type: 'or' },
  '=': { type: 'eq' },
  '<': { type: 'lt' },
  '>': { type: 'gt' },
  ':': { type: 'colon' },
  ',': { type: 'comma' },
  ';': { type: 'semicolon' },
  '(': { type: 'lp' },
  ')': { type: 'rp' },
  '[': { type: 'lb' },
  ']': { type: 'rb' },
  '{': { type: 'lc' },
  '}': { type: 'rc' },
  '*': { type: 'star' },
  '!': { type: 'bang' },
  ' ': { type: 'space' },
  '-': { type: 'minus' },
};

const DOUBLE_OPERATOR_MAP: Record<string, Symbol | Operator> = {
  '&&': { type: 'land' },
  '||': { type: 'lor' },
  '!=': { type: 'neq' },
  '<=': { type: 'le' },
  '>=': { type: 'ge' },
  ':=': { type: 'coloneq' },
  '  ': { type: 'space' },
  '->': { type: 'arrow' },
};

const operatorToChar = (op: AbstractChar) => {
  return (
    Object.entries(OPERATOR_MAP).find(
      ([_, value]) => value.type === op.type,
    )?.[0] || 'undefined'
  );
};

const transformDoubleOperator = (first: AbstractChar, second: AbstractChar) => {
  const hash = operatorToChar(first) + operatorToChar(second);

  return hash in DOUBLE_OPERATOR_MAP
    ? [DOUBLE_OPERATOR_MAP[hash]]
    : [first, second];
};

const isOperator = (char: string) => {
  return char.length === 1 && char[0] in OPERATOR_MAP;
};

const isOperatorType = (char: AbstractChar) => {
  return Object.values(OPERATOR_MAP).some((op) => op.type === char.type);
};

const isBannedFirstChar = (char: AbstractChar) => {
  return ['space', 'superscript', 'subscript'].includes(char.type);
};

const isSpaceScript = (first: AbstractChar, second: AbstractChar) => {
  if (first.type !== 'space') return false;
  return isScript(second);
};

const editScriptInText = (
  currentText: AbstractText,
  insertMode: InsertMode,
  cursor: number,
  callback: (text: AbstractText) => AbstractText,
) => {
  if (insertMode === 'normal') return currentText;
  const scriptIndex = getScriptIndex(currentText, cursor);
  if (!scriptIndex) return currentText;
  const script = currentText[scriptIndex] as Script;
  const currentScript = script[insertMode];
  const text = currentScript?.text;
  if (!text) return currentText;

  const newScriptText = callback(text);

  const newScript = {
    ...script,
    [insertMode]: { type: insertMode, text: newScriptText },
  };

  return toSpliced(currentText, scriptIndex, 1, newScript);
};

export const addText =
  (
    newText: string,
    insertMode: InsertMode = 'normal',
    cursor: number,
    cursorIndex: number,
  ) =>
  (currentText: AbstractText): AbstractText => {
    if (insertMode !== 'normal') {
      if (!getScriptIndex(currentText, cursor)) {
        const withScript = toSpliced(currentText, cursorIndex, 0, {
          type: 'script',
          subscript: { type: 'subscript', text: [] },
          superscript: { type: 'superscript', text: [] },
        });

        return editScriptInText(
          withScript,
          insertMode,
          cursor,
          addText(newText, 'normal', cursor, cursorIndex),
        );
      }
      return editScriptInText(
        currentText,
        insertMode,
        cursor,
        addText(newText, 'normal', cursor, cursorIndex),
      );
    }

    if (isOperator(newText)) {
      return addAbstractChar(
        OPERATOR_MAP[newText],
        insertMode,
        cursor,
        cursorIndex,
      )(currentText);
    }

    if (currentText.length === 0) return [{ type: 'char', value: newText }];

    return toSpliced(currentText, cursor, 0, {
      type: 'char',
      value: newText,
    });
  };

export const addAbstractChar =
  (
    char: AbstractChar,
    insertMode: InsertMode,
    cursor: number,
    cursorIndex: number,
  ) =>
  (currentText: AbstractText): AbstractText => {
    if (insertMode !== 'normal') {
      if (!getScriptIndex(currentText, cursor)) {
        const withScript = toSpliced(currentText, cursorIndex, 0, {
          type: 'script',
          subscript: { type: 'subscript', text: [] },
          superscript: { type: 'superscript', text: [] },
        });

        return editScriptInText(
          withScript,
          insertMode,
          cursor,
          addAbstractChar(char, 'normal', cursor, cursorIndex),
        );
      }
      return editScriptInText(
        currentText,
        insertMode,
        cursor,
        addAbstractChar(char, 'normal', cursor, cursorIndex),
      );
    }

    const current = currentText[cursor];
    if (!current) return isBannedFirstChar(char) ? [] : [char];

    if (isSpaceScript(current, char)) return currentText;
    const isDoubleOperator = isOperatorType(char) && isOperatorType(current);
    if (isDoubleOperator) {
      return toSpliced(
        currentText,
        cursor,
        1,
        ...transformDoubleOperator(current, char),
      );
    }

    return currentText.concat(char);
  };

export const deleteAbstractChar =
  (insertMode: InsertMode, cursor: number, cursorIndex: number) =>
  (currentText: AbstractText): AbstractText => {
    if (insertMode !== 'normal') {
      return editScriptInText(
        currentText,
        insertMode,
        cursor,
        deleteAbstractChar('normal', cursor, cursorIndex),
      );
    }
    return toSpliced(currentText, cursorIndex, 1);
  };

type CursorMovement = {
  cursor: number;
  insertMode: InsertMode;
  indexCursor: number;
};

export type Jump = 'none' | 'word' | 'line';

const isOnRightSideOfScript = (text: AbstractText, cursor: number) => {
  return text[cursor - 1] && isScript(text[cursor - 1]);
};

const indexCursorOnEnter = (
  text: AbstractText,
  cursor: number,
  nextInsertMode: InsertMode,
) => {
  const script = getScript(text, cursor);
  if (!script || !isOnRightSideOfScript(text, cursor)) {
    return 0;
  }

  if (nextInsertMode === 'subscript') return script.subscript?.text.length || 0;
  if (nextInsertMode === 'superscript')
    return script.superscript?.text.length || 0;

  return 0;
};

const isAlphaNumeric = (char?: AbstractChar) => {
  if (!char) return false;
  return char.type === 'char' && char.value.match(/[a-zA-Z0-9]/i);
};

const currentCharIndex = (
  text: AbstractText,
  cursor: number,
  indexCursor: number,
  insertMode: InsertMode = 'normal',
): number => {
  if (insertMode !== 'normal') {
    const scriptText = getCurrentScript(text, cursor, insertMode)?.text;
    if (scriptText) {
      return currentCharIndex(scriptText, indexCursor, 0, 'normal');
    }
  }

  if (text.length === 0) return -1;

  if (isAlphaNumeric(text[cursor - 1])) return cursor - 1;
  if (isAlphaNumeric(text[cursor])) return cursor;
  return -1;
};

export const currentWord = (
  text: AbstractText,
  cursor: number,
  indexCursor: number,
  insertMode: InsertMode = 'normal',
): string | null => {
  if (insertMode !== 'normal') {
    const scriptText = getCurrentScript(text, cursor, insertMode)?.text;
    if (scriptText) {
      return currentWord(scriptText, indexCursor, 0, 'normal');
    }
  }
  if (text.length === 0) return null;

  const index = currentCharIndex(text, cursor, indexCursor, insertMode);
  if (index === -1) return null;

  let left = index;
  let right = index;

  while (left > 0 && isAlphaNumeric(text[left - 1])) left--;
  while (right < text.length - 1 && isAlphaNumeric(text[right + 1])) right++;

  return text
    .slice(left, right + 1)
    .map((char) => (char as Char).value)
    .join('');
};

const right = (
  text: AbstractText,
  cursor: number,
  indexCursor: number,
  insertMode: InsertMode = 'normal',
  jump: Jump = 'none',
): CursorMovement => {
  if (insertMode !== 'normal') {
    const scriptText = getCurrentScript(text, cursor, insertMode)?.text;

    if (scriptText) {
      const movement = right(scriptText, indexCursor, 0, 'normal', jump);
      return { cursor, insertMode, indexCursor: movement.cursor };
    }
  }

  if (cursor === text.length) return { cursor, insertMode, indexCursor };
  if (jump === 'line')
    return { cursor: text.length, insertMode: 'normal', indexCursor };
  if (
    jump === 'word' &&
    cursor < text.length - 1 &&
    text[cursor + 1].type === 'char'
  )
    return right(text, cursor + 1, indexCursor, insertMode, jump);

  return { cursor: cursor + 1, insertMode, indexCursor };
};

const left = (
  text: AbstractText,
  cursor: number,
  indexCursor: number,
  insertMode: InsertMode = 'normal',
  jump: Jump = 'none',
): CursorMovement => {
  if (insertMode !== 'normal') {
    const scriptText = getCurrentScript(text, cursor, insertMode)?.text;

    if (scriptText) {
      const movement = left(scriptText, indexCursor, 0, 'normal', jump);
      return { cursor, insertMode, indexCursor: movement.cursor };
    }
  }

  if (cursor === 0) return { cursor, insertMode, indexCursor };
  if (jump === 'line') return { cursor: 0, insertMode: 'normal', indexCursor };

  const prev = text[cursor - 1];
  if (jump === 'word' && cursor > 0 && prev?.type === 'char')
    return left(text, cursor - 1, indexCursor, insertMode, jump);

  return { cursor: cursor - 1, insertMode, indexCursor };
};

const up = (
  text: AbstractText,
  cursor: number,
  indexCursor: number,
  insertMode: InsertMode = 'normal',
): CursorMovement => {
  if (insertMode === 'superscript') return { cursor, insertMode, indexCursor };
  if (insertMode === 'subscript')
    return { cursor, insertMode: 'normal', indexCursor };

  const script = getScript(text, cursor);
  if (!script?.superscript) return { cursor, insertMode, indexCursor };

  const newIndexCursor = indexCursorOnEnter(text, cursor, 'subscript');
  return { cursor, insertMode: 'superscript', indexCursor: newIndexCursor };
};

const down = (
  text: AbstractText,
  cursor: number,
  indexCursor: number,
  insertMode: InsertMode = 'normal',
): CursorMovement => {
  if (insertMode === 'subscript') return { cursor, insertMode, indexCursor };
  if (insertMode === 'superscript')
    return { cursor, insertMode: 'normal', indexCursor };

  const script = getScript(text, cursor);
  if (!script?.subscript) return { cursor, insertMode, indexCursor };

  const newIndexCursor = indexCursorOnEnter(text, cursor, 'subscript');

  return { cursor, insertMode: 'subscript', indexCursor: newIndexCursor };
};

export const Cursor = {
  up,
  down,
  left,
  right,
  currentWord,
};
