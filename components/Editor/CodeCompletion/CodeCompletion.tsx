import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import * as S from "./CodeCompletion.atoms";
import { CodeCompletionItem } from "./useCodeCompletion";

interface CodeCompletionProps {
  items: CodeCompletionItem[];
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

  if (!visible || items.length === 0) return null;

  return createPortal(
    <S.Container className="CodeCompletion">
      <S.RowContainer>
        {items.map((item, index) => (
          <S.Row
            selected={selected === index}
            ref={(row: HTMLDivElement) => {
              itemsRef.current[index] = row;
            }}
            key={item.type + "_" + item.value}
          >
            <img src={`/cc/${item.type}.svg`} alt="variable" />
            <span>{item.value}</span>
            <S.Tab selected={selected === index}>[Tab]</S.Tab>
          </S.Row>
        ))}
      </S.RowContainer>
    </S.Container>,
    document.querySelector(".hovered")!
  );
};
