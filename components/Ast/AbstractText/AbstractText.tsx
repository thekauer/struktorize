'use client';

import { useAstState } from '@/hooks/useAST';
import { InsertMode, preprocess } from '@/lib/abstractText';
import {
  AbstractChar,
  AbstractText as AbstractTextType,
  MathBB,
  Subscript,
  SuperScript,
  Variable,
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
  | { type: 'variable' }
  | { type: 'subscript' }
  | { type: 'superscript' }
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
        case 'variable': {
          const text = (char as Variable).name;
          return `\\text{${text}}`;
        }
        case 'superscript': {
          const text = (char as SuperScript).text;
          const transformedText = transform(text, 'normal');
          return `^{${
            isLast && insertmode === 'superscript' ? SCRIPT_STYLE : ''
          }{${transformedText}}}`;
        }
        case 'subscript': {
          const text = (char as Subscript).text;
          const transformedText = transform(text, 'normal');
          return `_{${
            isLast && insertmode === 'subscript' ? SCRIPT_STYLE : ''
          }{${transformedText}}}`;
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
  const { insertMode, editing, cursor } = useAstState();
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

  const text = preprocess(children);
  const left = transform(text.slice(0, cursor), insertMode);
  const right = transform(text.slice(cursor), insertMode);

  return (
    <>
      {left.length > 0 && <Latex>{left}</Latex>}
      <S.Cursor $insertMode={insertMode} ref={cursorRef} />
      {right.length > 0 && <Latex>{right}</Latex>}
    </>
  );
};
