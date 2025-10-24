// frontend/src/app/service/[source]/[id]/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Layout/Navbar";
import { getNearbyCache } from "@/lib/searchCache";
import { SearchItem, SearchService } from "@/lib/search";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/hooks/useAuth";
import { FavoritesService } from "@/lib/favorites";
import { ReviewsService, ReviewPayload } from "@/lib/reviews";
import { getLocalServiceDetail } from "@/lib/search";

//GAAA
type LatLng = { lat: number; lng: number };

function buildDirectionsUrl(
  origin: LatLng,
  dest: LatLng,
  mode: "walking" | "driving" | "transit" = "driving"
) {
  const o = `${origin.lat},${origin.lng}`;
  const d = `${dest.lat},${dest.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    o
  )}&destination=${encodeURIComponent(d)}&travelmode=${mode}`;
}

export default function ServiceDetailPage() {
  const params = useParams<{ source: string; id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState<SearchItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState("");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Reseñas (solo para locales)
  const [reviews, setReviews] = useState<any[]>([]);
  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState("");
  const [myRating, setMyRating] = useState<number>(5);
  const [myComment, setMyComment] = useState("");

  // Geo (para “Cómo llegar”)
  const { coordinates, getCurrentLocation } = useGeolocation();

  // 22-10-25 05:45am
  const [canReply, setCanReply] = useState(false);
  const [replyWindowMin, setReplyWindowMin] = useState(15);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({}); // reviewId -> text
  const [replyingId, setReplyingId] = useState<string | null>(null); // reviewId que estoy respondiendo/editando

  function canEditOwnerReply(r: any) {
  if (!r.ownerReply) return false;
  const created = new Date(r.ownerReply.createdAt).getTime();
  const now = Date.now();
  return (now - created) <= replyWindowMin * 60 * 1000;
}

  // 🔹 Pide ubicación al montar (igual que haces en la lista)
  useEffect(() => {
    if (!coordinates) getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canFavorite = useMemo(
    () => item?.source === "serviciospe",
    [item?.source]
  );
  const canComment = canFavorite; // comentarios solo en locales

  // Cargar desde cache; si no hay, fallback a Nearby (misma UX que lista)
  useEffect(() => {
    const source = params.source;
    const id = params.id;

    const tryCache = () => {
      const cache = getNearbyCache();
      if (!cache) return false;
      const found = cache.results.find(
        (r) => r.id === id && r.source === source
      );
      if (found) {
        setItem(found);
        return true;
      }
      return false;
    };

    const fetchFallback = async () => {
      try {
        // si no hay cache o no está el ítem, intenta Nearby 1 llamada
        const center =
          coordinates || { lat: -12.0464, lng: -77.0428 }; // Lima centro fallback
        const resp = await SearchService.search({
          lat: center.lat,
          lng: center.lng,
          radius: 1000,
          page: 1,
          limit: 20,
        });
        const f = resp.results.find(
          (r: SearchItem) => r.id === id && r.source === source
        );
        setItem(f || null);
      } catch {
        setItem(null);
      }
    };

    (async () => {
      setLoading(true);
      const hit = tryCache();
      if (!hit) await fetchFallback();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.source, params.id]);

  // Cargar favoritos (solo si es local)
  useEffect(() => {
    if (!item || item.source !== "serviciospe" || !isAuthenticated) return;
    (async () => {
      try {
        const { favorites } = await FavoritesService.listMine();
        setIsFavorite(favorites.includes(item.id));
      } catch {
        // ignora
      }
    })();
  }, [item, isAuthenticated]);

  // Cargar reseñas (solo locales)
  useEffect(() => {
    if (!item || item.source !== "serviciospe") return;
    (async () => {
      try {
        setRevLoading(true);
        const { reviews, canReply, replyEditWindowMinutes } = await ReviewsService.list(item.id);
        setReviews(reviews);
        setCanReply(!!canReply);
        if (replyEditWindowMinutes) setReplyWindowMin(replyEditWindowMinutes);
      } catch (e: any) {
        setRevError(e?.message || "Error cargando reseñas");
      } finally {
        setRevLoading(false);
      }
    })();
  }, [item]);

  useEffect(() => {
    if (!item) return;
    // solo para locales: trae todo (fotos, descripción, rating fresco)
    if (item.source === "serviciospe") {
      (async () => {
        try {
          const { success, service } = await getLocalServiceDetail(item.id);
          if (success && service) {
            // fusiona lo que ya tenías (coords, etc.) con el detalle completo
            setItem(prev => prev ? {
              ...prev,
              name: service.name,
              address: service.address,
              rating: service.rating,
              contact: service.contact,
              imagesUrl: (service.images || []).map((i: any) => i.url).filter(Boolean),
              description: service.description || '',
              schedule: service.schedule || null
            } : prev);
          }
        } catch {
          // ignora en MVP
        }
      })();
    }
  }, [item?.id, item?.source]);


  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item || !canFavorite) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      setFavLoading(true);
      setFavError("");
      const { isFavorite: nowFav } = await FavoritesService.toggle(item.id);
      setIsFavorite(nowFav);
    } catch (e: any) {
      setFavError(e?.message || "Error al actualizar favoritos");
    } finally {
      setFavLoading(false);
    }
  };

  async function submitOwnerReply(reviewId: string) {
  const text = (replyDraft[reviewId] || '').trim();
  if (!text) return;
  try {
    setRevLoading(true);
    setRevError('');
    await ReviewsService.reply(reviewId, text);
    // recargar lista
    const res = await ReviewsService.list(item!.id);
    setReviews(res.reviews);
    setCanReply(!!res.canReply);
    if (res.replyEditWindowMinutes) setReplyWindowMin(res.replyEditWindowMinutes);
    setReplyingId(null);
  } catch (e: any) {
    setRevError(e?.message || 'Error enviando respuesta');
  } finally {
    setRevLoading(false);
  }
}


  const submitReview = async () => {
    if (!item || !canComment) return;
    if (!isAuthenticated) { router.push("/login"); return; }

    try {
      setRevLoading(true);
      setRevError("");

      const payload: ReviewPayload = { rating: myRating, comment: myComment };
      await ReviewsService.create(item.id, payload);
      setMyComment("");

      // ⬇️ Usa el mismo shape que submitOwnerReply
      const res = await ReviewsService.list(item.id);
      setReviews(res.reviews);
      setCanReply(!!res.canReply);
      if (res.replyEditWindowMinutes) setReplyWindowMin(res.replyEditWindowMinutes);

      if (item.source === "serviciospe") {
        const { success, service } = await getLocalServiceDetail(item.id);
        if (success && service) {
          setItem(prev => (prev ? { ...prev, rating: service.rating } : prev));
        }
      }
    } catch (e: any) {
      setRevError(e?.message || "Error al enviar reseña");
    } finally {
      setRevLoading(false);
    }
  };


  if (loading) {
    return (
      <div>
        <Navbar />
        <main style={{ padding: 16 }}>
          <p>Cargando detalle…</p>
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div>
        <Navbar />
        <main style={{ padding: 16 }}>
          <h2>No encontramos este lugar</h2>
          <p>Vuelve al inicio y prueba otra búsqueda.</p>
        </main>
      </div>
    );
  }

  // 🔹 Construye el link igual que en la card
  const hasOrigin =
    !!coordinates &&
    typeof coordinates.lat === "number" &&
    typeof coordinates.lng === "number";
  const hasDest =
    !!item.coordinates &&
    typeof item.coordinates.lat === "number" &&
    typeof item.coordinates.lng === "number";
  const directionsUrl =
    hasOrigin && hasDest
      ? buildDirectionsUrl(
          { lat: coordinates!.lat, lng: coordinates!.lng },
          { lat: item.coordinates!.lat, lng: item.coordinates!.lng },
          "driving"
        )
      : "";

  return (
    <div>
      <Navbar />
      <main style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        {/* Encabezado */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
        >
          <h1 style={{ margin: 0 }}>{item.name}</h1>
          <span
            style={{
              fontSize: 12,
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "2px 6px",
            }}
          >
            Fuente · {item.source === "google" ? "Google" : "ServiciosPE"}
          </span>
          {canFavorite && (
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              style={{
                marginLeft: "auto",
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: isFavorite ? "#ffe3e3" : "#f7f7f8",
                cursor: favLoading ? "not-allowed" : "pointer",
              }}
            >
              {isFavorite ? "❤️ En favoritos" : "♡ Añadir a favoritos"}
            </button>
          )}
        </div>

        {/* Galería (hasta 3) */}
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {(item as any).imagesUrl && (item as any).imagesUrl.length > 0 ? (
            (item as any).imagesUrl.slice(0,3).map((url: string, idx: number) => (
              <div key={idx} style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 10, background: '#f2f2f2' }}>
                <img src={url} alt={`${item.name} ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', width: '100%', aspectRatio: '16 / 9', borderRadius: 12, overflow: 'hidden', background: '#f2f2f2' }}>
              {item.image ? (
                <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#999" }}>Sin foto</div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <section style={{ marginTop: 14 }}>
          {(item as any).description && (
            <p style={{ marginTop: 10, color: '#444', lineHeight: 1.5 }}>
              {(item as any).description}
            </p>
          )}

          <div style={{ color: "#444", fontSize: 15 }}>
            {item.address?.formatted ||
              [item.address?.street, item.address?.district, item.address?.city]
                .filter(Boolean)
                .join(", ") ||
              "Ubicación aproximada"}
          </div>
          <div style={{ marginTop: 6, color: "#666" }}>
            ⭐ {item.rating?.average?.toFixed(1) ?? "0"} ({item.rating?.count ?? 0})
            {item.source === "google" && (
              <>
                {" "}
                •{" "}
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver reseñas en Google
                </a>
              </>
            )}
          </div>

                    {/* Contacto */}
          {item.contact && (
            <div style={{ marginTop: 8, display: "grid", gap: 6, fontSize: 14 }}>
              {item.contact.phone && (
                <div>📞 <a href={`tel:${item.contact.phone}`}>{item.contact.phone}</a></div>
              )}
              {item.contact.email && (
                <div>✉️ <a href={`mailto:${item.contact.email}`}>{item.contact.email}</a></div>
              )}
              {item.contact.website && (
                <div>🌐 <a href={item.contact.website} target="_blank" rel="noopener noreferrer">{item.contact.website}</a></div>
              )}
            </div>
          )}


          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {hasOrigin && hasDest ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "#f7f7f8",
                  textDecoration: "none",
                  color: "#111",
                }}
                title="Abrir ruta en Google Maps"
              >
                🧭 Cómo llegar
              </a>
            ) : (
              <button
                onClick={() => getCurrentLocation()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #eee",
                  background: "#eee",
                  color: "#888",
                  cursor: "pointer",
                }}
                title="Necesitas permitir ubicación para trazar la ruta"
              >
                🧭 Cómo llegar
              </button>
            )}

            <button
              onClick={() => router.back()}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#fff",
              }}
            >
              ← Volver
            </button>
          </div>
        </section>

        {/* Horario */}
        {(item as any).schedule && (
          <div style={{ marginTop: 12 }}>
            <h3 style={{ margin: "0 0 6px" }}>Horario</h3>
            <div style={{ display: "grid", gap: 6, fontSize: 14 }}>
              {["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map((d) => {
                const row = (item as any).schedule?.[d];
                const label: Record<string,string> = {
                  monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles",
                  thursday: "Jueves", friday: "Viernes", saturday: "Sábado", sunday: "Domingo"
                };
                const txt = row?.open && row?.close ? `${row.open} – ${row.close}` : "Cerrado";
                return (
                  <div key={d} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{label[d]}</span>
                    <span style={{ color: "#444" }}>{txt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reseñas (solo locales) */}
        {canComment && (
          <section style={{ marginTop: 20 }}>
            <h3 style={{ margin: "0 0 8px" }}>Reseñas de la comunidad</h3>

            {/* Formulario */}
            <div
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 12,
                background: "#fafafa",
              }}
            >
              {!isAuthenticated ? (
                <div style={{ color: "#666" }}>
                  Inicia sesión para dejar una reseña.
                </div>
              ) : (
                <>
                  <label style={{ fontSize: 14 }}>Calificación</label>
                  <select
                    value={myRating}
                    onChange={(e) => setMyRating(Number(e.target.value))}
                    style={{ marginLeft: 8 }}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ⭐
                      </option>
                    ))}
                  </select>

                  <div style={{ marginTop: 8 }}>
                    <textarea
                      placeholder="Escribe tu reseña (máx. 200 caracteres)"
                      maxLength={200}
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        padding: 8,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <button
                      disabled={revLoading || myComment.trim().length === 0}
                      onClick={submitReview}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        background: "#f7f7f8",
                      }}
                    >
                      Publicar
                    </button>
                    {revError && (
                      <span style={{ color: "#a00" }}>{revError}</span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Lista */}
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              {revLoading && <div>Cargando reseñas…</div>}
              {!revLoading && reviews.length === 0 && (
                <div style={{ color: "#666" }}>
                  Sé el primero en reseñar este lugar.
                </div>
              )}
              {reviews.map((r) => {
  const ownerHasReply = !!r.ownerReply;
  const editable = ownerHasReply && canEditOwnerReply(r);

  return (
    <div key={r._id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fff" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <strong>{r.authorName || "Usuario"}</strong>
        <span>•</span>
        <span>{new Date(r.createdAt).toLocaleDateString("es-PE")}</span>
        <span style={{ marginLeft: "auto" }}>⭐ {r.rating}</span>
      </div>
      <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{r.comment}</div>

      {/* Respuesta del dueño (si existe) */}
      {ownerHasReply && (
        <div style={{
          marginTop: 10,
          padding: 10,
          borderLeft: "4px solid #4caf50",
          background: "#f6fff7",
          borderRadius: 8
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Respuesta del dueño</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{r.ownerReply.text}</div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            {editable
              ? `Puedes editar por ~${replyWindowMin} min desde la primera respuesta.`
              : `Respondido el ${new Date(r.ownerReply.createdAt).toLocaleString("es-PE")}`}
          </div>
        </div>
      )}

      {/* Acciones del dueño */}
      {canReply && (
        <div style={{ marginTop: 8 }}>
          {!ownerHasReply ? (
            <>
              {replyingId === r._id ? (
                <>
                  <textarea
                    placeholder="Escribe tu respuesta (máx. 300)"
                    maxLength={300}
                    value={replyDraft[r._id] || ""}
                    onChange={(e) =>
                      setReplyDraft(prev => ({ ...prev, [r._id]: e.target.value }))
                    }
                    rows={3}
                    style={{ width: "100%", borderRadius: 10, border: "1px solid #ddd", padding: 8 }}
                  />
                  <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                    <button
                      disabled={revLoading || !(replyDraft[r._id] || '').trim()}
                      onClick={() => submitOwnerReply(r._id)}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#f7f7f8" }}
                    >
                      Publicar respuesta
                    </button>
                    <button
                      onClick={() => setReplyingId(null)}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => { setReplyingId(r._id); setReplyDraft(prev => ({ ...prev, [r._id]: '' })); }}
                  style={{ marginTop: 6, padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#f7f7f8" }}
                >
                  Responder como dueño
                </button>
              )}
            </>
          ) : (
            editable && (
              <>
                {replyingId === r._id ? (
                  <>
                    <textarea
                      placeholder="Editar respuesta (máx. 300)"
                      maxLength={300}
                      value={replyDraft[r._id] ?? r.ownerReply.text}
                      onChange={(e) =>
                        setReplyDraft(prev => ({ ...prev, [r._id]: e.target.value }))
                      }
                      rows={3}
                      style={{ width: "100%", borderRadius: 10, border: "1px solid #ddd", padding: 8 }}
                    />
                    <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                      <button
                        disabled={revLoading || !(replyDraft[r._id] ?? r.ownerReply.text).trim()}
                        onClick={() => submitOwnerReply(r._id)}
                        style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#f7f7f8" }}
                      >
                        Guardar cambios
                      </button>
                      <button
                        onClick={() => setReplyingId(null)}
                        style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => { setReplyingId(r._id); setReplyDraft(prev => ({ ...prev, [r._id]: r.ownerReply.text })); }}
                    style={{ marginTop: 6, padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#f7f7f8" }}
                  >
                    Editar respuesta
                  </button>
                )}
              </>
            )
          )}
        </div>
      )}
    </div>
  );
})}

            </div>
          </section>
        )}
      </main>
    </div>
  );
}
