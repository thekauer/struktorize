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
  const confirmationMessage =
    "It looks like you have been editing something. " +
    "If you leave before saving, your changes will be lost.";

  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
};

const explorerContext = createContext<{
  newPath: string | null;
  setNewPath: Dispatch<SetStateAction<string | null>>;
}>({} as any);

export const ExplorerProvider = ({ children }: { children: ReactNode }) => {
  const [newPath, setNewPath] = useState<string | null>(null);

  return (
    <explorerContext.Provider value={{ newPath, setNewPath }}>
      {children}
    </explorerContext.Provider>
  );
};

export const useExplorer = () => {
  const { addChangeListener, load } = useAst();
  const { newPath, setNewPath } = useContext(explorerContext);
  const { changed, ast } = useAstState();

  const { saveFile, refetch, files, recent, setActivePath } = useFiles();
  const activePath = recent?.path!;

  useEffect(() => {
    if (!recent) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        saveFile({ ...recent, ast });
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [recent, ast]);

  useEffect(() => {
    if (!recent) return;

    addChangeListener(
      debounce((state) => {
        if (state.changed) {
          saveFile({ ...recent!, ast: state.ast });
        }
      }, 10000),
      "save"
    );
  }, [recent]);

  useEffect(() => {
    addChangeListener((state) => {
      if (state.changed) {
        window.addEventListener("beforeunload", warnBeforeExit);
      } else {
        window.removeEventListener("beforeunload", warnBeforeExit);
      }
    }, "warnExit");
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
        saveFile({ ...recent!, ast });
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
    : [...files, newFile as File].sort((a, b) => b.path.localeCompare(a.path));

  return {
    newFileClick,
    refreshClick,
    onFileClick,
    files: filesWithNewFile,
    activePath,
    activeFile,
    setNewPath,
  };
};
