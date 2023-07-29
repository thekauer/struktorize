import { useEffect, useRef, useState } from 'react';
import { FileDTO } from '../../pages/api/files';
import { File } from '@/lib/repository';
import { useExplorer } from '../SideMenu/Files/Explorer/useExplorer';
import * as S from './CommandPalette.atoms';
import FuzzySearch from 'fuzzy-search';
import { useSetAtom } from 'jotai';
import { codeCompletionVisibleAtom } from '../Editor/CodeCompletion/useCodeCompletion';

export const CommandPalette = () => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [input, setInput] = useState<string>('');
  const [selected, setSelected] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { onFileClick, files } = useExplorer();
  const setCCVisible = useSetAtom(codeCompletionVisibleAtom);

  const searcher = new FuzzySearch(files, ['path'], {
    caseSensitive: false,
  });
  const filter: string[] = searcher
    .search(input)
    .map(({ path }: FileDTO) => path);

  const nodes: File[] = files.filter(
    (node: File) =>
      node.type === 'file' && filter.find((path) => path === node.path),
  );

  useEffect(() => {
    const commandPaletteToggle = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }

      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener('keydown', commandPaletteToggle);

    return () => {
      document.removeEventListener('keydown', commandPaletteToggle);
    };
  }, []);

  useEffect(() => {
    const focusRoot = () =>
      document.querySelector<HTMLDivElement>('#root-container')?.focus();

    if (showCommandPalette) setCCVisible(false);

    if (showCommandPalette) inputRef.current?.focus();
    else focusRoot();
  }, [showCommandPalette]);

  if (!showCommandPalette) return null;

  return (
    <S.Container
      onKeyDown={(e) => {
        const length = filter.length;
        if (e.key === 'ArrowDown') {
          setSelected((prev) => (prev + 1 > length - 1 ? 0 : prev + 1));
        }
        if (e.key === 'ArrowUp') {
          setSelected((prev) => (prev - 1 < 0 ? length - 1 : prev - 1));
        }

        if (e.key === 'Enter') {
          const selectedFile = nodes[selected];
          if (selectedFile) {
            onFileClick(selectedFile.path);
            setInput('');
            setSelected(0);
            setShowCommandPalette(false);
          }
        }
      }}
    >
      <S.Input
        ref={inputRef}
        value={input}
        onChange={async (e) => {
          setInput(e.target.value);
          setSelected(0);
        }}
      />
      <S.FilesContainer>
        {nodes.map((f, index) => {
          const splits = f.path.split('/');
          const name = splits.at(-1);
          const path = splits.slice(0, -1).join('/');

          return (
            <S.File selected={index === selected} key={f.path}>
              <span>{name}</span> <S.Path>{path}</S.Path>
            </S.File>
          );
        })}
      </S.FilesContainer>
    </S.Container>
  );
};
