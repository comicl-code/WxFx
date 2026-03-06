import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WxFx — Weather Forecast Analyzer',
  description:
    'Real-time NWS weather data for the Southern Plains and Walt Disney World',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <a href="/" className="text-xl font-bold tracking-tight">
              WxFx
            </a>
            <div className="flex gap-4 text-sm">
              <a
                href="/weather"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </a>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
