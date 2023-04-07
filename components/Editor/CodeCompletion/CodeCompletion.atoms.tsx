import styled from "styled-components";

export const Container = styled.div`
  position: relative;
  top: 0.5rem;
`;

export const RowContainer = styled.div`
  position: absolute;
  border: 1px solid black;
  background: var(--s-bg);
  max-height: 10rem;
  z-index: 10;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    width: 1em;
  }

  ::-webkit-scrollbar-track {
    background-color: var(--s-bg);
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--s-hovered);
    outline: 1px solid var(--s-hovered);
  }
`;

export const Row = styled.div<{ selected?: boolean }>`
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding: 0.125rem;
  padding-left: 0.25rem;
  color: var(--s-text);
  ${({ selected }) => selected && `background: var(--blue-light)`};
`;

export const Tab = styled.span<{ selected?: boolean }>`
  font-weight: bold;
  ${({ selected }) =>
    !selected ? "color: var(--text-secondary);" : "color: var(--s-text);"}
`;
