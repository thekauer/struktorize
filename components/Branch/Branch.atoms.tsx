import styled, { css } from "styled-components";
import { StyleProps } from "../../style/styleProps";

export const Condition = styled.div<StyleProps>`
  position: relative;
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
`;

export const TrueBranch = styled.div`
  outline: solid 2px var(--mid);
  outline-offset: -1px;
  min-width: 6em;
  min-height: 0.5em;
  justify-self: flex-start;
`;

export const FalseBranch = styled.div`
  outline: solid 2px var(--mid);
  outline-offset: -1px;
  min-width: 6em;
  min-height: 0.5em;
  justify-self: flex-end;
`;
