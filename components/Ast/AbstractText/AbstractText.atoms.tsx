import styled, { keyframes } from 'styled-components';

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

export const Cursor = styled.div`
  width: 1px;
  height: 1rem;
  background-color: white;

  animation: ${blink} 1s infinite;
`;
