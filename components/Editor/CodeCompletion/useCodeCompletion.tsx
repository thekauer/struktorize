import { useAst, useAstState, useNodeInScope } from '@/hooks/useAST';
import { defaultCodeCompletions } from '@/constants/defaultCodeCompletions';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import FuzzySearch from 'fuzzy-search';
import { FunctionAst, AbstractChar, AstNode, SwitchAst } from '@/lib/ast';
import { Cursor, InsertMode } from '@/lib/abstractText';
import { atom, useAtom } from 'jotai';
import { parseAll } from '@/lib/parser';

export const codeCompletionVisibleAtom = atom(false);
export const ccShownAtom = atom(false);

const getAllVariables = (ast: FunctionAst) => {
  return parseAll(ast)
    .map((node) => {
      if (node._type === 'signature') {
        return [
          {
            value: node.name,
            typeId: node.type as string,
            type: 'function' as const,
          },
          ...node.args.map((arg) => ({
            value: arg.name,
            typeId: arg.typeId as string,
            type: 'variable' as const,
          })),
        ];
      }

      return { value: node.name, type: 'variable' as const };
    })
    .flat();
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
  const seen = new Set<string>();

  const current = Cursor.currentWord(
    (node as Exclude<AstNode, SwitchAst>).text,
    cursor,
    indexCursor,
    insertMode,
  );

  const fnVariable = variables.find((variable) => variable.type === 'function');

  return variables.filter((variable) => {
    const name = `${variable.type}_${variable.value}`;
    if (variable.type === 'variable' && variable.value === fnVariable?.value)
      return false;
    if (seen.has(name)) return false;

    seen.add(name);
    return true;
  });
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
      type: 'function';
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
  const [shown, setShown] = useAtom(ccShownAtom);
  const pathRef = useRef('');
  const mountedref = useRef(false);
  const node = useNodeInScope();
  const { add, edit, insert, popLastText } = useAst();
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

  const items: CodeCompletionItem[] =
    currentWord === null ? allItems : searcher.search(currentWord);

  setShown(visible && items.length > 0);

  useLayoutEffect(() => {
    if (!mountedref.current) return;
    setVisible(node.path === pathRef.current && node.text.length > 0);

    pathRef.current = node.path;
  }, [node]);

  const complete = (item: CodeCompletionItem, before?: boolean) => {
    popLastText();
    switch (item.value) {
      case 'if':
        add({ type: 'branch', before });
        break;
      case 'loop':
        add({ type: 'loop', before });
        break;
      case 'switch':
        add({ type: 'switch', before });
        break;
      case 'case':
        add({ type: 'case', before });
        break;

      default:
        if (item.type === 'symbol') {
          insert(item.symbol, undefined, true);

          return;
        }
        edit(item.value, undefined, 'none', true);
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
      switch (e.key) {
        case 'ArrowDown':
          e.stopPropagation();
          e.preventDefault();
          setSelected((prev) => (prev < length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.stopPropagation();
          e.preventDefault();
          setSelected((prev) => (prev > 0 ? prev - 1 : length - 1));
          break;
        case 'Enter':
        case 'Tab':
          e.stopPropagation();
          e.preventDefault();
          complete(items[selected], e.shiftKey);
          document.querySelector<HTMLDivElement>('#root-container')?.focus();
          setVisible(false);
          break;
        case ' ':
          e.stopPropagation();
          e.preventDefault();
          setVisible(false);
          break;
      }
    };
    window.addEventListener('keydown', keydown);

    return () => {
      window.removeEventListener('keydown', keydown);
    };
  }, [shown, items, selected]);

  return { items, visible: shown, selected };
};
