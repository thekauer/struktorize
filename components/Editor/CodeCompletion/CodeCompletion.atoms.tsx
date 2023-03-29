import styled from "styled-components";

export const Container = styled.div`
  position:relative;
  top: 0.5rem;
`;

export const RowContainer = styled.div`
  position: absolute;
  border: 1px solid black;
  background: var(--mid);
  max-height: 10rem;
  z-index: 10;
  overflow-y: scroll;
`

export const Row = styled.div<{ selected?: boolean }>`
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding: 0.125rem;
  padding-left: 0.25rem;
  ${({ selected }) => selected && `background: var(--blue-light)`}
`

export const Tab = styled.span<{ selected?: boolean }>`
  font-weight: bold;
  ${({ selected }) => !selected
    ? "color: var(--text-secondary);"
    : "color: var(--text);"
  }
`
