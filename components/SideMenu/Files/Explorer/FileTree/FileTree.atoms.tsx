import styled from 'styled-components';

export const Image = styled.div<{ $src: string }>`
  height: 1rem;
  width: 1rem;
  background: var(--text-secondary);
  -webkit-mask: url(${(props) => props.$src}) center center / contain no-repeat;
  mask: url(${(props) => props.$src}) center center / contain no-repeat;
`;
