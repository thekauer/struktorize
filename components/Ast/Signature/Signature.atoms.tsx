import styled, { css } from "styled-components";
import { StyleProps } from "../../../style/styleProps";

export const Container = styled.div<StyleProps>`
  padding: 0.5em;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  color: var(--s-text);
  background-color: var(--s-bg);
  border: solid 2px var(--s-border);
  min-width: 6em;
  min-height: 0.5em;
  &:hover,
  &.selected {
    background-color: var(--s-selected);
    cursor: pointer;
  }
  &.active {
    border: 1px solid var(--s-active);
  }

  ${({ selected }) =>
    selected &&
    css`
      background-color: var(--s-selected);
      cursor: pointer;
    `}
  ${({ active }) =>
    active &&
    css`
      border: 1px solid var(--s-active);
    `}
`;

export const Line = styled.div`
  width: 1px;
  height: 1em;
  border-left: 1px solid var(--mid);
  background-color: var(--mid);
  justify-self: center;
`;
