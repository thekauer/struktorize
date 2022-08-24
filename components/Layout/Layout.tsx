import { ReactNode } from "react";
import { ThemeProvider } from "../../hooks/useTheme";
import { SideMenu } from "../SideMenu/SideMenu";
import * as S from "./Layout.atoms";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <ThemeProvider>
      <S.Container>
        <SideMenu />
        <S.Main>{children}</S.Main>
      </S.Container>
    </ThemeProvider>
  );
};
