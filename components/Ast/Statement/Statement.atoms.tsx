import styled, { css } from "styled-components";
import { StyleProps } from "../../../style/styleProps";

export const Container = styled.div<StyleProps>`
  flex: 1;
  padding: 0.5em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--s-text);
  background-color: var(--s-bg);
  outline: solid 2px var(--s-border);
  outline-offset: -1px;
  min-width: 6em;
  min-height: 0.5em;
  &:hover {
    background-color: var(--s-hovered);
    cursor: pointer;
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
`;
