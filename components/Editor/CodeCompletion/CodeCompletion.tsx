import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import * as S from "./CodeCompletion.atoms";

interface CodeCompletionProps {
  items: string[];
  visible: boolean;
  selected: number;
}

export const CodeCompletion = ({
  items,
  visible,
  selected,
}: CodeCompletionProps) => {
  const itemsRef = useRef<Array<HTMLDivElement | null>>([]);
  useEffect(() => {
    const item = itemsRef.current[selected];
    if (!item) return;
    item.scrollIntoView({ block: "nearest" });
  }, [selected]);

  if (!visible) return null;

  return createPortal(
    <S.Container>
      <S.RowContainer>
        {items.map((item, index) => (
          <S.Row
            selected={selected === index}
            ref={(row: HTMLDivElement) => {
              itemsRef.current[index] = row;
            }}
            key={item}
          >
            <span>{item}</span>
            <S.Tab selected={selected === index}>[Tab]</S.Tab>
          </S.Row>
        ))}
      </S.RowContainer>
    </S.Container>,
    document.querySelector(".hovered")!
  );
};
