import styled, { css } from 'styled-components';
import { StyleProps } from '../../../style/styleProps';

export const Condition = styled.div<StyleProps>`
  position: relative;
  padding: 0.5em;
  padding-left: 1.25rem;
  color: var(--s-text);
  background-color: var(--s-bg);
  outline: solid 2px var(--s-border);
  outline-offset: -1px;
  display: grid;
  place-content: center;
  flex: 1;
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

  ${({ $hovered }) =>
    $hovered &&
    css`
      background-color: var(--s-hovered);
      cursor: pointer;
    `}

  ${({ $active }) =>
    $active &&
    css`
      background-color: var(--s-active);
    `}

  ${({ $selected }) =>
    $selected &&
    css`
      background-color: var(--s-selected);
    `}

  ${({ $selected, $hovered }) =>
    $selected &&
    $hovered &&
    css`
      background-color: var(--s-selected-hovered);
    `}

  ${({ $editing }) =>
    $editing &&
    css`
      border: 2px solid var(--s-active);
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
    content: ' ';
    width: 1.5px;
    height: 2.2em;
    background-color: var(--mid);
    transform: rotate(-45deg);
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const Text = styled.div`
  display: flex;
  flex: 1;
`;
