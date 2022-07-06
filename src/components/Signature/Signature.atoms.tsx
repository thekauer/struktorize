import styled from "styled-components";

export const Container = styled.div`
  padding: 0.5em;
  border-radius: 25px;
  border: solid 2px var(--mid);
  min-width: 6em;
  min-height: 0.5em;
  &:hover,
  &.selected {
    background-color: var(--light);
    cursor: pointer;
  }
  &.active {
    border: 1px solid var(--blue);
  }
`;

export const Line = styled.div`
  width: 1px;
  height: 1em;
  border-left: 1px solid var(--mid);
  background-color: var(--mid);
  justify-self: center;
`;
