import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
`;

export const Title = styled.h3`
  margin-bottom: 0;
  color: var(--text-secondary);
`;

export const Button = styled.button`
  padding: 0.5rem;
  border: none;
  color: var(--text);
  cursor: pointer;
  background-color: var(--blue);

  &:hover {
    background-color: var(--blue-light);
  }
`;

export const Option = styled.option``;

export const Select = styled.select`
  background: var(--light);
  color: var(--text);
  border: none;
  padding: 0.25rem;
`;

export const Label = styled.label`
  color: var(--text-secondary);
`;

export const Span = styled.span`
  color: var(--text);
`;

export const Menu = styled.aside`
  position: relative;
  background: var(--light);
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
`;

export const MenuTray = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

export const ToggleMenu = styled.div`
  width: 14rem;
  background: var(--mid);
  border: 1px solid transparent;

  &:focus {
    border: 1px solid var(--blue);
    outline: none;
  }
`;

export const Profile = styled.img`
  border-radius: 50%;
  margin: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
`;
