import { useEffect, useRef, useState } from "react";
import { FileDTO } from "../../pages/api/files";
import { useExplorer } from "../SideMenu/Files/Explorer/useExplorer";
import { useFiles } from "../SideMenu/Files/Explorer/useFiles";
import * as S from "./CommandPalette.atoms";

export const CommandPalette = () => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [input, setInput] = useState<string>("");
  const [selected, setSelected] = useState<number>(0);
  const [filter, setFilter] = useState<string[]>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { onFileClick, files } = useExplorer();

  useEffect(() => {
    const commandPaletteToggle = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }

      if (e.key === "Escape") {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener("keydown", commandPaletteToggle);

    return () => {
      document.removeEventListener("keydown", commandPaletteToggle);
    };
  }, []);

  useEffect(() => {
    const focusRoot = () =>
      document.querySelector<HTMLDivElement>("#root-container")?.focus();

    if (showCommandPalette) inputRef.current?.focus();
    else focusRoot();
  }, [showCommandPalette]);

  const nodes = files.filter(
    (node) =>
      node.type === "file" &&
      (filter?.find((path) => path === node.path) || filter === undefined)
  );

  if (!showCommandPalette) return null;

  return (
    <S.Container
      onKeyDown={(e) => {
        const length = filter?.length || files.length;
        if (e.key === "ArrowDown") {
          setSelected((prev) => (prev + 1 > length - 1 ? 0 : prev + 1));
        }
        if (e.key === "ArrowUp") {
          setSelected((prev) => (prev - 1 < 0 ? length - 1 : prev - 1));
        }

        if (e.key === "Enter") {
          const selectedFile = nodes[selected];
          if (selectedFile) {
            onFileClick(selectedFile.path);
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
          const FuzzySearch = (await import("fuzzy-search")).default;
          const searcher = new FuzzySearch(files, ["path"], {
            caseSensitive: false,
          });
          const results: FileDTO[] = searcher.search(e.target.value);
          setFilter(results.map((r) => r.path));
        }}
      />
      <S.FilesContainer>
        {nodes.map((f, index) => {
          const splits = f.path.split("/");
          const name = splits.at(-1);
          const path = splits.slice(0, -1).join("/");

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
