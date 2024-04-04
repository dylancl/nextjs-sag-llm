'use client';

import { ColorSchemeScript } from '@mantine/core';
import Providers from './providers';
import '@mantine/core/styles.css';
import './globals.css';
import '@/styles/global/styles.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
