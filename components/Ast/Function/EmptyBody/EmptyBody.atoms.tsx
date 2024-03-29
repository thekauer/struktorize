import styled from 'styled-components';

export const Container = styled.div`
  width: 14em;
  padding: 1rem;
  border: dashed 3px var(--s-hovered);
  color: var(--s-text);
  line-height: 2;
  justify-self: center;
`;

export const Kbd = styled.kbd`
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  border: solid 1px var(--s-text);
`;

export const Mark = styled.mark`
  background-color: var(--s-hovered);
  color: var(--s-text);
  padding: 0.1rem 0.2rem;
  border-radius: 4px;
`;

export const Blue = styled.span`
  color: var(--blue);
`;
