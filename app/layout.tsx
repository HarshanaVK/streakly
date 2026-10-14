import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StreaklyProvider } from '@/lib/storage';

export const metadata: Metadata = {
  title: 'Streakly — Interactive Habit Tracking Dashboard',
  description:
    'Apple-grade glassmorphic habit tracker and streak dashboard with Bloop companion, dual profiles for Visal and Pooja, and timezone-aware persistence.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Streakly',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#05070f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-profile="visal" data-appearance="dark">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="antialiased min-h-screen relative selection:bg-blue-500/30 selection:text-white">
        <StreaklyProvider>{children}</StreaklyProvider>
      </body>
    </html>
  );
}
