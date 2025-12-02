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

type LastResultsMode = "single" | "top";

interface LastResultsState {
  items: SearchItem[];
  mode: LastResultsMode;
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

  // 🆕 Guardamos el último set de resultados para poder explicar “por qué”
  const [lastResults, setLastResults] = useState<LastResultsState | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const systemContext = useMemo(() => ({
    coords,
    filters: { distance: defaultDistance, category: initialCategory || "", openNow: false },
  }), [coords, defaultDistance, initialCategory]);

  // 🆕 Normalizador básico para texto (minúsculas + sin tildes)
  function normalizeTextBasic(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  // 🆕 Detectar pregunta fuera de dominio (“qué es...”, “para qué sirve...”, etc.)
  function isOutOfDomainQuestion(text: string) {
    const t = normalizeTextBasic(text).trim();
    return (
      t.startsWith("que es ") ||
      t.startsWith("que significa ") ||
      t.startsWith("para que sirve ") ||
      t.startsWith("que es el foda") ||
      t.startsWith("que es python") ||
      t.startsWith("que es next") ||
      t.startsWith("que es fortnite") ||
      t.startsWith("quien es ") ||
      t.startsWith("quienes son ") ||
      t.startsWith("explica ") ||
      t.startsWith("definicion de ") ||
      t.startsWith("de que trata ")
    );
  }

  // 🆕 Detectar preguntas de “por qué me recomiendas / son buenos esos lugares”
  function isWhyQuestion(text: string) {
    const t = normalizeTextBasic(text);
    const hasPorque = t.includes("por que") || t.includes("porque");
    const hasKeywords = (
      t.includes("lugares") ||
      t.includes("restaurantes") ||
      t.includes("cevicherias") ||
      t.includes("pollerias") ||
      t.includes("veterinarias") ||
      t.includes("sitios") ||
      t.includes("esos") ||
      t.includes("esas")
    );
    const hasVerb = (
      t.includes("recomiendas") ||
      t.includes("deberia ir") ||
      t.includes("deberia de ir") ||
      t.includes("debo ir") ||
      t.includes("buenos") ||
      t.includes("buenas")
    );
    return hasPorque && (hasKeywords || hasVerb);
  }

  // 🆕 Explicación basada en el último set de resultados
  function buildWhyExplanation(state: LastResultsState): string {
    if (!state.items.length) {
      return "Te estoy mostrando lugares ordenados por cercanía y, cuando es posible, por mejor calificación.";
    }

    // Ordenar por distancia ascendente, y si empatan, por rating descendente
    const sorted = [...state.items].sort((a, b) => {
      const da = a.distanceMeters ?? Infinity;
      const db = b.distanceMeters ?? Infinity;
      if (da !== db) return da - db;
      const ra = a.rating?.average ?? 0;
      const rb = b.rating?.average ?? 0;
      return rb - ra;
    });

    const first = sorted[0];
    const dist = `${Math.round(first.distanceMeters ?? 0)} m`;
    const hasRating = !!first.rating && typeof first.rating.average === "number";
    const ratingText = hasRating
      ? `${first.rating.average.toFixed(1)}★ (${first.rating.count ?? 0} reseñas)`
      : "aún sin reseñas de usuarios";

    if (state.mode === "single") {
      return `Te recomiendo ese lugar porque está relativamente cerca de ti (${dist}) y ${
        hasRating ? `tiene una calificación de ${ratingText}` : "puede ayudarte con lo que estás buscando"
      }.`;
    }

    // TOP N
    if (sorted.length >= 2) {
      const second = sorted[1];
      const dist2 = `${Math.round(second.distanceMeters ?? 0)} m`;
      const rating2 = second.rating && typeof second.rating.average === "number"
        ? `${second.rating.average.toFixed(1)}★`
        : null;

      return `Te recomendé esos lugares porque son de los más cercanos a tu ubicación y están ordenados por distancia y calificación. Por ejemplo, ${first.name} está a ${dist} y ${
        hasRating ? `tiene ${ratingText}` : "puede ayudarte con lo que pediste"
      }${rating2 ? `, y ${second.name} está a ${dist2} con ${rating2}` : ""}.`;
    }

    return `Te recomendé ese lugar porque está cerca de ti (${dist}) y se ajusta a lo que pediste.`;
  }

  async function sendText() {
    const text = input.trim();
    if (!text || sending) return;

    // 🆕 Manejo local para fuera de dominio (sin llamar a la IA)
    if (isOutOfDomainQuestion(text)) {
      setMessages(m => [
        ...m,
        { role: "user", content: text },
        {
          role: "assistant",
          content: "Solo puedo ayudarte a encontrar negocios y lugares cercanos (restaurantes, farmacias, veterinarias, talleres, etc.)."
        }
      ]);
      setInput("");
      return;
    }

    if (!user) {
      setMessages(m => [...m, { role: 'assistant', content: 'Debes iniciar sesión para usar el chatbot.' }]);
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    const isWhy = isWhyQuestion(text); // 🆕 lo calculamos una vez

    try {
      const resp = await AIService.chat([ ...messages, userMsg ], systemContext);

      // 🆕 Si es pregunta de "por qué..." y tenemos últimos resultados, explicamos sin nueva búsqueda
      if (isWhy && lastResults && lastResults.items.length) {
        const explanation = buildWhyExplanation(lastResults);
        setMessages(m => [...m, { role: "assistant", content: explanation }]);
        return;
      }

      if (resp.action?.type === "search") {
        const q = resp.action.q || "";
        const category = resp.action.category;
        const distance = resp.action.distance ?? defaultDistance;
        const openNow = !!resp.action.openNow;

        if (coords) {
          const res = await SearchService.search({
            lat: coords.lat,
            lng: coords.lng,
            radius: distance,
            q,
            category,
            openNow,
            page: 1,
            limit: 5
          });

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

            const lower = normalizeTextBasic(text);
            const numberWords: Record<string, number> = {
              'dos': 2,
              'tres': 3,
              '3': 3,
              '2': 2,
              'top 3': 3,
              'top3': 3,
              'top 2': 2,
              'top2': 2
            };
            let want = 1;
            for (const [k, v] of Object.entries(numberWords)) {
              if (lower.includes(k)) {
                want = Math.min(3, Math.max(1, v));
                break;
              }
            }
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

            // 🆕 Guardar últimos resultados para futuras preguntas de "por qué"
            setLastResults({
              items: picks,
              mode: want > 1 ? "top" : "single"
            });

            const summary = assembleChatSummary(res, picks, coords, want);
            setMessages(m => [...m, { role: "assistant", content: summary }]);
          } else {
            setMessages(m => [...m, {
              role: "assistant",
              content: "No encontré resultados con esos filtros. ¿Quieres ampliar el radio?"
            }]);
          }
        } else {
          setMessages(m => [...m, {
            role: "assistant",
            content: "No tengo tu ubicación activa. Compártela o dime un distrito/zona para buscar."
          }]);
        }
      } else {
        const clean = stripBasicMarkdown(resp.message || "");
        const botMsg: ChatMessage = { role: "assistant", content: clean };
        setMessages(m => [...m, botMsg]);
      }

    } catch (e) {
      // 🆕 Si falla la IA pero el usuario hizo una pregunta de "por qué" y tenemos datos, respondemos igual
      if (isWhy && lastResults && lastResults.items.length) {
        const explanation = buildWhyExplanation(lastResults);
        setMessages(m => [...m, { role: "assistant", content: explanation }]);
      } else {
        const botMsg: ChatMessage = {
          role: "assistant",
          content: "Lo siento, hubo un problema procesando tu mensaje. Intenta de nuevo."
        };
        setMessages((m) => [...m, botMsg]);
      }
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void sendText();
    }
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

  function assembleChatSummary(
    res: any,
    picks: SearchItem[],
    coords: { lat: number; lng: number },
    want: number
  ) {
    // 🆕 Ordenamos por distancia (y rating como desempate)
    const sorted = [...picks].sort((a, b) => {
      const da = a.distanceMeters ?? Infinity;
      const db = b.distanceMeters ?? Infinity;
      if (da !== db) return da - db;
      const ra = a.rating?.average ?? 0;
      const rb = b.rating?.average ?? 0;
      return rb - ra;
    });

    const header = buildHeader(res.results.length, sorted.length, want);
    const tail = getConditionalCTA(res.results.length, sorted.length);

    // Mensaje explicativo distinto según cantidad
    let intro = "";
    if (sorted.length === 1) {
      const first = sorted[0];
      const dist = `${Math.round(first.distanceMeters ?? 0)} m`;
      const ratingPart = first.rating?.count
        ? ` y tiene una calificación de ${first.rating.average.toFixed(1)}★ (${first.rating.count} reseñas)`
        : "";
      intro = `Te recomiendo este lugar porque está cerca de ti (${dist})${ratingPart}.`;
    } else if (sorted.length > 1) {
      const first = sorted[0];
      const dist = `${Math.round(first.distanceMeters ?? 0)} m`;
      const ratingPart = first.rating?.count
        ? ` y tiene una calificación de ${first.rating.average.toFixed(1)}★ (${first.rating.count} reseñas)`
        : "";
      intro = `Te muestro estas opciones porque están cerca de ti y la primera destaca por su ubicación (${dist})${ratingPart}.`;
    }

    const lines = sorted.map((p, i) => formatLine(p, i, coords));
    const introBlock = intro ? `${intro}\n\n` : "";

    return `${header}:\n\n${introBlock}${lines.join('\n\n')}${tail}`;
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