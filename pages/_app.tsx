import "style/theme.css";
import "katex/dist/katex.min.css";
import type { AppProps } from "next/app";
import { Layout } from "../components/Layout/Layout";
import { ThemeProvider } from "../hooks/useTheme";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
    <Layout>
      <Component {...pageProps} />
    </Layout>
    </ThemeProvider>
  );
}
