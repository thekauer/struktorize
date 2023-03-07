import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import * as S from "./File.atoms";
import * as ES from "../Explorer.atoms";
import { useTranslation } from "next-i18next";
import toast from 'react-hot-toast';
import { useAst, useAstState } from "@/hooks/useAST";
import { useExplorer } from "../useExplorer";
import { useFiles } from "../useFiles";
import { Ast } from "lib/ast";
import { FileDTO } from "@/pages/api/files";

export interface FileProps {
  path: string;
  isNew?: boolean;
};

export const File = ({ path, isNew }: FileProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(isNew);
  const { t } = useTranslation(["common"], { keyPrefix: "menu.files" });
  const { files, activePath, activeFile, setActivePath, setNewPath } = useExplorer();
  const { ast, changed } = useAstState();
  const { load, save } = useAst();
  const { saveFile, createFile, deleteFile, renameFile, shareFile } = useFiles();

  useEffect(() => {
    if (isNew) {
      inputRef.current?.focus();
    }
  }, []);


  const focusRoot = () =>
    document.querySelector<HTMLDivElement>("#root-container")?.focus();


  const onFileClick = () => {
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

  const onFileMove = (path: string) => {
    renameFile({ ...activeFile, ast }, activePath, path);
    save();

    setActivePath(path);
  };

  const handleDelete = () => {
    if (isNew) return;

    const nextFile: any = files.find(
      (f: FileDTO) => f.path !== path && f.type === "file"
    );

    if (!nextFile) return;

    setActivePath(nextFile.path);
    load(nextFile.ast as any, nextFile.path);
    deleteFile(path);
  };

  const createNewFile = (path: string) => {
    if (changed) {
      saveFile({ ...activeFile, ast });
      save();
    }
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
  }

  const onEscape = () => {
    setNewPath(null);
  }

  const handleShare = () => {
    if (!path) {
      toast.error(t("errorGeneratingLink"));
      return;
    };

    const shareFileAndCopyIdToClipboard = async () => {
      const id = await shareFile(path);
      await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SITE_URL}/${id}`);
    }

    toast.promise(shareFileAndCopyIdToClipboard(), {
      loading: t("generatingLink"),
      success: t('copyToClipboard'),
      error: t("errorGeneratingLink")
    });
  }

  const handleRename = () => {
    if (inputRef.current?.value === "") return;
    const pressedEnterToStartRenaming = !editing;
    if (pressedEnterToStartRenaming) {
      flushSync(() => {
        setEditing(true);
      });
      inputRef.current?.focus();
    }

    const finishedRenaming = !isNew && editing;
    if (finishedRenaming) {
      const oldPath = path.substring(0, path.lastIndexOf("/") + 1);
      const newName = inputRef.current?.value!;
      onFileMove(oldPath + newName);
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        handleRename();
        if (isNew) createNewFile(path + inputRef.current?.value!);
        break;

      case "Delete":
        handleDelete();
        break;

      case "Escape":
        if (editing) setEditing(false);
        onEscape();
        break;
    }
  };

  const isChanged = changed && path === activePath;

  return (
    <S.Container
      active={path === activePath}
      onKeyDown={onKeyDown}
      onClick={onFileClick}
      tabIndex={-1}
    >
      <S.Image src={"/structogram.png"} />
      {editing ? <S.Input ref={inputRef} /> :
        <>
          <S.Name>{isChanged && "*"}{path.split("/").pop()}</S.Name><S.FileMenu>
            <ES.MenuItem src="/share.svg" onClick={handleShare} title={t("share")} />
            <ES.MenuItem src="/rename.svg" onClick={handleRename} title={t("rename")} />
            <ES.MenuItem src="/bin.svg" onClick={handleDelete} title={t("delete")} />
          </S.FileMenu>
        </>}
    </S.Container>
  );
};
