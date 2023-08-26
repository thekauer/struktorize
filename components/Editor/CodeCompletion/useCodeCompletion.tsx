import { useAst, useAstState, useNodeInScope } from '@/hooks/useAST';
import { defaultCodeCompletions } from 'constants/defaultCodeCompletions';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import FuzzySearch from 'fuzzy-search';
import { FunctionAst, AbstractChar, AstNode, SwitchAst } from '@/lib/ast';
import { Cursor, InsertMode } from '@/lib/abstractText';
import { atom, useAtom } from 'jotai';
import { parseAll } from '@/lib/parser';

export const codeCompletionVisibleAtom = atom(false);

const getAllVariables = (ast: FunctionAst) => {
  return parseAll(ast).flatMap((node) => {
    if (node.type === 'signature') {
      return [
        {
          value: node.name,
          typeId: node.returnTypeId,
          type: 'function' as const,
        },
        ...node.args.map((arg) => ({
          value: arg.name,
          typeId: arg.typeId,
          type: 'variable' as const,
        })),
      ];
    }

    return { value: node.name, type: 'variable' as const };
  });
};

const getAllVariablesExceptCurrent = (
  ast: FunctionAst,
  node: AstNode,
  cursor: number,
  indexCursor: number,
  insertMode: InsertMode,
) => {
  const variables = getAllVariables(ast);
  if (node.type === 'switch') return variables;

  const current = Cursor.currentWord(
    (node as Exclude<AstNode, SwitchAst>).text,
    cursor,
    indexCursor,
    insertMode,
  );

  return variables.filter((variable) => variable.value !== current);
};

export type CodeCompletionItem =
  | {
      value: string;
      typeId?: string;
      type: 'variable';
    }
  | {
      value: string;
      typeId?: string;
      type: 'variable';
    }
  | {
      value: string;
      type: 'keyword';
    }
  | {
      type: 'symbol';
      value: string;
      symbol: AbstractChar;
    };

export const useCodeCompletion = () => {
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useAtom(codeCompletionVisibleAtom);
  const pathRef = useRef('');
  const mountedref = useRef(false);
  const node = useNodeInScope();
  const {
    addIf,
    addLoop,
    addSwitch,
    addCase,
    edit,
    insert,
    popLastText,
    setInsertMode,
  } = useAst();
  const { ast, cursor, indexCursor, insertMode } = useAstState();

  const functionAst = ast as FunctionAst;

  const allItems: CodeCompletionItem[] = [
    ...defaultCodeCompletions,
    ...getAllVariablesExceptCurrent(
      functionAst,
      node,
      cursor,
      indexCursor,
      insertMode,
    ),
  ];

  const searcher = new FuzzySearch(allItems, ['value'], {
    sort: true,
  });

  const currentWord = Cursor.currentWord(
    node?.text || [],
    cursor,
    indexCursor,
    insertMode,
  );
  const items: CodeCompletionItem[] = currentWord
    ? allItems
    : searcher.search(currentWord);

  const shown = visible && items.length > 0;

  useLayoutEffect(() => {
    if (!mountedref.current) return;
    setVisible(node.path === pathRef.current && node.text.length > 0);

    pathRef.current = node.path;
  }, [node]);

  const complete = (item: CodeCompletionItem) => {
    popLastText();
    switch (item.value) {
      case 'if':
        addIf();
        break;
      case 'loop':
        addLoop();
        break;
      case 'switch':
        addSwitch();
        break;
      case 'case':
        addCase();
        break;

      default:
        if (item.type === 'symbol') {
          insert(item.symbol);

          return;
        }
        edit(item.value);
        break;
    }
  };

  useEffect(() => {
    if (!mountedref.current) {
      mountedref.current = true;
    }
    const keydown = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.ctrlKey) {
        setVisible(true);
        setSelected(0);
      }
    };

    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, []);

  useEffect(() => {
    if (!shown) return;

    const keydown = (e: KeyboardEvent) => {
      if (!shown) return;
      const length = items.length;
      e.stopPropagation();
      e.preventDefault();
      switch (e.key) {
        case 'ArrowDown':
          setSelected((prev) => (prev < length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          setSelected((prev) => (prev > 0 ? prev - 1 : length - 1));
          break;
        case 'ArrowRight':
          setInsertMode('normal');
          break;
        case 'Tab':
          complete(items[selected]);
          document.querySelector<HTMLDivElement>('#root-container')?.focus();
          setVisible(false);
          break;
        case ' ':
        case 'Escape':
          setVisible(false);
          break;
        default:
          setSelected(0);
      }
    };
    window.addEventListener('keydown', keydown);

    return () => {
      window.removeEventListener('keydown', keydown);
    };
  }, [shown, items, selected]);

  return { items, visible: shown, selected };
};
