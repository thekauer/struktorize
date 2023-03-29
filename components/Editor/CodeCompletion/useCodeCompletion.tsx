import { useAst, useAstState, useNodeInScope } from '@/hooks/useAST';
import { defaultCodeCompletions } from 'constants/defaultCodeCompletions';
import { useEffect, useRef, useState } from 'react';
import FuzzySearch from "fuzzy-search";
import { getAllTextsExceptCurrent, getLastText } from './getAllTexts';
import { FunctionAst } from '@/lib/ast';

export const useCodeCompletion = () => {
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(false);
  const pathRef = useRef("");
  const node = useNodeInScope();
  const { addIf, addLoop, edit, backspace } = useAst();
  const { ast } = useAstState();


  const functionAst = ast as FunctionAst;

  const allNodes = [...functionAst.body, functionAst.signature]
  const allItems = [...defaultCodeCompletions, ...getAllTextsExceptCurrent(allNodes, node)]


  const searcher = new FuzzySearch(allItems, [], {
    sort: true,
  });


  const items = searcher.search(getLastText(node));

  useEffect(() => {
    setVisible(node.path === pathRef.current)

    pathRef.current = node.path;
  }, [node])

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key === " " && e.ctrlKey) {
        setVisible(true);
        setSelected(0);
      }
    }

    window.addEventListener("keydown", keydown)
    return () => window.removeEventListener("keydown", keydown)
  }, [])

  useEffect(() => {
    if (!visible) return;

    const popLastText = () => {
      backspace(getLastText(node).length);
    }

    const complete = () => {
      const item = items[selected];
      switch (item) {
        case "if":
          addIf();
          popLastText();
          // remove last text
          break;
        case "loop":
          addLoop();
          // remove last text
          break;
        default:
          edit(item)
        // replace item text

      }
    }

    const keydown = (e: KeyboardEvent) => {
      e.stopPropagation();
      e.preventDefault();
      switch (e.key) {
        case "ArrowDown":
          setSelected(prev => prev < items.length - 1 ? prev + 1 : 0);
          break;
        case "ArrowUp":
          setSelected(prev => prev > 0 ? prev - 1 : items.length - 1);
          break;
        case "Tab":
          complete();
          setVisible(false);
          break;
        case " ":
        case "Escape":
          setVisible(false);
          break;
      }
    }
    window.addEventListener("keydown", keydown);

    return () => {
      window.removeEventListener("keydown", keydown);
    }
  }, [visible]);

  return { items, visible, selected };
}
