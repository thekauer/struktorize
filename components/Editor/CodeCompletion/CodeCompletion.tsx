'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as S from './CodeCompletion.atoms';
import { CodeCompletionItem } from './useCodeCompletion';

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
    item.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const targetContainer =
    document.querySelector('#cursor') || document.querySelector('.hovered');
  if (!visible || items.length === 0 || !targetContainer) return null;

  return createPortal(
    <S.Container className="CodeCompletion">
      <S.RowContainer>
        {items.map((item, index) => (
          <S.Row
            $selected={selected === index}
            ref={(row: HTMLDivElement) => {
              itemsRef.current[index] = row;
            }}
            key={item.type + '_' + item.value}
          >
            <img src={`/cc/${item.type}.svg`} alt="variable" />
            <span>{item.value}</span>
            <S.Type $selected={selected === index}>
              {item.type === 'variable' || item.type === 'function'
                ? item.typeId
                : ''}
            </S.Type>
            <S.Tab $selected={selected === index}>[Tab]</S.Tab>
          </S.Row>
        ))}
      </S.RowContainer>
    </S.Container>,
    targetContainer,
  );
};
