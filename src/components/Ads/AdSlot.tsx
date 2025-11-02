// frontend/src/components/Ads/AdSlot.tsx

'use client';

import { useEffect } from 'react';

type Props = {
  slot: string;              // e.g., '6913128407'
  adtest?: boolean;          // true para pruebas locales
  style?: React.CSSProperties;
  className?: string;
};

export default function AdSlot({ slot, adtest = false, style, className }: Props) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  // No renderiza si falta el client o el slot
  if (!client || !slot) return null;

  // Solo servir en producción (dominio) o en modo adtest
  const isProd =
    typeof window !== 'undefined' &&
    // ajusta si luego usas dominio propio
    (window.location.hostname.endsWith('vercel.app') ||
     window.location.hostname.endsWith('serviciospe.vercel.app'));

  if (!isProd && !adtest) return null;

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignorar re-push en hidratos
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className ?? ''}`}
      style={{ display: 'block', minHeight: 90, ...style }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
      {...(adtest ? { 'data-adtest': 'on' } : {})}
    />
  );
}
