import styled, { css } from "styled-components";
import { StyleProps } from "../../style/styleProps";

export const Condition = styled.div<StyleProps>`
  padding: 0.5em;
  outline: solid 2px var(--mid);
  outline-offset: -1px;
  display: grid;
  place-content: center;
  min-width: 6em;
  min-height: 0.5em;
  background: url("/static/ifelsebg.svg") no-repeat bottom / contain;

  &:hover,
  &.selected {
    background-color: var(--light);
    cursor: pointer;
  }
  &.active {
    background-color: var(--blue);
  }

  ${({ selected }) =>
    selected &&
    css`
      background-color: var(--light);
      cursor: pointer;
    `}
  ${({ active }) =>
    active &&
    css`
      background-color: var(--blue);
    `}
`;
export const Container = styled.div`
  display: flex;
`;
export const TrueBranch = styled.div`
  outline: solid 2px var(--mid);
  outline-offset: -1px;
  min-width: 6em;
  min-height: 0.5em;
  justify-self: flex-start;
  flex: 1;
  &:hover {
    background-color: var(--light);
  }
  &.active {
    background-color: var(--blue);
  }
`;
export const FalseBranch = styled.div`
  outline: solid 2px var(--mid);
  outline-offset: -1px;
  min-width: 6em;
  min-height: 0.5em;
  justify-self: flex-end;
  flex: 1;
  &:hover {
    background-color: var(--theme-light);
  }
  &.active {
    background-color: var(--blue);
  }
`;
