'use client';

import { ThemeProvider } from '../hooks/useTheme';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AstProvider } from '@/hooks/useAST';
import { ExplorerProvider } from '@/components/SideMenu/Files/Explorer/useExplorer';
import { Provider as JotaiProvider } from 'jotai';

const queryClient = new QueryClient();

interface ProviderProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProviderProps) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <ThemeProvider>
            <AstProvider>
              <ExplorerProvider>{children}</ExplorerProvider>
            </AstProvider>
          </ThemeProvider>
        </JotaiProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
