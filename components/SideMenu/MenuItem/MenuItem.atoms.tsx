import styled, { css } from 'styled-components';

export const MenuItem = styled.option<{
  $src: string;
  $active?: boolean;
}>`
  flex: 1;
  margin: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  background: ${(props) =>
    props.$active ? css` var(--text)` : css`var(--text-secondary)`};
  -webkit-mask: url(${(props) => props.$src}) center center / contain no-repeat;
  mask: url(${(props) => props.$src}) center center / contain no-repeat;
  cursor: pointer;

  &:hover {
    background: var(--text);
  }
`;

export const Container = styled.div`
  display: flex;
`;

export const Left = styled.div<{ $isOpen?: boolean }>`
  border-left: 2px solid
    ${(props) => (props.$isOpen ? css`var(--text);` : css`transparent`)};
`;

export const Right = styled.div`
  border-right: 2px solid transparent;
`;
