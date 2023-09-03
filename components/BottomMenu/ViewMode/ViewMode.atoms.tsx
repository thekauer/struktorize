import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  align-items: center;
`;

export const ImageContainer = styled.div`
  padding: 0.125rem;
  &:hover {
    cursor: pointer;
    background-color: #ffffff30;
  }
`;

export const Image = styled.div<{ $src: string }>`
  height: 1rem;
  width: 1rem;
  background: var(--text);
  -webkit-mask: url(${(props) => props.$src}) center center / contain no-repeat;
  mask: url(${(props) => props.$src}) center center / contain no-repeat;
`;
