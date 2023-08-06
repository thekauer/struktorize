import styled from 'styled-components';

export const Container = styled.div`
  background-color: var(--blue);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 1rem;
  padding: 0 0.5rem;
  color: var(--text);
`;

export const Left = styled.div`
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

export const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
