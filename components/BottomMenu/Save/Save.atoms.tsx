import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    cursor: pointer;
    background-color: #ffffff30;
  }
`;

export const ImageContainer = styled.div`
  padding: 0.125rem;
`;

export const Image = styled.div<{ $src: string }>`
  height: 1rem;
  width: 1rem;
  background: var(--text);
  -webkit-mask: url(${(props) => props.$src}) center center / contain no-repeat;
  mask: url(${(props) => props.$src}) center center / contain no-repeat;
`;
