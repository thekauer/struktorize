import "style/theme.css";
import "katex/dist/katex.min.css";
import type { AppProps } from "next/app";
import { Layout } from "../components/Layout/Layout";
import { ThemeProvider } from "../hooks/useTheme";
import { SessionProvider } from "next-auth/react";

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
}
