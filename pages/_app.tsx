import "style/theme.css";
import "katex/dist/katex.min.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../hooks/useTheme";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { appWithTranslation } from "next-i18next";
import { Session } from "next-auth";
import { AstProvider } from "@/hooks/useAST";
import { Provider as JotaiProvider } from "jotai";

const queryClient = new QueryClient();

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <ThemeProvider>
            <AstProvider>
              <Component {...pageProps} />
            </AstProvider>
          </ThemeProvider>
        </JotaiProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp as any);
