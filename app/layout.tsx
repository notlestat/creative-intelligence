import type { Metadata } from 'next';
import './globals.css';
import { WebMcpTools } from '@/components/axis/webmcp-tools';

export const metadata: Metadata = {
  title: 'Axis Creative Intelligence',
  description: 'Internal research and creative direction workspace for Axis.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <WebMcpTools />
      </body>
    </html>
  );
}
