import 'style/theme.css';
import 'katex/dist/katex.min.css';

import { Analytics } from '@vercel/analytics/react';
import { Providers } from '@/lib/providers';
import StyledComponentsRegistry from '@/lib/regisitry';

export const runtime = 'edge';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <body>
        <Providers>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
