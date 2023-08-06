'use client';

import FocusTrap from 'focus-trap-react';
import { ReactNode } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { CheatSheet } from '../CheatSheet/CheatSheet';
import { CommandPalette } from '../CommandPalette/CommandPalette';
import { ExplorerProvider } from '../SideMenu/Files/Explorer/useExplorer';
import { SideMenu } from '../SideMenu/SideMenu';
import * as S from './Layout.atoms';
import { Toaster } from 'react-hot-toast';
import { BottomMenu } from '../BottomMenu/BottomMenu';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { theme } = useTheme();
  const toastOptions = {
    style: {
      background: 'var(--mid)',
      color: 'var(--text)',
    },
  };

  return (
    <ExplorerProvider>
      <Toaster position="bottom-center" toastOptions={toastOptions} />
      <FocusTrap>
        <S.StackContainer>
          <S.Container className={theme}>
            <SideMenu />
            <S.MainContainer>
              <S.Main>{children}</S.Main>
              <CommandPalette />
              <CheatSheet />
            </S.MainContainer>
          </S.Container>
          <BottomMenu />
        </S.StackContainer>
      </FocusTrap>
    </ExplorerProvider>
  );
};
