import { InsertMode } from '@/lib/abstractText';
import styled, { keyframes, css } from 'styled-components';

const blink = keyframes`
  from {
    opacity: 1;
  }
  49% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  99% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const Cursor = styled.div<{ $insertMode: InsertMode; $offset: number }>`
  position: relative;
  width: 0;
  z-index: 10;
  &::before {
    position: relative;
    z-index: 10;
    content: ' ';
    display: block;
    width: 2px;
    background-color: var(--text);

    height: ${({ $insertMode }) =>
      $insertMode === 'normal' ? '1.25rem' : '0.8rem'};

    ${({ $insertMode, $offset }) =>
      $insertMode !== 'normal' &&
      css`
        font-size: 0.7em;
        font-family: KaTeX_Main;
        right: -${$offset}ch;
      `}

    ${({ $insertMode }) =>
      $insertMode === 'superscript' &&
      css`
        margin-bottom: 0.625rem;
      `};

    ${({ $insertMode }) =>
      $insertMode === 'subscript' &&
      css`
        margin-top: 0.625rem;
      `};
  }

  animation: ${blink} 1s infinite;
`;
