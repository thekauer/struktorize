import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import * as S from "./File.atoms";
import * as ES from "../Explorer.atoms";
import { useTranslation } from "next-i18next";

export interface FileProps {
  name?: string;
  path: string;
  isActive?: boolean;
  isNew?: boolean;
  onClick?: (path: string) => void;
  onDelete?: (path: string) => void;
  onEscape?: () => void;
  onSubmit?: (path: string) => void;
  onMove?: (path: string) => void;
}

export const File = ({
  name,
  path,
  isActive,
  isNew,
  onClick,
  onDelete,
  onEscape,
  onSubmit,
  onMove,
}: FileProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(isNew);
  const { t } = useTranslation(["common"], { keyPrefix: "menu.files" });

  useEffect(() => {
    if (isNew) {
      inputRef.current?.focus();
    }
  }, []);

  const handleDelete = () => {
    if (isNew) return;
    onDelete?.(path);
  };

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
      onMove?.(oldPath + newName);
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        handleRename();
        if (isNew) onSubmit?.(path + inputRef.current?.value!);
        break;

      case "Delete":
        handleDelete();
        break;

      case "Escape":
        if (editing) setEditing(false);
        onEscape?.();
        break;
    }
  };

  return (
    <S.Container
      active={isActive}
      onKeyDown={onKeyDown}
      onClick={() => onClick?.(path)}
      tabIndex={-1}
    >
      <S.Image src={"/structogram.png"} />
      {editing ? <S.Input ref={inputRef} /> :
        <>
          <S.Name>{name}</S.Name><S.FileMenu>
            <ES.MenuItem src="/rename.svg" onClick={handleRename} title={t("rename")} />
            <ES.MenuItem src="/bin.svg" onClick={handleDelete} title={t("delete")} />
          </S.FileMenu>
        </>}
    </S.Container>
  );
};
