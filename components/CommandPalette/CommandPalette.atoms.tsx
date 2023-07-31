import styled from 'styled-components';

//float at the middle top of the screen
export const Container = styled.div`
  position: absolute;
  min-width: 30%;
  top: 5%;
  left: 50%;
  transform: translate(-50%, 0%);
  background-color: var(--mid);
  color: var(--text);
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
`;

export const Input = styled.input`
  color: var(--text);
  width: 100%;
  background-color: var(--mid);
  border: none;
  outline: none;

  box-shadow: 0 0 2px rgba(0, 0, 0, 1);
  padding: 0.25rem;
`;

export const Path = styled.span`
  color: var(--text-secondary);
`;

export const File = styled.div<{ $selected?: boolean }>`
  background-color: ${(props) =>
    props.$selected ? 'var(--blue)' : 'transparent'};
  border-radius: 5px;
  padding: 4px 8px;
`;

export const FilesContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: 0.5rem;
`;
