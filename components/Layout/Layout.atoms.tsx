import styled from "styled-components";

export const Container = styled.div`
  display: flex;
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

export const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;
