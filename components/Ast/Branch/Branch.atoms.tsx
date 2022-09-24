import styled, { css } from "styled-components";
import { StyleProps } from "../../../style/styleProps";

export const Condition = styled.div<StyleProps>`
  position: relative;
  padding: 0.5em;
  color: var(--s-text);
  background-color: var(--s-bg);
  outline: solid 2px var(--s-border);
  outline-offset: -1px;
  display: grid;
  place-content: center;
  min-width: 6em;
  min-height: 0.5em;

  &:hover,
  &.hovered {
    background-color: var(--s-hovered);
    cursor: pointer;
  }
  &.active {
    background-color: var(--s-active);
  }

  ${({ hovered }) =>
    hovered &&
    css`
      background-color: var(--s-hovered);
      cursor: pointer;
    `}
  ${({ active }) =>
    active &&
    css`
      background-color: var(--s-active);
    `}
    ${({ selected }) =>
    selected &&
    css`
      background-color: var(--s-selected);
    `}

    ${({ selected, hovered }) =>
    selected &&
    hovered &&
    css`
      background-color: var(--s-selected-hovered);
    `}
`;

export const True = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 1em;
  text-align: center;

  &::after {
    position: absolute;
    left: 0.75em;
    bottom: -0.3em;
    content: " ";
    width: 1.5px;
    height: 2.2em;
    background-color: var(--mid);
    transform: rotate(-45deg);
  }
`;

export const False = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 1em;
  text-align: center;

  &::before {
    position: absolute;
    left: 0.125em;
    bottom: -0.3em;
    content: " ";
    width: 1.5px;
    height: 2.2em;
    background-color: var(--mid);
    transform: rotate(45deg);
  }
`;

export const Container = styled.div`
  display: flex;
  flex: 1;
`;

export const TrueBranch = styled.div`
  outline: solid 2px var(--s-border);
  outline-offset: -1px;
  min-width: 6em;
  min-height: 0.5em;
  justify-self: flex-start;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const FalseBranch = styled.div`
  outline: solid 2px var(--s-border);
  outline-offset: -1px;
  min-width: 6em;
  min-height: 0.5em;
  justify-self: flex-end;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
