import styled, { css } from "styled-components";
import { StyleProps } from "../../style/styleProps";

export const Container = styled.div`
  display: grid;
  grid-template-columns: 2em auto;
  outline: solid 2px var(--mid);
  outline-offset: -1px;
`;
export const Loop = styled.div<StyleProps>`
  grid-row: 1;
  grid-column: 1 / 3;
  padding: 0.5em;
  min-width: 6em;
  min-height: 0.5em;
  display: grid;
  place-content: center;
  &:hover,
  &:hover + div,
  &.selected,
  &.selected + div {
    background-color: var(--light);
    cursor: pointer;
  }
  &.active,
  &.active + div {
    background-color: var(--blue);
  }

  ${({ selected }) =>
    selected &&
    css`
      &,
      & + div {
        background-color: var(--light);
        cursor: pointer;
      }
    `}
  ${({ active }) =>
    active &&
    css`
      &,
      & + div {
        background-color: var(--blue);
      }
    `}
`;
export const Left = styled.div`
  grid-row: 2;
  grid-column: 1;
  width: 2em;
  outline-offset: -1px;
`;
export const Right = styled.div`
  grid-row: 2;
  grid-column: 2;
  display: flex;
  flex-direction: column;
`;
