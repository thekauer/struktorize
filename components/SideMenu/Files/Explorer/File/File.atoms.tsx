import styled, { css } from "styled-components";

export const Container = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  flex: 1;
  width: 100%;
  padding: 0.25rem;

  ${(props) =>
    props.active &&
    css`
      background-color: var(--light);
      font-weight: 600;
    `}

  &:hover {
    background-color: var(--light);
    cursor: pointer;
  }
`;

export const Image = styled.div<{ src: string }>`
  height: 1rem;
  width: 1rem;
  margin-left: 1rem;
  background: var(--text-secondary);
  -webkit-mask: url(${(props) => props.src}) center center / contain no-repeat;
  mask: url(${(props) => props.src}) center center / contain no-repeat;
`;

export const Name = styled.span`
  font-size: 0.9rem;
  color: var(--text);
`;
