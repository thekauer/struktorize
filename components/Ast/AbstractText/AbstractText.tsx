'use client';

import { useAstState } from '@/hooks/useAST';
import { InsertMode, getScriptIndex, isScript } from '@/lib/abstractText';
import {
  AbstractChar,
  AbstractText as AbstractTextType,
  Char,
  MathBB,
} from '@/lib/ast';
import { Latex } from '../Latex/Latex';
import { useEffect, useRef } from 'react';
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
  '\\htmlStyle{background-color: var(--s-script); padding: 2px; border-radius: 3px;}';

const transform = (text: AbstractTextType, insertmode: InsertMode) => {
  return text
    .map((char, index, { length }): string => {
      const isLast = index === length - 1;
      switch (char.type) {
        case 'char': {
          const text = (char as Char).value;
          return `\\text{${text}}`;
        }
        case 'script': {
          switch (insertmode) {
            case 'superscript': {
              const text = char.superscript?.text;
              if (!text) return '';
              const transformedText = transform(text, 'normal');
              return `^{${
                isLast && insertmode === 'superscript' ? SCRIPT_STYLE : ''
              }{${transformedText}}}`;
            }
            case 'subscript': {
              const text = char.subscript?.text;
              if (!text) return '';
              const transformedText = transform(text, 'normal');
              return `_{${
                isLast && insertmode === 'subscript' ? SCRIPT_STYLE : ''
              }{${transformedText}}}`;
            }
          }
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
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cursorRef.current?.getAnimations().forEach((animation) => {
      animation.cancel();
      animation.play();
    });
  }, [cursor]);

  const isEditing = editing && hovered;

  if (!isEditing) {
    const text = transform(children, insertMode);
    return <Latex>{text}</Latex>;
  }

  const text = children;
  const middle =
    insertMode === 'normal' ? getScriptIndex(text, cursor) ?? cursor : cursor;

  const left = transform(text.slice(0, middle), insertMode);
  const right = transform(text.slice(middle), insertMode);

  return (
    <>
      {left.length > 0 && <Latex>{left}</Latex>}
      <S.Cursor
        $insertMode={insertMode}
        $offset={indexCursor}
        ref={cursorRef}
      />
      {right.length > 0 && <Latex>{right}</Latex>}
    </>
  );
};
