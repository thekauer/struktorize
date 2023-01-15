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
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { ITEMS, active } = useActiveItems();

  useEffect(() => {
    const infoToggle = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "i") {
        setShowCheatSheet((prev) => !prev);
      }
    };

    const commandPaletteToggle = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }

      if (e.key === "Escape") {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener("keydown", commandPaletteToggle);
    document.addEventListener("keydown", infoToggle);

    return () => {
      document.removeEventListener("keydown", infoToggle);
      document.removeEventListener("keydown", commandPaletteToggle);
    };
  }, []);

  const onCheatSheetClose = () => setShowCheatSheet(false);

  return (
    <AstProvider showScope={showScope}>
      <ExplorerProvider>
        <S.Container className={theme}>
          <SideMenu />
          <S.MainContainer>
            <S.Main>{children}</S.Main>
            {showCommandPalette && (
              <CommandPalette
                hidePalette={() => setShowCommandPalette(false)}
              />
            )}
            {showCheatSheet && (
              <CheatSheet
                onClose={onCheatSheetClose}
                items={ITEMS}
                active={active}
              />
            )}
          </S.MainContainer>
        </S.Container>
      </ExplorerProvider>
    </AstProvider>
  );
};
