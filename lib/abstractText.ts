import {
  AbstractChar,
  AbstractText,
  Ast,
  TraversableAstNode,
  InsertInsideAvailable,
  Operator,
  Subscript,
  SuperScript,
  Symbol,
  traverse,
  Variable,
} from './ast';

const getLast = <T extends AbstractChar>(text: AbstractText) => {
  return text.at(-1) as T | undefined;
};

const doesEndWithScript = (text: AbstractText) => {
  const last = getLast(text);
  if (!last) return false;

  return last.type === 'subscript' || last.type === 'superscript';
};

export const isScript = (char: AbstractChar) => {
  return char.type === 'subscript' || char.type === 'superscript';
};

const isNextToSuperscript = (text: AbstractText, cursor: number) => {
  return (
    text[cursor]?.type === 'superscript' ||
    (text[cursor]?.type === 'subscript' &&
      text[cursor + 1]?.type === 'superscript') ||
    (text[cursor - 1]?.type === 'subscript' &&
      text[cursor - 2]?.type === 'superscript') ||
    text[cursor - 1]?.type === 'superscript' ||
    text[cursor]?.type === 'superscript'
  );
};

const isNextToSubscript = (text: AbstractText, cursor: number) => {
  return (
    text[cursor]?.type === 'subscript' ||
    (text[cursor]?.type === 'superscript' &&
      text[cursor + 1]?.type === 'subscript') ||
    (text[cursor - 1]?.type === 'superscript' &&
      text[cursor - 2]?.type === 'subscript') ||
    text[cursor - 1]?.type === 'subscript' ||
    text[cursor]?.type === 'subscript'
  );
};

const doesEndWithVariable = (text: AbstractText) => {
  return getLast(text)?.type === 'variable';
};

export type InsertMode = 'normal' | 'superscript' | 'subscript';

const isInsertInsideAvaiable = (char: AbstractChar) => {
  switch (char.type) {
    case 'subscript':
    case 'superscript':
      return true;
  }
  return false;
};

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
  return second.type === 'superscript' || second.type === 'subscript';
};

const isSameScriptTwice = (first: AbstractChar, second: AbstractChar) => {
  const script = ['superscript', 'subscript'];
  return script.includes(first.type) && first.type === second.type;
};

const getClosestSubscript = (text: AbstractText, cursor: number) => {
  if (text[cursor]?.type === 'subscript') {
    return text[cursor] as Subscript;
  }
  if (
    text[cursor]?.type === 'superscript' &&
    text[cursor + 1]?.type === 'subscript'
  ) {
    return text[cursor + 1] as Subscript;
  }
  if (
    text[cursor - 1]?.type === 'superscript' &&
    text[cursor - 2]?.type === 'subscript'
  ) {
    return text[cursor - 2] as Subscript;
  }
  if (text[cursor - 1]?.type === 'subscript') {
    return text[cursor - 1] as Subscript;
  }
};

const getClosestSuperscript = (text: AbstractText, cursor: number) => {
  if (text[cursor]?.type === 'superscript') {
    return text[cursor] as SuperScript;
  }
  if (
    text[cursor]?.type === 'subscript' &&
    text[cursor + 1]?.type === 'superscript'
  ) {
    return text[cursor + 1] as SuperScript;
  }
  if (
    text[cursor - 1]?.type === 'subscript' &&
    text[cursor - 2]?.type === 'superscript'
  ) {
    return text[cursor - 2] as SuperScript;
  }
  if (text[cursor - 1]?.type === 'superscript') {
    return text[cursor - 1] as SuperScript;
  }
};

const variableAt = (text: AbstractText,insertMode: InsertMode, cursor: number, indexCursor: number): {variable: Variable; index:number;offset:number} |null => {
  const index = text
    .map((char) => (char.type === 'variable' ? char.name.length : 1))
    .findLastIndex((length) => length < cursor);

  if (index === -1) return null;

  if(insertMode !== 'normal') {
    if(insertMode === 'superscript') {
      const subscript = getClosestSubscript(text, index);
      if (subscript) {
        return  variableAt(subscript.text,'normal',indexCursor,0)
      }
    }

    if(insertMode === 'subscript') {
      const superscript = getClosestSuperscript(text, index);
      if (superscript) {
        return  variableAt(superscript.text,'normal',indexCursor,0)
      }
    }

    return null;
  }

  return {
    variable: text[index] as Variable,
    index,
    offset: cursor - index - 1,
  };
};

