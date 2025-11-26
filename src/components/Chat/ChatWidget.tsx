// frontend/src/components/Chat/ChatWidget.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ChatMessage, AIService } from "@/lib/ai";
import { SearchService, SearchItem } from "@/lib/search";
import AdSlot from '@/components/Ads/AdSlot';
import DirectLinkCard from "@/components/Ads/DirectLinkCard";
import { MessageCircle, Send, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import styles from './chat.module.css';

const provider = process.env.NEXT_PUBLIC_ADS_PROVIDER;
const DIRECT_LINK_CHAT = process.env.NEXT_PUBLIC_MONETAG_DIRECT_CHAT ?? "";

type LatLng = { lat: number; lng: number };
const CHAT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHAT || '6913128407';

export interface ChatWidgetProps {
  coords?: LatLng | null;
  defaultDistance: number;
  initialCategory?: string | "";
  onRunSearch?: (opts: { q?: string; category?: string | ""; distance?: number; openNow?: boolean; }) => void;
}

export default function ChatWidget({ coords, defaultDistance, initialCategory = "", onRunSearch }: ChatWidgetProps) {
  const { user, login } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hola, soy tu asistente de ServiciosPE. ¿Qué necesitas? (ej.: 'farmacia cerca', 'restaurante')" }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const recommendedRef = useRef<{ key: string; ids: Set<string> }>({ key: "", ids: new Set() });

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const systemContext = useMemo(() => ({
    coords,
    filters: { distance: defaultDistance, category: initialCategory || "", openNow: false },
  }), [coords, defaultDistance, initialCategory]);

  async function sendText() {
    const text = input.trim();
    if (!text || sending) return;

    if (!user) {
      setMessages(m => [...m, { role: 'assistant', content: 'Debes iniciar sesión para usar el chatbot.' }]);
      return;
    }

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

            let requestedIndex: number | null = null;
            try {
              const anyAction: any = (resp as any).action;
              if (anyAction && typeof anyAction.index !== 'undefined') {
                const idx = Number(anyAction.index);
                if (!Number.isNaN(idx)) requestedIndex = idx >= 1 ? idx - 1 : idx;
              }
            } catch {}

            const lower = text.toLowerCase();
            const numberWords: Record<string, number> = { 'dos': 2, 'tres': 3, '3': 3, '2': 2, 'top 3': 3 };
            let want = 1;
            for (const [k, v] of Object.entries(numberWords)) { if (lower.includes(k)) { want = Math.min(3, Math.max(1, v)); break; } }
            if (requestedIndex != null) want = 1;

            const picks: SearchItem[] = [];
            if (requestedIndex != null && requestedIndex >= 0 && requestedIndex < res.results.length) {
              picks.push(res.results[requestedIndex]);
            }
            for (const r of res.results) {
              if (picks.length >= want) break;
              const key = `${r.source}:${r.id}`;
              if (!recommendedRef.current.ids.has(key)) picks.push(r);
            }
            for (const r of res.results) {
              if (picks.length >= want) break;
              if (!picks.find(p => p.id === r.id && p.source === r.source)) picks.push(r);
            }
            picks.forEach(p => recommendedRef.current.ids.add(`${p.source}:${p.id}`));

            const summary = assembleChatSummary(res, picks, coords, want);

            setMessages(m => [...m, { role: "assistant", content: summary }]);
          } else {
            setMessages(m => [...m, { role: "assistant", content: "No encontré resultados con esos filtros. ¿Quieres ampliar el radio?" }]);
          }
        } else {
          setMessages(m => [...m, { role: "assistant", content: "No tengo tu ubicacion activa. Compartela o dime un distrito/zona para buscar." }]);
        }
      } else {
        const clean = stripBasicMarkdown(resp.message || "");
        const botMsg: ChatMessage = { role: "assistant", content: clean };
        setMessages(m => [...m, botMsg]);
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

  function linkify(text: string) {
    const md = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts: ReactNode[] = [];
    let lastIndex = 0, m: RegExpExecArray | null;

    while ((m = md.exec(text)) !== null) {
      if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
      parts.push(
        <a key={`md-${parts.length}`} href={m[2]} target="_blank" rel="noopener noreferrer" className={styles.link}>
          {m[1]}
        </a>
      );
      lastIndex = md.lastIndex;
    }
    const rest = text.slice(lastIndex);

    const url = /(https?:\/\/[^\s]+)/g;
    const restParts = rest.split(url).map((chunk, i) =>
      i % 2 === 1
        ? <a key={`u-${i}`} href={chunk} target="_blank" rel="noopener noreferrer" className={styles.link}>{chunk}</a>
        : <span key={`t-${i}`}>{chunk}</span>
    );

    return [...parts, ...restParts];
  }

  function stripBasicMarkdown(s: string) {
    return s
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1');
  }

  const assistantCount = useMemo(
    () => messages.filter(m => m.role === 'assistant').length,
    [messages]
  );

  function buildHeader(total: number, shown: number, want: number) {
    if (!total) return 'Sin resultados';
    if (want > 1) return `Top ${shown} cercanos`;
    return 'Recomendación';
  }

  function getConditionalCTA(total: number, shown: number) {
    return total > shown ? '\n\n¿Quieres otra opción? Di: "otro lugar".' : '';
  }

  function formatMapLink(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=walking`;
  }

  function formatLine(p: SearchItem, i: number, origin: { lat: number; lng: number }) {
    const dir = formatMapLink(origin, p.coordinates);
    const dist = `${Math.round(p.distanceMeters)} m`;
    const rating = p.rating?.count ? ` • ★ ${p.rating.average.toFixed(1)} (${p.rating.count})` : '';
    const addr = p.address?.formatted || '';
    return `${i + 1}. ${p.name}\n${addr}\n${dist}${rating}\n\n[Como llegar →](${dir})`;
  }

  function assembleChatSummary(res: any, picks: SearchItem[], coords: { lat: number; lng: number }, want: number) {
    const lines = picks.map((p, i) => formatLine(p, i, coords));
    const header = buildHeader(res.results.length, picks.length, want);
    const tail = getConditionalCTA(res.results.length, picks.length);
    return `${header}:\n\n${lines.join('\n\n')}${tail}`;
  }

  return (
    <section className={styles.chatWidget}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <MessageCircle size={20} />
          </div>
          <div className={styles.headerInfo}>
            <h3 className={styles.headerTitle}>Asistente</h3>
            <div className={styles.headerStatus}>
              {coords ? (
                <>
                  <MapPin size={12} />
                  <span>Ubicación: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} • Radio: {defaultDistance}m</span>
                </>
              ) : (
                <span>Sin ubicación</span>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={styles.collapseButton}
          aria-label={isCollapsed ? "Expandir" : "Contraer"}
        >
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {/* Banner de login */}
      {!user && !isCollapsed && (
        <div className={styles.loginBanner}>
          <div className={styles.loginBannerText}>
            Inicia sesión para usar el chatbot
          </div>
          <button onClick={() => login()} className={styles.loginButton}>
            Iniciar sesión
          </button>
        </div>
      )}

      {/* Content */}
      {!isCollapsed && (
        <>
          {/* Messages */}
          <div ref={listRef} className={styles.messagesList}>
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`${styles.messageWrapper} ${m.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
              >
                <div className={styles.messageBubble}>
                  {linkify(m.content)}
                </div>
              </div>
            ))}

            {/* Ads */}
            {provider === 'adsense' && assistantCount >= 1 && (assistantCount === 1 || assistantCount % 3 === 0) && (
              <div className={styles.adContainer}>
                <AdSlot
                  slot={String(CHAT_SLOT)}
                  adtest={process.env.NODE_ENV !== 'production'}
                  className={`ad-chat-${assistantCount}`}
                />
              </div>
            )}

            {provider === 'monetag' && assistantCount >= 1 && (
              <div className={styles.adContainer}>
                <DirectLinkCard
                  href={DIRECT_LINK_CHAT}
                  title="Oferta cerca de ti"
                  text="Descubre promociones locales seleccionadas."
                />
              </div>
            )}

            {sending && (
              <div className={`${styles.messageWrapper} ${styles.assistantMessage}`}>
                <div className={`${styles.messageBubble} ${styles.loadingBubble}`}>
                  <span className={styles.loadingDot}></span>
                  <span className={styles.loadingDot}></span>
                  <span className={styles.loadingDot}></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className={styles.inputContainer}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe tu consulta..."
              className={styles.input}
              disabled={!user}
            />
            <button 
              onClick={sendText} 
              disabled={sending || !input.trim() || !user}
              className={styles.sendButton}
              aria-label="Enviar mensaje"
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </section>
  );
}