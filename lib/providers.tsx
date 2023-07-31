'use client';

import { ThemeProvider } from '../hooks/useTheme';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AstProvider } from '@/hooks/useAST';
import { atom, Provider as JotaiProvider, useSetAtom } from 'jotai';
import { useEffect } from 'react';

const queryClient = new QueryClient();
export const lngAtom = atom('hu');

interface ProviderProps {
  children: React.ReactNode;
  lang: string;
}

export function Providers({ children, lang }: ProviderProps) {
  const setLang = useSetAtom(lngAtom);

  useEffect(() => {
    setLang(lang);
  }, [lang]);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <ThemeProvider>
            <AstProvider>{children}</AstProvider>
          </ThemeProvider>
        </JotaiProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
