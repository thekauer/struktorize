import styled, { css } from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h3`
  margin: 0.5rem;
  margin-bottom: 0;
  color: var(--text-secondary);
`;

export const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  padding: 0 0.5rem;
`;

export const MenuItem = styled.div<{ src: string }>`
  width: 1rem;
  height: 1rem;
  background: var(--text-secondary);
  -webkit-mask: url(${(props) => props.src}) center center / contain no-repeat;
  mask: url(${(props) => props.src}) center center / contain no-repeat;
  cursor: pointer;

  &:hover {
    background: var(--text);
  }
`;
