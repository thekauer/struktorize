import 'style/theme.css';
import 'katex/dist/katex.min.css';

import { Analytics } from '@vercel/analytics/react';
import { Providers } from '@/lib/providers';
import StyledComponentsRegistry from '@/lib/regisitry';

export const runtime = 'edge';

interface RootLayoutProps {
  children: React.ReactNode;
  params: { lng: string };
}

export default function RootLayout({
  children,
  params: { lng },
}: RootLayoutProps) {
  return (
    <html>
      <body>
        <Providers lang={lng}>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
