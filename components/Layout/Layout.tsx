import FocusTrap from "focus-trap-react";
import { ReactNode, useEffect, useState } from "react";
import { useActiveItems } from "../../hooks/useActiveItems";
import { AstProvider } from "../../hooks/useAST";
import { useTheme } from "../../hooks/useTheme";
import { CheatSheet } from "../CheatSheet/CheatSheet";
import { CommandPalette } from "../CommandPalette/CommandPalette";
import { ExplorerProvider } from "../SideMenu/Files/Explorer/useExplorer";
import { SideMenu } from "../SideMenu/SideMenu";
import * as S from "./Layout.atoms";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { theme, showScope } = useTheme();

  return (
    <AstProvider showScope={showScope}>
      <ExplorerProvider>
        <FocusTrap>
          <S.Container className={theme}>
            <SideMenu />
            <S.MainContainer>
              <S.Main>{children}</S.Main>
              <CommandPalette />
              <CheatSheet />
            </S.MainContainer>
          </S.Container>
        </FocusTrap>
      </ExplorerProvider>
    </AstProvider>
  );
};
