import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h3`
  margin: 0.5rem;
  margin-bottom: 0;
  color: var(--text-secondary);
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
