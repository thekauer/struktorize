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
  onSubmit?: (path: string, name: string) => void;
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
}: FileProps) => {
  const [isCreating, setIsCreating] = useState(isNew);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) {
      inputRef.current?.focus();
    }
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        if (inputRef.current?.value === "") return;

        onSubmit?.(path, inputRef.current?.value!);
        setIsCreating(false);
        break;

      case "Delete":
        if (isNew) return;
        onDelete?.(path);
        break;

      case "Escape":
        onEscape?.();
        setIsCreating(false);
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
      {isNew ? <S.Input ref={inputRef} /> : <S.Name>{name}</S.Name>}
    </S.Container>
  );
};
