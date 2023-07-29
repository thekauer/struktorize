import styled, { css } from 'styled-components';

export const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1.5fr;
  align-items: center;
  color: var(--text);
`;

export const Image = styled.div<{ src: string; active?: boolean }>`
  height: 1rem;
  width: 5rem;
  background: var(--text-secondary);
  -webkit-mask: url(${(props) => props.src}) center center / contain no-repeat;
  mask: url(${(props) => props.src}) center center / contain no-repeat;
  transition: filter 0.3s ease-in-out;

  ${(props) =>
    props.active &&
    css`
      filter: invert(38%) sepia(55%) saturate(6241%) hue-rotate(187deg)
        brightness(92%) contrast(101%);
    `}
`;

export const Name = styled.div`
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--text);
`;

export const Shortcut = styled.div`
  color: var(--text);
`;

export const Kbd = styled.kbd<{ active?: boolean }>`
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  border: solid 1px var(--text);

  ${(props) =>
    props.active &&
    css`
      transition: background 0.3s ease-in-out;
      background: var(--blue);
    `}
`;

export const Mark = styled.mark<{ active?: boolean }>`
  background-color: var(--light);
  color: var(--text);
  padding: 0.1rem 0.2rem;
  border-radius: 4px;

  ${(props) =>
    props.active &&
    css`
      transition: background 0.3s ease-in-out;
      background: var(--blue);
    `}
`;

export const Center = styled.div<{ active?: boolean }>`
  display: flex;
  justify-content: center;
  width: 5rem;

  transition: filter 0.3s ease-in-out;
  ${(props) =>
    props.active &&
    css`
      filter: invert(38%) sepia(55%) saturate(6241%) hue-rotate(187deg)
        brightness(92%) contrast(101%);
    `}
`;
