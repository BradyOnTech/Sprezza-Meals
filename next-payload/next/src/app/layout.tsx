import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sprezza',
  description: 'Chef-prepared meals and custom bowls'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