export const addText2 =
  (
    newText: string,
    insertMode: InsertMode = 'normal',
    cursor: number,
    cursorIndex: number,
  ) =>
  (currentText: AbstractText): AbstractText => {
    const variable = variableAt(currentText,insertMode ,cursor,cursorIndex);
    if (!variable) return [{ type: 'variable', name: newText }];

    const head = currentText.slice(0, variable.index);
    const tail = currentText.slice(variable.index + 1);

    const name =
      variable.variable.name.slice(0, variable.offset) +
      newText +
      variable.variable.name.slice(variable.offset);

    return head.concat([{ type: 'variable', name }], tail);
  };
}

export const addText =
  (
    newText: string,
    insertMode: InsertMode = 'normal',
    cursor: number,
    cursorIndex: number,
  ) =>
  (currentText: AbstractText): AbstractText => {
    const last = getLast(currentText);

    if (isOperator(newText)) {
      return addAbstractChar(OPERATOR_MAP[newText], insertMode)(currentText);
    }

    if (!last) return [{ type: 'variable', name: newText }];
    if (insertMode !== 'normal' && isInsertInsideAvaiable(last)) {
      const lastInsertable = last as InsertInsideAvailable;
      return currentText.slice(0, -1).concat({
        ...lastInsertable,
        text: addText(
          newText,
          'normal',
          cursor,
          cursorIndex,
        )(lastInsertable.text),
      });
    }

    if (last.type === 'variable') {
      return currentText.slice(0, -1).concat({
        ...last,
        name: last.name + newText,
      });
    }

    return currentText.concat({ type: 'variable', name: newText });
  };

export const addAbstractChar =
  (char: AbstractChar, insertMode: InsertMode) =>
  (currentText: AbstractText): AbstractText => {
    const last = getLast(currentText);
    if (!last) return isBannedFirstChar(char) ? [] : [char];

    if (isSameScriptTwice(last, char)) return currentText;
    if (isSpaceScript(last, char)) return currentText;
    const isDoubleOperator = isOperatorType(char) && isOperatorType(last);
    if (isDoubleOperator) {
      return currentText
        .slice(0, -1)
        .concat(transformDoubleOperator(last, char));
    }

    if (insertMode !== 'normal' && isInsertInsideAvaiable(last)) {
      const lastInsertable = last as InsertInsideAvailable;

      return currentText.slice(0, -1).concat({
        ...lastInsertable,
        text: addAbstractChar(char, 'normal')(lastInsertable.text),
      });
    }

    return currentText.concat(char);
  };

export const deleteLast = (text: AbstractText): AbstractText => {
  if (doesEndWithScript(text)) {
    return text.slice(0, -1);
  }

  if (doesEndWithVariable(text)) {
    const lastText = getLast<Variable>(text)!.name;
    if (lastText.length > 1) {
      const newLastVariable: Variable = {
        type: 'variable',
        name: lastText.substring(0, lastText.length - 1),
      };
      return text.slice(0, -1).concat([newLastVariable]);
    }

    return text.slice(0, -1);
  }

  return text.slice(0, -1);
};

export const deleteLastVariable = (text: AbstractText): AbstractText => {
  if (doesEndWithVariable(text)) {
    return text.slice(0, -1);
  }
  if (doesEndWithScript(text)) {
    const last = getLast<Subscript | SuperScript>(text)!;
    const newText = last.text.slice(0, -1);
    const newLast = { type: last.type, text: newText };
    return text.slice(0, -1).concat(newLast);
  }
  return text;
};

const getAllVariablesInNode = (node: TraversableAstNode) => {
  return node.text.reduce((acc, curr) => {
    switch (curr.type) {
      case 'subscript':
      case 'superscript':
        return acc.concat(
          curr.text.filter((char) => char.type === 'variable') as Variable[],
        );
      case 'variable':
        acc.push(curr);
        return acc;
      default:
        return acc;
    }
  }, [] as Variable[]);
};

const getAllVariableNames = (body: Ast) => {
  const variables = traverse(body, (node) =>
    getAllVariablesInNode(node as TraversableAstNode),
  );
  return Array.from(new Set(variables.map((variable) => variable.name)));
};

export const getLastText = (current: TraversableAstNode) => {
  return getAllVariablesInNode(current).at(-1)?.name;
};

export const getAllVariablesExceptCurrent = (
  body: Ast,
  current: TraversableAstNode,
) => {
  return getAllVariableNames(body).filter(
    (variable) => variable !== getLastText(current),
  );
};

export const getFunctionName = (text: AbstractText): string => {
  return text[0]?.type === 'variable' ? text[0]?.name : '';
};

export const doesEndWithSpace = (text: AbstractText) => {
  return text.at(-1)?.type === 'space';
};

