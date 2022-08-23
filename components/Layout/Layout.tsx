import { ReactNode } from "react";
import { SideMenu } from "../SideMenu/SideMenu";
import * as S from "./Layout.atoms";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <S.Container>
      <SideMenu />
      <S.Main>{children}</S.Main>
    </S.Container>
  );
};
