import { useEffect, useState, useCallback } from "react";
import { useAst, useAstState } from "../../../../hooks/useAST";
import { debounce } from "../../../../lib/debounce";
import { FileDTO } from "../../../../pages/api/files";
import { Ast } from "../../../../lib/ast";
import { useFiles } from "./useFiles";
import { FileProps } from "./File/File";

export const useExplorer = () => {
  const { functionName, ast, changed } = useAstState();
  const { load, addChangeListener, save } = useAst();
  const [activePath, setActivePath] = useState<string>("/main");
  const [newPath, setNewPath] = useState<string | null>(null);

  const { createFile, deleteFile, saveFile, moveFile, refetch, files } =
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
    : [...files, newFile].sort((a, b) => b.path.localeCompare(a.path));

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
    const nextFile: any = files.filter(
      (f: FileDTO) => f.path !== path && f.type === "file"
    )[0];
    if (nextFile) {
      setActivePath(nextFile.path);
      load(nextFile.ast as any, nextFile.path);
    }
    deleteFile(path);
  };

  const onFileMove = (path: string) => {
    moveFile({ ...activeFile, ast }, activePath, path);
    save();

    setActivePath(path);
  };

  const getFileProps = (file: any) => ({
    ...file,
    name: file.path.substring(file.path.lastIndexOf("/") + 1),
    isActive: file.path === activePath,
    onClick: onFileClick,
    onDelete: onFileDelete,
    onMove: onFileMove,
  });

  return { getFileProps, newFileClick, refreshClick, files: filesWithNewFile };
};