export const preprocess = (text: AbstractText): AbstractText => {
  return text.flatMap((char) => {
    if (char.type === 'variable') {
      return (char as Variable).name.split('').map((char) => {
        return { type: 'variable', name: char } as AbstractChar;
      });
    }
    if (isScript(char)) {
      const text = preprocess((char as Subscript | SuperScript).text);
      return { ...char, text };
    }
    return char as AbstractChar;
  });
};

export const strlen = (text?: AbstractText) => {
  if (!text) return 0;
  if (text.length === 0) return 0;

  return text.reduce((acc, curr) => {
    switch (curr.type) {
      case 'variable':
        return acc + curr.name.length;
      default:
        return acc + 1;
    }
  }, 0);
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
  if (!isOnRightSideOfScript(text, cursor)) {
    return 0;
  }

  if (nextInsertMode === 'subscript') {
    if (text[cursor - 1] && text[cursor - 1].type === 'subscript') {
      const prev = text[cursor - 1] as Subscript;
      return strlen(prev.text);
    }
    if (text[cursor - 2] && text[cursor - 2].type === 'subscript') {
      const prevPrev = text[cursor - 2] as Subscript;
      return strlen(prevPrev.text);
    }
  }

  // superscript

  if (text[cursor - 1] && text[cursor - 1].type === 'superscript') {
    const prev = text[cursor - 1] as SuperScript;
    return strlen(prev.text);
  }
  if (text[cursor - 2] && text[cursor - 2].type === 'superscript') {
    const prevPrev = text[cursor - 2] as SuperScript;
    return strlen(prevPrev.text);
  }

  return 0;
};


const right = (
  text: AbstractText,
  cursor: number,
  indexCursor: number,
  insertMode: InsertMode = 'normal',
  jump: Jump = 'none',
): CursorMovement => {
  if (insertMode === 'subscript') {
    const subscript = getClosestSubscript(text, cursor);
    if (subscript) {
      const text = preprocess(subscript.text);
      const movement = right(text, indexCursor, 0, 'normal', jump);
      return { cursor, insertMode, indexCursor: movement.cursor };
    }
  }
  if (insertMode === 'superscript') {
    const superscript = getClosestSuperscript(text, cursor);
    if (superscript) {
      const text = preprocess(superscript.text);
      const movement = right(text, indexCursor, 0, 'normal', jump);
      return { cursor, insertMode, indexCursor: movement.cursor };
    }
  }

  if (cursor === text.length) return { cursor, insertMode, indexCursor };
  if (jump === 'line')
    return { cursor: strlen(text), insertMode: 'normal', indexCursor };
  if (
    jump === 'word' &&
    cursor < text.length - 1 &&
    text[cursor + 1].type === 'variable'
  )
    return right(text, cursor + 1, indexCursor, insertMode, jump);

  if (
    cursor < text.length - 1 &&
    text[cursor] &&
    isScript(text[cursor]) &&
    text[cursor + 1] &&
    isScript(text[cursor + 1])
  )
    return { cursor: cursor + 2, insertMode, indexCursor };

  return { cursor: cursor + 1, insertMode, indexCursor };
};

const left = (
  text: AbstractText,
  cursor: number,
  indexCursor: number,
  insertMode: InsertMode = 'normal',
  jump: Jump = 'none',
): CursorMovement => {
  if (insertMode === 'subscript') {
    const subscript = getClosestSubscript(text, cursor);
    if (subscript) {
      const text = preprocess(subscript.text);
      const movement = left(text, indexCursor, 0, 'normal', jump);
      return { cursor, insertMode, indexCursor: movement.cursor };
    }
  }
  if (insertMode === 'superscript') {
    const superscript = getClosestSuperscript(text, cursor);
    if (superscript) {
      const text = preprocess(superscript.text);
      const movement = left(text, indexCursor, 0, 'normal', jump);
      return { cursor, insertMode, indexCursor: movement.cursor };
    }
  }

  if (cursor === 0) return { cursor, insertMode, indexCursor };
  if (jump === 'line') return { cursor: 0, insertMode: 'normal', indexCursor };

  const prev = text[cursor - 1];
  if (jump === 'word' && cursor > 0 && prev?.type === 'variable')
    return left(text, cursor - 1, indexCursor, insertMode, jump);
  if (
    cursor > 0 &&
    prev &&
    isScript(prev) &&
    text[cursor - 2] &&
    isScript(text[cursor - 2])
  )
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
  if (!isNextToSuperscript(text, cursor))
    return { cursor, insertMode, indexCursor };

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
  if (!isNextToSubscript(text, cursor))
    return { cursor, insertMode, indexCursor };

  const newIndexCursor = indexCursorOnEnter(text, cursor, 'subscript');

  return { cursor, insertMode: 'subscript', indexCursor: newIndexCursor };
};

export const Cursor = {
  up,
  down,
  left,
  right,
};
