import "style/theme.css";
import "katex/dist/katex.min.css";
import type { AppProps } from "next/app";
import { Layout } from "../components/Layout/Layout";
import { ThemeProvider } from "../hooks/useTheme";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { appWithTranslation } from "next-i18next";
import { Session } from "next-auth";

const queryClient = new QueryClient();

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp as any);
