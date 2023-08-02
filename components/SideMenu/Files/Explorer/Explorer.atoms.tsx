import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: -0.5rem;
`;

export const FileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  width: 100%;
`;

export const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  align-self: flex-end;
  margin: 0.5rem;
  gap: 0.25rem;
  padding: 0 0.5rem;
`;

export const MenuItem = styled.div<{ $src: string }>`
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
