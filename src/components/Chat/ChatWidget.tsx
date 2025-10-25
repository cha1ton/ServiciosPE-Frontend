// frontend/src/components/Chat/ChatWidget.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChatMessage, AIService } from "@/lib/ai";
import { SearchService, SearchItem } from "@/lib/search";


type LatLng = { lat: number; lng: number };

export interface ChatWidgetProps {
  coords?: LatLng | null;
  defaultDistance: number;             // ej: 500
  initialCategory?: string | "";       // ej: "restaurante"
  onRunSearch?: (opts: {
    q?: string;
    category?: string | "";
    distance?: number;
    openNow?: boolean;
  }) => void;
}

export default function ChatWidget({
  coords,
  defaultDistance,
  initialCategory = "",
  onRunSearch,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola 👋 Soy tu asistente de ServiciosPE. Dime qué necesitas (ej. “una farmacia abierta cerca”, “lavandería económica a 500 m”).",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Autoscroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const systemContext = useMemo(
    () => ({
      coords,
      filters: {
        distance: defaultDistance,
        category: initialCategory || "",
        openNow: false,
      },
    }),
    [coords, defaultDistance, initialCategory]
  );

  async function sendText() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      // Llama a tu servicio de chat (OpenRouter + DeepSeek)
      const resp = await AIService.chat(
        [
          ...messages,
          userMsg,
        ],
        systemContext // se envía como metadata para que el backend lo use si quieres
      );

      //GAAA

      // Si hay action: search, NO muestres el texto del LLM; usa la búsqueda real.
      if (resp.action?.type === "search") {
        const q = resp.action.q || "";
        const category = resp.action.category; // deja undefined si no vino
        const distance = resp.action.distance ?? defaultDistance;
        const openNow = !!resp.action.openNow;

        // 1) Ejecutar búsqueda aquí mismo
        if (coords) {
          const res = await SearchService.search({
            lat: coords.lat,
            lng: coords.lng,
            radius: distance,
            q,
            category,
            openNow,
            page: 1,
            limit: 5,
          });

          // 2) Redactar respuesta con el más cercano
          if (res.results?.length) {
            const top: SearchItem = res.results[0];
            const line = `${top.name}\n${top.address?.formatted || ""}\n${Math.round(top.distanceMeters)} m • ⭐ ${top.rating?.average?.toFixed(1) ?? "0.0"} (${top.rating?.count ?? 0})`;
            const dir = `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${top.coordinates.lat},${top.coordinates.lng}&travelmode=driving`;
            const summary = `Encontré ${res.results.length} resultado(s). El más cercano:\n\n${line}\n\nCómo llegar: ${dir}`;

            setMessages(m => [...m, { role: "assistant", content: summary }]);
          } else {
            setMessages(m => [...m, { role: "assistant", content: "No encontré resultados con esos filtros. ¿Quieres ampliar el radio o quitar “abierto ahora”?" }]);
          }
        } else {
          setMessages(m => [...m, { role: "assistant", content: "No tengo tu ubicación activa. Compártela o dime un distrito/zona para buscar." }]);
        }

      } else {
        // No hay acción; ahora sí muestra el texto libre del LLM
        const botMsg: ChatMessage = { role: "assistant", content: resp.message || "…" };
        setMessages((m) => [...m, botMsg]);
      }

    } catch (e: any) {
      const botMsg: ChatMessage = {
        role: "assistant",
        content: "Lo siento, hubo un problema procesando tu mensaje. Intenta de nuevo.",
      };
      setMessages((m) => [...m, botMsg]);
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendText();
    }
  }

  return (
    <section
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        background: "#fff",
        padding: 12,
        marginBottom: 12,
      }}
    >
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <h3 style={{ margin: 0 }}>Asistente</h3>
        <span style={{ fontSize: 12, color: "#666" }}>
          {coords ? `Ubicación: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Sin ubicación"}
          {" • "}
          Radio: {defaultDistance} m
        </span>
      </div>

      <div
        ref={listRef}
        style={{
          height: 200,
            overflowY: "auto",
            padding: 8,
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            background: "#fafafa",
          }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "8px 10px",
                borderRadius: 12,
                background: m.role === "user" ? "#dff1ff" : "#fff",
                border: "1px solid #e6e6e6",
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe tu consulta…"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            outline: "none",
          }}
        />
        <button
          onClick={sendText}
          disabled={sending || !input.trim()}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: sending ? "#eee" : "#f7f7f8",
            cursor: sending ? "not-allowed" : "pointer",
          }}
        >
          Enviar
        </button>
      </div>
    </section>
  );
}
