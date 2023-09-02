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
  if (isScript(text.at(cursor))) {
    const index = cursor;
    if (index < 0) return text.length + index;
    return index;
  }
  if (isScript(text.at(cursor - 1))) {
    const index = cursor - 1;
    if (index < 0) return text.length + index;
    return index;
  }
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
  return ['space', 'superscript', 'subscript', 'script'].includes(char.type);
};

const isSpaceScript = (first: AbstractChar, second: AbstractChar) => {
  if (first?.type !== 'space') return false;
  return isScript(second);
};

type EditResult = { text: AbstractText; cursor: number; indexCursor: number };

export const editAdapter = (
  text: AbstractText,
  callback: (text: AbstractText) => EditResult,
) => {
  const { cursor, indexCursor } = callback(text);

  return {
    editCallback: (text: AbstractText) => callback(text).text,
    cursor,
    indexCursor,
  };
};

const editScriptInText = (
  currentText: AbstractText,
  insertMode: InsertMode,
  cursor: number,
  callback: (text: AbstractText) => EditResult,
): EditResult => {
  if (insertMode === 'normal')
    return { text: currentText, cursor, indexCursor: 0 };
  const scriptIndex = getScriptIndex(currentText, cursor);
  if (!scriptIndex) return { text: currentText, cursor, indexCursor: 0 };
  const script = currentText[scriptIndex] as Script;
  const currentScript = script[insertMode];
  const text = currentScript?.text;
  if (!text) return { text: currentText, cursor, indexCursor: 0 };

  const { text: newScriptText, cursor: newIndexCursor } = callback(text);

  const newScript = {
    ...script,
    [insertMode]: { type: insertMode, text: newScriptText },
  };

  return {
    text: toSpliced(currentText, scriptIndex, 1, newScript),
    cursor,
    indexCursor: newIndexCursor,
  };
};

export const addChar =
  (
    newText: string,
    insertMode: InsertMode = 'normal',
    cursor: number,
    cursorIndex: number,
  ) =>
  (currentText: AbstractText): EditResult => {
    if (insertMode !== 'normal') {
      const at = cursor < 0 ? currentText.length + 1 + cursor : cursor;

      if (!getScriptIndex(currentText, cursor)) {
        if (
          newText === ' ' ||
          currentText.length === 0 ||
          ['space'].includes(currentText[at - 1]?.type || currentText[at]?.type)
        )
          return { text: currentText, cursor, indexCursor: cursorIndex };

        const withScript = toSpliced(currentText, at, 0, {
          type: 'script',
          subscript: { type: 'subscript', text: [] },
          superscript: { type: 'superscript', text: [] },
        });

        return editScriptInText(
          withScript,
          insertMode,
          at,
          addText(newText, 'normal', cursorIndex, 0),
        );
      }
      return editScriptInText(
        currentText,
        insertMode,
        at,
        addText(newText, 'normal', cursorIndex, 0),
      );
    }

    const at = cursor < 0 ? currentText.length + 1 + cursor : cursor;
    if (isOperator(newText)) {
      return addAbstractChar(
        OPERATOR_MAP[newText],
        insertMode,
        at,
        cursorIndex,
      )(currentText);
    }

    if (currentText.length === 0)
      return {
        text: [{ type: 'char', value: newText }],
        cursor: 1,
        indexCursor: 0,
      };

    return {
      text: toSpliced(currentText, at, 0, {
        type: 'char',
        value: newText,
      }),
      cursor: at + 1,
      indexCursor: cursorIndex,
    };
  };

export const addText =
  (
    newText: string,
    insertMode: InsertMode = 'normal',
    cursor: number,
    cursorIndex: number,
  ) =>
  (currentText: AbstractText): EditResult => {
    return newText.split('').reduce(
      (acc, char) => {
        return addChar(char, insertMode, acc.cursor, acc.indexCursor)(acc.text);
      },
      { text: currentText, cursor, indexCursor: cursorIndex },
    );
  };

export const addAbstractChar =
  (
    char: AbstractChar,
    insertMode: InsertMode,
    cursor: number,
    cursorIndex: number,
  ) =>
  (currentText: AbstractText): EditResult => {
    const at = cursor < 0 ? currentText.length + 1 + cursor : cursor;
    const current = currentText[at - 1];
    if (isSpaceScript(current, char)) {
      return { text: currentText, cursor, indexCursor: cursorIndex };
    }

    if (!current) {
      return isBannedFirstChar(char)
        ? { text: [], cursor, indexCursor: cursorIndex }
        : { text: [char], cursor: 1, indexCursor: 0 };
    }

    if (insertMode !== 'normal') {
      if (!getScriptIndex(currentText, cursor)) {
        if (
          char?.type === 'space' ||
          currentText.length === 0 ||
          ['space', 'script'].includes(
            currentText[cursor - 1]?.type || currentText[cursor]?.type,
          )
        )
          return { text: currentText, cursor, indexCursor: cursorIndex };

        const withScript = toSpliced(currentText, cursor, 0, {
          type: 'script',
          subscript: { type: 'subscript', text: [] },
          superscript: { type: 'superscript', text: [] },
        });

        return editScriptInText(
          withScript,
          insertMode,
          cursor,
          addAbstractChar(char, 'normal', cursorIndex, 0),
        );
      }
      return editScriptInText(
        currentText,
        insertMode,
        cursor,
        addAbstractChar(char, 'normal', cursorIndex, 0),
      );
    }

    const isDoubleOperator = isOperatorType(char) && isOperatorType(current);
    if (isDoubleOperator) {
      return {
        text: toSpliced(
          currentText,
          at - 1,
          1,
          ...transformDoubleOperator(current, char),
        ),
        cursor: at,
        indexCursor: cursorIndex,
      };
    }

    return {
      text: toSpliced(currentText, at, 0, char),
      cursor: at + 1,
      indexCursor: cursorIndex,
    };
  };

export const deleteAbstractChar =
  (insertMode: InsertMode, cursor: number, cursorIndex: number) =>
  (currentText: AbstractText): EditResult => {
    if (insertMode !== 'normal') {
      return editScriptInText(
        currentText,
        insertMode,
        cursor,
        deleteAbstractChar('normal', cursor, cursorIndex),
      );
    }

    const at = cursor < 0 ? currentText.length + 1 + cursor : cursor;
    return {
      text: toSpliced(currentText, at - 1, 1),
      cursor: at - 1,
      indexCursor: cursorIndex,
    };
  };

export const deleteAbstractText =
  (
    insertMode: InsertMode,
    cursor: number,
    cursorIndex: number,
    length: number,
  ) =>
  (currentText: AbstractText): EditResult => {
    if (insertMode !== 'normal') {
      return editScriptInText(
        currentText,
        insertMode,
        cursor,
        deleteAbstractText('normal', cursor, cursorIndex, length),
      );
    }

    const at = cursor < 0 ? currentText.length + 1 + cursor : cursor;
    return {
      text: toSpliced(currentText, at - length, length),
      cursor: at - 1 - length,
      indexCursor: cursorIndex,
    };
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

  const newIndexCursor = indexCursorOnEnter(text, cursor, 'superscript');
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
