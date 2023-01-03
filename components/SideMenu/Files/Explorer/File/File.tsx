import { useEffect, useRef, useState } from "react";
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
        if (!editing) {
          setEditing(true);
          setTimeout(() => inputRef.current?.focus());
        }
        if (!isNew && editing) {
          const newPath = path.substring(0, path.lastIndexOf("/") + 1);
          onMove?.(newPath + inputRef.current?.value!);
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
