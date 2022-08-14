import styled, { css } from "styled-components";

export const Container = styled.div`
  display: flex;
  height: 100vh;
`;

export const Menu = styled.aside`
  position: relative;
  background: var(--light);
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ToggleMenu = styled.div`
  width: 14rem;
  background: var(--mid);
`;

export const Main = styled.main`
  flex: 1;
  padding: 2.5rem;
`;
