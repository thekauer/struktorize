import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  height: 100vh;
`;

export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const Main = styled.main`
  flex: 1;
  padding: 2.5rem;
  background: var(--dark);
  color: var(--text);
`;
