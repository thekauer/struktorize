import { useEffect, useRef, useState } from "react";
import { FileDTO } from "../../pages/api/files";
import { useExplorer } from "../SideMenu/Files/Explorer/useExplorer";
import { useFiles } from "../SideMenu/Files/Explorer/useFiles";
import * as S from "./CommandPalette.atoms";

interface CommandPaletteProps {
  hidePalette: () => void;
}

export const CommandPalette = ({ hidePalette }: CommandPaletteProps) => {
  const [input, setInput] = useState<string>("");
  const [selected, setSelected] = useState<number>(0);
  const [filter, setFilter] = useState<string[]>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { onFileClick, files } = useExplorer();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const nodes = files.filter(
    (node) =>
      node.type === "file" &&
      (filter?.find((path) => path === node.path) || filter === undefined)
  );

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
            hidePalette();
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
