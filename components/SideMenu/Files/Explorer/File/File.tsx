import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import * as S from "./File.atoms";

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
  useEffect(() => {
    if (isNew) {
      inputRef.current?.focus();
    }
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
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

        if (isNew) onSubmit?.(path + inputRef.current?.value!);
        break;

      case "Delete":
        if (isNew) return;
        onDelete?.(path);
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
      {editing ? <S.Input ref={inputRef} /> : <S.Name>{name}</S.Name>}
    </S.Container>
  );
};
