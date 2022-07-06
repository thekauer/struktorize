import styled from "styled-components";

export const Container = styled.div`
  padding: 0.5em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  outline: solid 2px var(--mid);
  outline-offset: -1px;
  min-width: 6em;
  min-height: 0.5em;
  &:hover,
  &.selected {
    background-color: var(--light);
    cursor: pointer;
  }
  &.active {
    background-color: var(--blue);
  }
`;
