import { useTheme } from '../../hooks/useTheme';
import { KeyboardEvent, useRef } from 'react';
import { useAst, useAstState } from '../../hooks/useAST';
import { Jump } from '@/lib/abstractText';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  ccShownAtom,
  codeCompletionVisibleAtom,
} from './CodeCompletion/useCodeCompletion';

interface UseEditorProps {
  readonly?: boolean;
  disableNavigation?: boolean;
}

export const useEditor = ({ readonly, disableNavigation }: UseEditorProps) => {
  const {
    up,
    down,
    left,
    right,
    edit,
    backspace,
    deleteBlock,
    add,
    deselectAll,
    undo,
    redo,
    setInsertMode,
    setEditing,
    toggleEditing,
  } = useAst();
  const { editing, insertMode } = useAstState();
  const { astTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const setCCVisible = useSetAtom(codeCompletionVisibleAtom);
  const ccShown = useAtomValue(ccShownAtom);

  const getKey = (e: KeyboardEvent) => {
    if (e.key === 'Dead' && e.code === 'Digit3') return '^';
    return e.key;
  };

  const handleUndoRedo = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
      redo();
    }
    if (e.ctrlKey && e.key === 'z') {
      undo();
    }
  };

  const handleDeleteBlock = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.key === 'Backspace') {
      setInsertMode('normal');
      deleteBlock();
    }
  };

  const handleKeydown = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = getKey(e);

    if (!readonly) {
      handleUndoRedo(e);
      handleDeleteBlock(e);

      if (e.key === 'Enter') {
        setEditing(false);
      }

      if (e.key === 'Escape') {
        if (ccShown) {
          setCCVisible(false);
          return;
        }
        if (editing && insertMode === 'normal') {
          toggleEditing();
          return;
        }
        if (insertMode !== 'normal') {
          setCCVisible(false);
          setInsertMode('normal');
          return;
        }
      }

      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        toggleEditing();
      }
    }
    if (e.ctrlKey) return;

    const jump = e.ctrlKey ? 'line' : e.altKey ? 'word' : 'none';
    const navigationPayload = {
      select: e.shiftKey,
      move: e.altKey,
      jump: jump as Jump,
    };
    const canDeselect = !(e.shiftKey || e.altKey);
    if (!disableNavigation) {
      switch (key) {
        case 'ArrowUp':
          up(navigationPayload);
          if (canDeselect) deselectAll();
          return;
        case 'ArrowDown':
          down(navigationPayload);
          if (canDeselect) deselectAll();
          return;
        case 'ArrowLeft':
          left(navigationPayload);
          if (canDeselect) deselectAll();
          return;
        case 'ArrowRight':
          right(navigationPayload);
          if (canDeselect) deselectAll();
          return;
        case 'Escape':
          setInsertMode('normal');
          return;
      }
    }
    if (readonly) return;

    switch (key) {
      case 'Backspace':
        backspace();
        return;
      case 'Enter':
        if (!ccShown) add({ type: 'statement', before: e.shiftKey });
        return;
      case '^':
        setInsertMode('superscript');
        return;
      case '_':
        setInsertMode('subscript');
        return;
    }

    const allowedChars =
      /^[a-zA-Z0-9_:\+\/\(\)\*\- \"\^=\.\&\|<>!\^\×\,\[\]\{\}\;]{1}$/;
    if (allowedChars.test(key)) {
      const finalKey = e.shiftKey ? key.toUpperCase() : key;
      edit(finalKey);
    }
  };

  const containerProps = {
    id: 'root-container',
    className: `s-${astTheme}`,
    onKeyDown: handleKeydown,
    ref: rootRef,
    tabIndex: 0,
  };
  return { containerProps, rootRef };
};
