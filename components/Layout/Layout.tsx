import { ReactNode } from "react";
import { useTheme } from "../../hooks/useTheme";
import { SideMenu } from "../SideMenu/SideMenu";
import * as S from "./Layout.atoms";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { theme } = useTheme();

  return (
    <S.Container className={theme}>
      <SideMenu />
      <S.Main>{children}</S.Main>
    </S.Container>
  );
};
