// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const provider = process.env.NEXT_PUBLIC_ADS_PROVIDER; // 'monetag' | 'adsense'

export const metadata: Metadata = {
  title: 'ServiciosPE',
  description: 'Plataforma para encontrar servicios locales en Perú',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* SOLO si vuelves a AdSense */}
        {provider === 'adsense' && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9134955448129642"
            crossOrigin="anonymous"
          />
        )}

        {/* Monetag: meta + script limpio */}
        {provider === 'monetag' && (
          <>
            <meta name="monetag" content="f768e4c599b7f4b46527a66efd52ddc2" />
            <Script
              id="monetag-inpage"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(){
                    var s = document.createElement('script');
                    s.dataset.zone = '10157191'; // <-- tu zone id
                    s.src = 'https://forfrogadiertor.com/tag.min.js';
                    (document.body || document.documentElement).appendChild(s);
                  })();
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}