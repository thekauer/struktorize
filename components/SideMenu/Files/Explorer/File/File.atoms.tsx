import styled, { css } from 'styled-components';

export const FileMenu = styled.div`
  display: none;
`;

export const Container = styled.div<{ $active?: boolean }>`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  flex: 1;
  width: 100%;
  padding: 0.25rem;

  ${(props) =>
    props.$active &&
    css`
      background-color: var(--light);
    `}

  &:hover {
    background-color: var(--light);
    cursor: pointer;
  }

  &:hover ${FileMenu} {
    position: absolute;
    right: 1rem;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: flex-end;
    gap: 0.125rem;
  }

  &:focus {
    outline: none;
  }
`;

export const Image = styled.div<{ $src: string }>`
  height: 1rem;
  width: 1rem;
  margin-left: 1rem;
  background: var(--text-secondary);
  -webkit-mask: url(${(props) => props.$src}) center center / contain no-repeat;
  mask: url(${(props) => props.$src}) center center / contain no-repeat;
`;

export const Name = styled.span`
  font-size: 0.9rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 7rem;
`;

export const Input = styled.input<{ $error?: boolean }>`
  position: relative;
  font-family: Consolas, monospace;
  font-size: 0.9rem;
  border: 1px solid var(--blue);
  ${(props) =>
    props.$error &&
    css`
      border: 1px solid var(--red);
    `}
  background-color: var(--dark);
  color: var(--text);

  &:focus {
    outline: none;
  }
`;
export const ErrorContainer = styled.div`
  /* bottom: calc(-1rem + 7px); */
  top: 23px;
  left: 0.25rem;
  position: absolute;
  width: calc(100% - 8px);
`;

export const Error = styled.span`
  display: block;
  padding: 0.125rem 0.25rem;
  font-size: 0.5rem;
  background-color: var(--red);
  color: var(--text);
  overflow-wrap: break-word;
  white-space: normal;
`;

export const Button = styled.div<{ $src: string }>`
  width: 1rem;
  height: 1rem;
  background: var(--text-secondary);
  -webkit-mask: url(${(props) => props.$src}) center center / contain no-repeat;
  mask: url(${(props) => props.$src}) center center / contain no-repeat;
  cursor: pointer;

  &:hover {
    background: var(--text);
  }
`;
