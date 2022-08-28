import styled, { css } from "styled-components";

export const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
`;

export const Image = styled.div<{ src: string }>`
  height: 2rem;
  width: 5rem;
  background: var(--text-secondary);
  -webkit-mask: url(${(props) => props.src}) center center / contain no-repeat;
  mask: url(${(props) => props.src}) center center / contain no-repeat;
`;

export const Name = styled.div`
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--text);
`;

export const Shortcut = styled.div`
  color: var(--text);
`;

export const Kbd = styled.kbd<{ active?: boolean }>`
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  border: solid 1px var(--text);

  ${(props) =>
    props.active &&
    css`
      transition: background 0.3s ease-in-out;
      background: var(--blue);
    `}
`;

export const Mark = styled.mark<{ active?: boolean }>`
  background-color: var(--light);
  color: var(--text);
  padding: 0.1rem 0.2rem;
  border-radius: 4px;

  ${(props) =>
    props.active &&
    css`
      transition: background 0.3s ease-in-out;
      background: var(--blue);
    `}
`;
