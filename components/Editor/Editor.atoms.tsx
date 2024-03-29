import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  border: 1px solid var(--dark);
  overflow: auto;

  &:focus-visible {
    border: 1px solid var(--blue);
    outline: none;
  }
`;

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem;
  background: var(--s-root);
`;
