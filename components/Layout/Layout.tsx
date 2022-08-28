import useEventListener from "@use-it/event-listener";
import { ReactNode, useState } from "react";
import { useActiveItems } from "../../hooks/useActiveItems";
import { AstProvider } from "../../hooks/useAST";
import { useTheme } from "../../hooks/useTheme";
import { CheatSheet } from "../CheatSheet/CheatSheet";
import { SideMenu } from "../SideMenu/SideMenu";
import * as S from "./Layout.atoms";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { theme, showScope } = useTheme();
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const { ITEMS, active } = useActiveItems();

  useEventListener("keydown", (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "i") {
      setShowCheatSheet((prev) => !prev);
    }
  });

  const onCheatSheetClose = () => setShowCheatSheet(false);

  return (
    <AstProvider showScope={showScope}>
      <S.Container className={theme}>
        <SideMenu />
        <S.MainContainer>
          <S.Main>{children}</S.Main>
          {showCheatSheet && (
            <CheatSheet
              onClose={onCheatSheetClose}
              items={ITEMS}
              active={active}
            />
          )}
        </S.MainContainer>
      </S.Container>
    </AstProvider>
  );
};
