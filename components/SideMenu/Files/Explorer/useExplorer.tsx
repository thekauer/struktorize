import React, {
  useEffect,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
  useContext,
} from "react";
import { useAst, useAstState } from "../../../../hooks/useAST";
import { debounce } from "../../../../lib/debounce";
import { FileDTO } from "../../../../pages/api/files";
import { File } from "@/lib/repository";
import { useFiles } from "./useFiles";
import { FileProps } from "./File/File";

const warnBeforeExit = (e: any) => {
  const confirmationMessage = 'It looks like you have been editing something. '
    + 'If you leave before saving, your changes will be lost.';

  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
}

const explorerContext = createContext<{
  activePath: string;
  setActivePath: Dispatch<SetStateAction<string>>;
  newPath: string | null;
  setNewPath: Dispatch<SetStateAction<string | null>>;
}>({} as any);

export const ExplorerProvider = ({ children }: { children: ReactNode }) => {
  const [activePath, setActivePath] = useState<string>("/main");
  const [newPath, setNewPath] = useState<string | null>(null);

  return (
    <explorerContext.Provider value={{ activePath, setActivePath, newPath, setNewPath }}>
      {children}
    </explorerContext.Provider>
  );
};

export const useExplorer = () => {
  const { addChangeListener, save, load } = useAst();
  const { activePath, setActivePath, newPath, setNewPath } = useContext(explorerContext);
  const { ast, changed } = useAstState();

  const { saveFile, refetch, files } = useFiles();

  useEffect(() => {
    addChangeListener(
      debounce((state) => {
        if (state.changed) {
          saveFile({ ...state, type: "file" });
          save();
        }
      }, 10000), "save");

    addChangeListener((state) => {
      if (state.changed) {
        window.addEventListener("beforeunload", warnBeforeExit);
      } else {
        window.removeEventListener("beforeunload", warnBeforeExit);
      }
    }, "warnExit")
  }, []);

  const newFileClick = () => {
    setNewPath(activePath.substring(0, activePath.lastIndexOf("/") + 1));
  };

  const focusRoot = () =>
    document.querySelector<HTMLDivElement>("#root-container")?.focus();

  const onFileClick = (path: string) => {
    if (activePath === path) return;

    const nextFile = files.find((f: any) => f.path === path);
    if (nextFile?.type === "file") {
      if (changed) {
        saveFile({ ...activeFile, ast });
        save();
      }
      load(nextFile.ast as any, nextFile.path);
      setActivePath(path);
      focusRoot();
    }
  };

  const refreshClick = () => refetch();

  const activeFile = files.find(
    (f: FileDTO) => f.path === activePath && f.type === "file"
  ) as FileDTO;


  const newFile: FileProps = {
    path: newPath!,
    isNew: true,
  };

  const filesWithNewFile = !newPath
    ? files
    : [...files, newFile as File].sort((a, b) =>
      b.path.localeCompare(a.path)
    );

  return {
    newFileClick,
    refreshClick,
    onFileClick,
    files: filesWithNewFile,
    activePath,
    activeFile,
    setActivePath,
    setNewPath
  };
};
