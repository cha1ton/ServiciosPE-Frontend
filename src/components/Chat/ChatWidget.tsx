// frontend/src/components/Chat/ChatWidget.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChatMessage, AIService } from "@/lib/ai";
import { SearchService, SearchItem } from "@/lib/search";
import AdSlot from '@/components/Ads/AdSlot';
import DirectLinkCard from "@/components/Ads/DirectLinkCard";

const provider = process.env.NEXT_PUBLIC_ADS_PROVIDER;
const DIRECT_LINK_CHAT = process.env.NEXT_PUBLIC_MONETAG_DIRECT_CHAT ?? ""; // pon tu URL

type LatLng = { lat: number; lng: number };
const CHAT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHAT || '6913128407';

export interface ChatWidgetProps {
  coords?: LatLng | null;
  defaultDistance: number;
  initialCategory?: string | "";
  onRunSearch?: (opts: { q?: string; category?: string | ""; distance?: number; openNow?: boolean; }) => void;
}

export default function ChatWidget({ coords, defaultDistance, initialCategory = "", onRunSearch }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hola! Soy tu asistente de ServiciosPE. Dime que necesitas (ej. 'una farmacia abierta cerca', 'lavanderia economica a 500 m')." }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  // Evitar repetir: track de sugerencias por conjunto de resultados
  const recommendedRef = useRef<{ key: string; ids: Set<string> }>({ key: "", ids: new Set() });

  // Autoscroll
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const systemContext = useMemo(() => ({
    coords,
    filters: { distance: defaultDistance, category: initialCategory || "", openNow: false },
  }), [coords, defaultDistance, initialCategory]);

  async function sendText() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const resp = await AIService.chat([ ...messages, userMsg ], systemContext);

      if (resp.action?.type === "search") {
        const q = resp.action.q || "";
        const category = resp.action.category;
        const distance = resp.action.distance ?? defaultDistance;
        const openNow = !!resp.action.openNow;

        if (coords) {
          const res = await SearchService.search({ lat: coords.lat, lng: coords.lng, radius: distance, q, category, openNow, page: 1, limit: 5 });

          if (res.results?.length) {
            const resultKey = res.results.map(r => `${r.source}:${r.id}`).join('|');
            if (recommendedRef.current.key !== resultKey) {
              recommendedRef.current = { key: resultKey, ids: new Set() };
            }

            // index opcional desde el LLM (0 o 1-based)
            let requestedIndex: number | null = null;
            try {
              const anyAction: any = (resp as any).action;
              if (anyAction && typeof anyAction.index !== 'undefined') {
                const idx = Number(anyAction.index);
                if (!Number.isNaN(idx)) requestedIndex = idx >= 1 ? idx - 1 : idx;
              }
            } catch {}

            // Pedidos tipo "muestrame 3" (top-N)
            const lower = text.toLowerCase();
            const numberWords: Record<string, number> = { 'dos': 2, 'tres': 3, '3': 3, '2': 2, 'top 3': 3 };
            let want = 1;
            for (const [k, v] of Object.entries(numberWords)) { if (lower.includes(k)) { want = Math.min(3, Math.max(1, v)); break; } }
            if (requestedIndex != null) want = 1; // si se pide index especifico, solo 1

            const picks: SearchItem[] = [];
            if (requestedIndex != null && requestedIndex >= 0 && requestedIndex < res.results.length) {
              picks.push(res.results[requestedIndex]);
            }
            for (const r of res.results) {
              if (picks.length >= want) break;
              const key = `${r.source}:${r.id}`;
              if (!recommendedRef.current.ids.has(key)) picks.push(r);
            }
            for (const r of res.results) { // completar si hiciera falta
              if (picks.length >= want) break;
              if (!picks.find(p => p.id === r.id && p.source === r.source)) picks.push(r);
            }
            picks.forEach(p => recommendedRef.current.ids.add(`${p.source}:${p.id}`));

            const lines = picks.map((p, i) => {
              const dir = `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${p.coordinates.lat},${p.coordinates.lng}&travelmode=walking`;
              const info = `${p.name}\n${p.address?.formatted || ''}\n${Math.round(p.distanceMeters)} m • ★ ${p.rating?.average?.toFixed(1) ?? '0.0'} (${p.rating?.count ?? 0})`;
              return `${i + 1}. ${info}\n\nComo llegar: ${dir}`;
            });

            const header = want > 1 ? `Top ${picks.length}` : `Recomendacion`;
            const tail = res.results.length > picks.length ? `\n\n¿Quieres otra opcion? Di: "otro lugar".` : '';
            const summary = `Encontre ${res.results.length} resultado(s). ${header}:\n\n${lines.join('\n\n')}${tail}`;

            setMessages(m => [...m, { role: "assistant", content: summary }]);
          } else {
            setMessages(m => [...m, { role: "assistant", content: "No encontre resultados con esos filtros. ¿Quieres ampliar el radio o quitar 'abierto ahora'?" }]);
          }
        } else {
          setMessages(m => [...m, { role: "assistant", content: "No tengo tu ubicacion activa. Compartela o dime un distrito/zona para buscar." }]);
        }
      } else {
        const botMsg: ChatMessage = { role: "assistant", content: resp.message || "" };
        setMessages((m) => [...m, botMsg]);
      }
    } catch (e) {
      const botMsg: ChatMessage = { role: "assistant", content: "Lo siento, hubo un problema procesando tu mensaje. Intenta de nuevo." };
      setMessages((m) => [...m, botMsg]);
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); sendText(); }
  }

  // Convierte URLs en anchors clicables al renderizar mensajes
  function linkify(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => urlRegex.test(part)
      ? (<a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>)
      : (<span key={i}>{part}</span>)
    );
  }

  // arriba del return
  const assistantCount = useMemo(
    () => messages.filter(m => m.role === 'assistant').length,
    [messages]
  );


  return (
    <section style={{ border: "1px solid #eee", borderRadius: 12, background: "#fff", padding: 12, marginBottom: 12 }}>
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <h3 style={{ margin: 0 }}>Asistente</h3>
        <span style={{ fontSize: 12, color: "#666" }}>
          {coords ? `Ubicacion: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Sin ubicacion"}
          {" • "}
          Radio: {defaultDistance} m
        </span>
      </div>

      <div ref={listRef} style={{ height: 200, overflowY: "auto", padding: 8, border: "1px solid #f0f0f0", borderRadius: 8, background: "#fafafa" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
            <div style={{ maxWidth: "80%", padding: "8px 10px", borderRadius: 12, background: m.role === "user" ? "#dff1ff" : "#fff", border: "1px solid #e6e6e6", whiteSpace: "pre-wrap" }}>
              {linkify(m.content)}
            </div>
          </div>
        ))}

        {/*Anuncio inline: 1er mensaje del bot y luego cada 3 respuestas (1,4,7,...) */}
        {/* anuncio inline del chat */}
        {provider === 'adsense' && assistantCount >= 1 && (assistantCount === 1 || assistantCount % 3 === 0) && (
          <div style={{ margin: '8px 0' }}>
            <AdSlot
              slot={String(CHAT_SLOT)}
              adtest={process.env.NODE_ENV !== 'production'}
              className={`ad-chat-${assistantCount}`}
            />
          </div>
        )}

        {provider === 'monetag' && assistantCount >= 1 && (
          <div style={{ margin: '8px 0' }}>
            <DirectLinkCard
              href={DIRECT_LINK_CHAT}
              title="Oferta cerca de ti"
              text="Descubre promociones locales seleccionadas."
            />
          </div>
        )}

        {sending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 4 }}>
            <div style={{ maxWidth: '80%', padding: '8px 10px', borderRadius: 12, background: '#fff', border: '1px solid #e6e6e6', color: '#666', fontSize: 13 }}>
              Buscando...
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe tu consulta..."
          style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", outline: "none" }}
        />
        <button onClick={sendText} disabled={sending || !input.trim()} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: sending ? "#eee" : "#f7f7f8", cursor: sending ? "not-allowed" : "pointer" }}>
          Enviar
        </button>
      </div>
    </section>
  );
}
