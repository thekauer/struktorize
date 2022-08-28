import styled, { css } from "styled-components";

export const Container = styled.aside`
  position: relative;
  height: 16em;
  border-top: 2px solid var(--light);
  background-color: var(--dark);
  padding: 1em;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  gap: 1rem;
`;

export const Title = styled.h1`
  font-size: 1.5em;
  font-weight: 400;
  color: var(--text);
`;

export const Close = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem;
  border: none;
  background-color: inherit;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: var(--light);
  }
`;

export const Cross = styled.div<{ src: string }>`
  width: 0.5rem;
  height: 0.5rem;
  background: var(--text-secondary);
  -webkit-mask: url(${(props) => props.src}) center center / contain no-repeat;
  mask: url(${(props) => props.src}) center center / contain no-repeat;
`;
