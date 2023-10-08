'use client';

import { useAstState } from '@/hooks/useAST';
import { InsertMode, getScriptIndex } from '@/lib/abstractText';
import {
  AbstractChar,
  AbstractText as AbstractTextType,
  Char,
  MathBB,
} from '@/lib/ast';
import { Latex } from '../Latex/Latex';
import { useEffect, useRef, useState } from 'react';
import * as S from './AbstractText.atoms';

interface AbstractTextProps {
  hovered: boolean;
  children: AbstractTextType;
}

type BasicAbstractChar = Exclude<
  AbstractChar,
  | { type: 'char' }
  | { type: 'subscript' }
  | { type: 'superscript' }
  | { type: 'script' }
  | { type: 'mathbb' }
>;

const exhaustiveMatchingGuard = (_: never): never => {
  throw new Error('Unreachable');
};

const basicTransform = (char: BasicAbstractChar): string => {
  switch (char.type) {
    case 'and':
      return '\\&';
    case 'or':
      return '|';
    case 'eq':
      return '=';
    case 'lt':
      return '<';
    case 'gt':
      return '>';
    case 'colon':
      return ':';
    case 'comma':
      return ',';
    case 'semicolon':
      return ';';
    case 'lp':
      return '(';
    case 'rp':
      return ')';
    case 'lb':
      return '[';
    case 'rb':
      return ']';
    case 'lc':
      return '\\{';
    case 'rc':
      return '\\}';
    case 'star':
      return '\\star{}';
    case 'bang':
      return '!';
    case 'space':
      return '\\;';
    case 'minus':
      return '-';
    case 'dot':
      return '.';
    case 'epsilon':
      return '\\varepsilon{}';
    case 'pi':
      return '\\pi{}';
    case 'in':
      return '\\in{}';
    case 'infinity':
      return '\\infty{}';
    case 'forall':
      return '\\forall{}';
    case 'exists':
      return '\\exists{}';
    case 'land':
      return '\\land{}';
    case 'lor':
      return '\\lor{}';
    case 'lnot':
      return '\\neg{}';
    case 'neq':
      return '\\neq{}';
    case 'ge':
      return '\\ge{}';
    case 'le':
      return '\\le{}';
    case 'coloneq':
      return '\\coloneqq{}';
    case 'arrow':
      return '\\rightarrow{}';
    case 'times':
      return '\\times{}';
    case 'empty':
      return '\\emptyset{}';
  }

  const { type } = char;
  return exhaustiveMatchingGuard(type);
};

const SCRIPT_STYLE =
  '\\htmlStyle{background-color: var(--s-script); padding: 2px; border-radius: 3px;z-index: 2;}';

const scriptBody = (
  isHighlighted: boolean,
  insertmode: InsertMode,
  type: InsertMode,
  script: string,
) => {
  if (isHighlighted && insertmode === type) {
    return `{${SCRIPT_STYLE}{\\htmlId{highlighted_script}{${script}}}}`;
  }

  return `{${script}}`;
};

const transform = (
  text: AbstractTextType,
  insertmode: InsertMode,
  cursor: number,
) => {
  return text
    .map((char, index): string => {
      const isHighlighted = index === cursor;

      switch (char.type) {
        case 'char': {
          const text = (char as Char).value;
          return `\\text{${text}}`;
        }
        case 'script': {
          const superscriptText = char.superscript
            ? transform(char.superscript.text, 'normal', cursor)
            : '';
          const subscriptText = char.subscript
            ? transform(char.subscript.text, 'normal', cursor)
            : '';

          const superscript = scriptBody(
            isHighlighted,
            insertmode,
            'superscript',
            superscriptText,
          );
          const subscript = scriptBody(
            isHighlighted,
            insertmode,
            'subscript',
            subscriptText,
          );

          return `^{${superscript}}_{${subscript}}`;
        }
        case 'mathbb': {
          return `\\mathbb{${(char as MathBB).value}}`;
        }
        default: {
          return basicTransform(char);
        }
      }
    })
    .join('');
};

export const AbstractText = ({ children, hovered }: AbstractTextProps) => {
  const { insertMode, editing, cursor, indexCursor } = useAstState();
  const [scriptOffset, setScriptOffset] = useState(0);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) return;
    const script = document.querySelector('#highlighted_script');
    if (!script) {
      if (insertMode !== 'normal') {
        setScriptOffset(9);
      }
      return;
    }
    const getCharRight = () => {
      if (indexCursor === 0) {
        const char = script.children?.item(0) as HTMLElement;
        return char?.getBoundingClientRect().left;
      } else {
        const char = script.children?.item(indexCursor - 1) as HTMLElement;
        return char?.getBoundingClientRect().right;
      }
    };

    const charRight = getCharRight();
    if (!charRight) {
      setScriptOffset(0);
      return;
    }
    const scriptRight = script.getBoundingClientRect().left;
    const offset = charRight - scriptRight;
    setScriptOffset(offset);
  }, [indexCursor, editing, insertMode]);

  useEffect(() => {
    cursorRef.current?.getAnimations?.()?.forEach((animation) => {
      animation.cancel();
      animation.play();
    });
  }, [cursor]);

  const text = children;
  const middle =
    insertMode !== 'normal'
      ? getScriptIndex(text, cursor) ?? cursor - 1
      : cursor;

  const isEditing = editing && hovered;

  if (!isEditing) {
    const text = transform(children, insertMode, middle);
    return <Latex>{text}</Latex>;
  }

  const left = transform(text.slice(0, middle), insertMode, middle);
  const right = transform(text.slice(middle), insertMode, 0);

  return (
    <>
      {left.length > 0 && <Latex>{left}</Latex>}
      <S.Cursor
        $insertMode={insertMode}
        $offset={scriptOffset}
        ref={cursorRef}
      />
      <div id="cursor" />
      {right.length > 0 && <Latex>{right}</Latex>}
    </>
  );
};
