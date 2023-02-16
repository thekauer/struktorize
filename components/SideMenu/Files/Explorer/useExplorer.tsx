import {
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
import { File, FileDTO } from "../../../../pages/api/files";
import { Ast } from "../../../../lib/ast";
import { useFiles } from "./useFiles";
import { FileProps } from "./File/File";

const explorerContext = createContext<{
  activePath: string;
  setActivePath: Dispatch<SetStateAction<string>>;
}>({} as any);

export const ExplorerProvider = ({ children }: { children: ReactNode }) => {
  const [activePath, setActivePath] = useState<string>("/main");
  return (
    <explorerContext.Provider value={{ activePath, setActivePath }}>
      {children}
    </explorerContext.Provider>
  );
};

export const useExplorer = () => {
  const { functionName, ast, changed } = useAstState();
  const { load, addChangeListener, save } = useAst();
  const { activePath, setActivePath } = useContext(explorerContext);
  const [newPath, setNewPath] = useState<string | null>(null);

  const { createFile, deleteFile, saveFile, renameFile, refetch, files } =
    useFiles(({ files, file }) => {
      if (files?.length === 0) {
        createFile(`/${functionName}`);
        return;
      }
      load(file.ast as Ast, file.path);
    });

  useEffect(() => {
    addChangeListener(
      debounce((state) => {
        if (state.changed) {
          saveFile(state);
          save();
        }
      }, 10000)
    );
  }, []);

  const newFileClick = () => {
    setNewPath(activePath.substring(0, activePath.lastIndexOf("/") + 1));
  };

  const refreshClick = () => refetch();

  const activeFile = files.find(
    (f: FileDTO) => f.path === activePath && f.type === "file"
  ) as FileDTO;

  const focusRoot = () =>
    document.querySelector<HTMLDivElement>("#root-container")?.focus();

  const newFile: FileProps = {
    path: newPath!,
    isNew: true,
    onSubmit: (path) => {
      createFile(path);
      setNewPath(null);
      setActivePath(path);

      const name = path.substring(path.lastIndexOf("/") + 1);
      const newAst = {
        signature: {
          text: `\\text{${name}}()`,
          type: "signature",
          path: "signature",
        },
        body: [],
        type: "function",
        path: "",
      } as Ast;

      load(newAst, path);
      focusRoot();
    },
    onEscape: () => {
      setNewPath(null);
    },
  };

  const filesWithNewFile = !newPath
    ? files
    : [...files, newFile as FileDTO].sort((a, b) =>
      b.path.localeCompare(a.path)
    );

  const onFileClick = (path: string) => {
    if (path === activePath) return;

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

  const onFileDelete = (path: string) => {
    const nextFile: any = files.find(
      (f: FileDTO) => f.path !== path && f.type === "file"
    );
    if (nextFile) {
      setActivePath(nextFile.path);
      load(nextFile.ast as any, nextFile.path);
    }
    deleteFile(path);
  };

  const onFileMove = (path: string) => {
    renameFile({ ...activeFile, ast }, activePath, path);
    save();

    setActivePath(path);
  };

  const onFileShare = async (path: string) => {
    const id = files.find((f: File) => f.path === path)?.id;
    if (!id) throw new Error("File not found");
    await navigator.clipboard.writeText(id);
  }

  const getFileProps = (file: any) => ({
    ...file,
    name: file.path.substring(file.path.lastIndexOf("/") + 1),
    isActive: file.path === activePath,
    onClick: onFileClick,
    onDelete: onFileDelete,
    onMove: onFileMove,
    onShare: onFileShare,
  });

  return {
    getFileProps,
    newFileClick,
    refreshClick,
    files: filesWithNewFile,
    onFileClick,
  };
};
