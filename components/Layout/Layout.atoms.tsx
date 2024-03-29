import styled from 'styled-components';

export const StackContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Container = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  margin: 0;
  background-color: var(--dark);
`;

export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--mid);

  &:focus-visible {
    border: 1px solid var(--blue);
    outline: none;
  }
`;

export const Main = styled.main`
  display: flex;
  flex: 1 1 auto;
  background: var(--dark);
  color: var(--text);
  overflow: hidden;
`;

export const MultiMain = styled.main`
  display: grid;
  flex: 1 1 auto;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 1fr;
  grid-auto-flow: row dense;
  background: var(--dark);
  color: var(--text);
  overflow: hidden;
`;

export const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;
