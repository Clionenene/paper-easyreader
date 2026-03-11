import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Paper EasyReader',
  description: 'Tiktok style minimal paper reader'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 text-slate-100">
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-6 pt-4">
          <header className="mb-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Paper EasyReader</h1>
            <nav className="flex gap-2 text-sm">
              <Link className="rounded-full border border-slate-700 px-3 py-1" href="/">
                Home
              </Link>
              <Link className="rounded-full border border-slate-700 px-3 py-1" href="/liked">
                Liked
              </Link>
            </nav>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
