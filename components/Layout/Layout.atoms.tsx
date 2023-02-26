import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  height: 100%;
  margin: 0;
`;

export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
  border: 1px solid var(--mid);

  &:focus-visible {
    border: 1px solid var(--blue); 
    outline: none;
  }
`;

export const Main = styled.main`
  display: flex;
  flex: 1;
  background: var(--dark);
  color: var(--text);
`;

export const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;
