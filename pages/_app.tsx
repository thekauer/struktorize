import "style/theme.css";
import "katex/dist/katex.min.css";
import type { AppProps } from "next/app";
import { Layout } from "../components/Layout/Layout";
import { ThemeProvider } from "../hooks/useTheme";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
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
