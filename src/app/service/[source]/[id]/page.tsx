// frontend/src/app/service/[source]/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Layout/Navbar";
import { getNearbyCache } from "@/lib/searchCache";
import { SearchItem, SearchService, getLocalServiceDetail } from "@/lib/search";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/hooks/useAuth";
import { FavoritesService } from "@/lib/favorites";
import { ReviewsService, ReviewPayload } from "@/lib/reviews";
import {
  Heart,
  MapPin,
  Phone,
  Mail,
  Globe,
  Navigation,
  ArrowLeft,
  Clock,
  Star,
  MessageCircle,
  Info,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import styles from "./detail.module.css";

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

  // Carrusel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reseñas
  const [reviews, setReviews] = useState<any[]>([]);
  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState("");
  const [myRating, setMyRating] = useState<number>(5);
  const [myComment, setMyComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  // Geo
  const { coordinates, getCurrentLocation } = useGeolocation();

  // Respuestas del dueño
  const [canReply, setCanReply] = useState(false);
  const [replyWindowMin, setReplyWindowMin] = useState(15);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [collapsedReplies, setCollapsedReplies] = useState<Record<string, boolean>>({});

  function canEditOwnerReply(r: any) {
    if (!r.ownerReply) return false;
    const created = new Date(r.ownerReply.createdAt).getTime();
    const now = Date.now();
    return now - created <= replyWindowMin * 60 * 1000;
  }

  function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'ahora';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} d`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 604800)} sem`;
    if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} mes`;
    return `hace ${Math.floor(diffInSeconds / 31536000)} año`;
  }

  useEffect(() => {
    if (!coordinates) getCurrentLocation();
  }, []);

  const canFavorite = useMemo(() => item?.source === "serviciospe", [item?.source]);
  const canComment = canFavorite;

  useEffect(() => {
    const source = params.source;
    const id = params.id;

    const tryCache = () => {
      const cache = getNearbyCache();
      if (!cache) return false;
      const found = cache.results.find((r) => r.id === id && r.source === source);
      if (found) {
        setItem(found);
        return true;
      }
      return false;
    };

    const fetchFallback = async () => {
      try {
        const center = coordinates || { lat: -12.0464, lng: -77.0428 };
        const resp = await SearchService.search({
          lat: center.lat,
          lng: center.lng,
          radius: 1000,
          page: 1,
          limit: 20,
        });
        const f = resp.results.find((r: SearchItem) => r.id === id && r.source === source);
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
  }, [params.source, params.id]);

  // Cargar favoritos
  useEffect(() => {
    if (!item || item.source !== "serviciospe" || !isAuthenticated) return;
    (async () => {
      try {
        const { favorites } = await FavoritesService.listMine();
        setIsFavorite(favorites.includes(item.id));
      } catch {
        
      }
    })();
  }, [item, isAuthenticated]);

  // Cargar reseñas
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

  // Cargar detalles completos
  useEffect(() => {
    if (!item) return;
    if (item.source === "serviciospe") {
      (async () => {
        try {
          const { success, service } = await getLocalServiceDetail(item.id);
          if (success && service) {
            setItem((prev) =>
              prev
                ? {
                    ...prev,
                    name: service.name,
                    address: service.address,
                    rating: service.rating,
                    contact: service.contact,
                    imagesUrl: (service.images || []).map((i: any) => i.url).filter(Boolean),
                    description: service.description || "",
                    schedule: service.schedule || null,
                  }
                : prev
            );
          }
        } catch {
          
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
    if (!item) return;
    const text = (replyDraft[reviewId] || "").trim();
    if (!text) return;
    try {
      setRevLoading(true);
      setRevError("");
      await ReviewsService.reply(reviewId, text);
      const res = await ReviewsService.list(item.id);
      setReviews(res.reviews);
      setCanReply(!!res.canReply);
      if (res.replyEditWindowMinutes) setReplyWindowMin(res.replyEditWindowMinutes);
      setReplyingId(null);
    } catch (e: any) {
      setRevError(e?.message || "Error enviando respuesta");
    } finally {
      setRevLoading(false);
    }
  }

  const submitReview = async () => {
    if (!item || !canComment) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      setRevLoading(true);
      setRevError("");

      const payload: ReviewPayload = { rating: myRating, comment: myComment };
      await ReviewsService.create(item.id, payload);
      setMyComment("");

      const res = await ReviewsService.list(item.id);
      setReviews(res.reviews);
      setCanReply(!!res.canReply);
      if (res.replyEditWindowMinutes) setReplyWindowMin(res.replyEditWindowMinutes);

      if (item.source === "serviciospe") {
        const { success, service } = await getLocalServiceDetail(item.id);
        if (success && service) {
          setItem((prev) => (prev ? { ...prev, rating: service.rating } : prev));
        }
      }
    } catch (e: any) {
      const apiMsg = e?.response?.data?.message;
      setRevError(apiMsg || e?.message || "Error al enviar reseña");
    } finally {
      setRevLoading(false);
    }
  };

  // Funciones del carrusel
  const googleImages =
    item && item.source === "google"
      ? (item.photoRefs || []).map((ref: string) =>
          `${process.env.NEXT_PUBLIC_API_URL}/places/photo?ref=${encodeURIComponent(
            ref
          )}&maxwidth=800`
        )
      : [];

  const images = [
    ...(((item as any)?.imagesUrl || []) as string[]),
    ...googleImages,
  ].filter(Boolean);

  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Cargando detalle...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.notFound}>
            <div className={styles.notFoundIcon}>🔍</div>
            <h2 className={styles.notFoundTitle}>No encontramos este lugar</h2>
            <p className={styles.notFoundText}>Vuelve al inicio y prueba otra búsqueda.</p>
            <button
              onClick={() => router.push("/")}
              className={`${styles.actionButton} ${styles.primary}`}
            >
              <ArrowLeft size={18} />
              Volver al inicio
            </button>
          </div>
        </main>
      </div>
    );
  }

  const hasOrigin =
    !!coordinates && typeof coordinates.lat === "number" && typeof coordinates.lng === "number";
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
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.titleWrapper}>
              <h1 className={styles.title}>{item.name}</h1>
              <div className={styles.badges}>
                <span className={`${styles.badge} ${styles.badgeSource}`}>
                  {item.source === "google" ? "Google" : "ServiciosPE"}
                </span>
                {item.category && (
                  <span className={styles.badge}>{(item.category || "").replaceAll("_", " ")}</span>
                )}
              </div>
            </div>

            <div className={styles.headerActions}>
              {/* Botón de favoritos - Mostrar siempre pero deshabilitado para Google */}
              <button
                onClick={canFavorite ? toggleFavorite : undefined}
                disabled={favLoading || !canFavorite}
                className={`${styles.favoriteButton} ${isFavorite ? styles.active : ""} ${
                  !canFavorite ? styles.disabled : ""
                }`}
                title={!canFavorite ? "Solo disponible para servicios de ServiciosPE" : ""}
              >
                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                {isFavorite ? "En favoritos" : "Añadir a favoritos"}
              </button>
            </div>
          </div>

          <div className={styles.rating}>
            <div className={styles.ratingStars}>
              <Star size={20} fill="#fbbf24" color="#fbbf24" />
              {item.rating?.average?.toFixed(1) ?? "0.0"}
            </div>
            <span className={styles.ratingCount}>({item.rating?.count ?? 0} reseñas)</span>
          </div>
        </div>

        {/* Galería con Carrusel */}
        {images.length > 0 ? (
          <div className={styles.carousel}>
            <div className={styles.carouselImage}>
              <img src={images[currentImageIndex]} alt={`${item.name} ${currentImageIndex + 1}`} />
            </div>
            
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className={`${styles.carouselButton} ${styles.carouselButtonPrev}`}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className={`${styles.carouselButton} ${styles.carouselButtonNext}`}
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight size={24} />
                </button>

                <div className={styles.carouselIndicators}>
                  {images.map((_: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`${styles.carouselIndicator} ${
                        idx === currentImageIndex ? styles.active : ""
                      }`}
                      aria-label={`Ir a imagen ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={styles.galleryPlaceholder}>
            {item.image ? (
              <img src={item.image} alt={item.name} />
            ) : (
              <>
                <ImageOff size={48} strokeWidth={1.5} />
                <span>Sin imagen</span>
              </>
            )}
          </div>
        )}

        {/* Descripción */}
        {(item as any).description && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>
                <Info size={20} />
              </span>
              Descripción
            </h2>
            <p className={styles.description}>{(item as any).description}</p>
          </div>
        )}

        {/* Información */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>
              <MapPin size={20} />
            </span>
            Información de Contacto
          </h2>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>
                <MapPin size={18} />
              </span>
              <span className={styles.infoText}>
                {item.address?.formatted ||
                  [item.address?.street, item.address?.district, item.address?.city]
                    .filter(Boolean)
                    .join(", ") ||
                  "Ubicación aproximada"}
              </span>
            </div>

            {item.contact?.phone && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <Phone size={18} />
                </span>
                <span className={styles.infoText}>
                  <a href={`tel:${item.contact.phone}`}>{item.contact.phone}</a>
                </span>
              </div>
            )}

           {/*{item.contact?.email && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <Mail size={18} />
                </span>
                <span className={styles.infoText}>
                  <a href={`mailto:${item.contact.email}`}>{item.contact.email}</a>
                </span>
              </div>
            )} */}

            {item.contact?.website && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>
                  <Globe size={18} />
                </span>
                <span className={styles.infoText}>
                  <a href={item.contact.website} target="_blank" rel="noopener noreferrer">
                    {item.contact.website}
                  </a>
                </span>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {hasOrigin && hasDest ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.actionButton} ${styles.primary}`}
              >
                <Navigation size={18} />
                Cómo llegar
              </a>
            ) : (
              <button onClick={() => getCurrentLocation()} className={styles.actionButton}>
                <Navigation size={18} />
                Cómo llegar
              </button>
            )}

            <button onClick={() => router.back()} className={styles.actionButton}>
              <ArrowLeft size={18} />
              Volver
            </button>
          </div>
        </div>

        {/* Horario */}
        {(item as any).schedule && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>
                <Clock size={20} />
              </span>
              Horario de Atención
            </h2>
            <div className={styles.scheduleGrid}>
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((d) => {
                const row = (item as any).schedule?.[d];
                const label: Record<string, string> = {
                  monday: "Lunes",
                  tuesday: "Martes",
                  wednesday: "Miércoles",
                  thursday: "Jueves",
                  friday: "Viernes",
                  saturday: "Sábado",
                  sunday: "Domingo",
                };
                const txt = row?.open && row?.close ? `${row.open} – ${row.close}` : "Cerrado";
                const isClosed = !row?.open || !row?.close;

                return (
                  <div key={d} className={styles.scheduleRow}>
                    <span className={styles.scheduleDay}>{label[d]}</span>
                    <span className={`${styles.scheduleTime} ${isClosed ? styles.closed : ""}`}>
                      {txt}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reseñas */}
        <div className={styles.reviewsSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>
              <MessageCircle size={20} />
            </span>
            Reseñas de la Comunidad
          </h2>

          {!canComment ? (
            <div className={styles.googleReviewsNotice}>
              <div className={styles.noticeIcon}>
                <Info size={32} />
              </div>
              <h3 className={styles.noticeTitle}>Servicio de Google</h3>
              <p className={styles.noticeText}>
                Este servicio proviene de Google Maps. Para ver o dejar reseñas, visita su página
                en Google Maps.
              </p>
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.noticeButton}
              >
                <MessageCircle size={18} />
                Ver reseñas en Google Maps
              </a>
            </div>
          ) : (
            <>
              {/* Formulario */}
              <div className={styles.reviewForm}>
                {!isAuthenticated ? (
                  <div className={styles.loginPrompt}>Inicia sesión para dejar una reseña</div>
                ) : (
                  <>
                    <h3 className={styles.reviewFormTitle}>Escribe tu reseña</h3>

                    <div className={styles.ratingSelector}>
                      <span className={styles.ratingLabel}>Calificación:</span>
                      <div className={styles.starRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setMyRating(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className={styles.starButton}
                          >
                            <Star
                              size={28}
                              fill={star <= (hoveredStar || myRating) ? "#fbbf24" : "none"}
                              color={star <= (hoveredStar || myRating) ? "#fbbf24" : "#d1d5db"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      placeholder="Comparte tu experiencia (máximo 200 caracteres)"
                      maxLength={200}
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      className={styles.reviewTextarea}
                    />

                    <div className={styles.reviewFormActions}>
                      <button
                        disabled={revLoading || myComment.trim().length === 0}
                        onClick={submitReview}
                        className={styles.submitButton}
                      >
                        Publicar Reseña
                      </button>
                    </div>

                    {revError && (
                      <div className={styles.reviewError}>
                        <span className={styles.reviewErrorIcon}>
                          <AlertCircle size={18} />
                        </span>
                        <span>{revError}</span>
                      </div>
                    )}

                  </>
                )}
              </div>

              {/* Lista de reseñas */}
              <div className={styles.reviewsList}>
                {revLoading && (
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Cargando reseñas...</p>
                  </div>
                )}

                {!revLoading && reviews.length === 0 && (
                  <div className={styles.emptyReviews}>Sé el primero en reseñar este lugar</div>
                )}

                {reviews.map((r) => {
                  const ownerHasReply = !!r.ownerReply;
                  const editable = ownerHasReply && canEditOwnerReply(r);
                  const isCollapsed = collapsedReplies[r._id] || false;

                  return (
                    <div key={r._id} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <span className={styles.reviewAuthor}>{r.authorName || "Usuario"}</span>
                        <span className={styles.reviewDate}>
                          {getRelativeTime(r.createdAt)}
                        </span>
                        <span className={styles.reviewRating}>
                          <Star size={16} fill="#fbbf24" color="#fbbf24" />
                          {r.rating}
                        </span>
                      </div>

                      <div className={styles.reviewComment}>{r.comment}</div>

                      {/* Botón para contraer/expandir - SOLO SI HAY RESPUESTA */}
                      {ownerHasReply && (
                        <button
                          onClick={() =>
                            setCollapsedReplies((prev) => ({
                              ...prev,
                              [r._id]: !prev[r._id],
                            }))
                          }
                          className={styles.toggleReplyButton}
                        >
                          {isCollapsed ? '▼ Ver respuesta' : '▲ Ocultar respuesta'}
                        </button>
                      )}

                      {/* Respuesta del dueño - SOLO SI NO ESTÁ COLAPSADA */}
                      {ownerHasReply && !isCollapsed && (
                        <div className={styles.ownerReply}>
                          <div className={styles.ownerReplyTitle}>Dueño</div>
                          <div className={styles.ownerReplyText}>{r.ownerReply.text}</div>
                          <div className={styles.ownerReplyMeta}>
                            {editable
                              ? `Puedes editar por ~${replyWindowMin} min desde la primera respuesta.`
                              : getRelativeTime(r.ownerReply.createdAt)}
                          </div>
                        </div>
                      )}

                      {/* Acciones del dueño - SOLO PARA EL DUEÑO */}
                      {canReply && (
                        <div className={styles.replyActions}>
                          {!ownerHasReply ? (
                            <>
                              {replyingId === r._id ? (
                                <div>
                                  <textarea
                                    placeholder="Escribe tu respuesta (máx. 300)"
                                    maxLength={300}
                                    value={replyDraft[r._id] || ""}
                                    onChange={(e) =>
                                      setReplyDraft((prev) => ({
                                        ...prev,
                                        [r._id]: e.target.value,
                                      }))
                                    }
                                    className={styles.reviewTextarea}
                                    rows={3}
                                  />
                                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                    <button
                                      disabled={revLoading || !(replyDraft[r._id] || "").trim()}
                                      onClick={() => submitOwnerReply(r._id)}
                                      className={styles.submitButton}
                                    >
                                      Publicar respuesta
                                    </button>
                                    <button
                                      onClick={() => setReplyingId(null)}
                                      className={styles.replyButton}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReplyingId(r._id);
                                    setReplyDraft((prev) => ({ ...prev, [r._id]: "" }));
                                  }}
                                  className={styles.replyButton}
                                >
                                  Responder como dueño
                                </button>
                              )}
                            </>
                          ) : (
                            editable && (
                              <>
                                {replyingId === r._id ? (
                                  <div>
                                    <textarea
                                      placeholder="Editar respuesta (máx. 300)"
                                      maxLength={300}
                                      value={replyDraft[r._id] ?? r.ownerReply.text}
                                      onChange={(e) =>
                                        setReplyDraft((prev) => ({
                                          ...prev,
                                          [r._id]: e.target.value,
                                        }))
                                      }
                                      className={styles.reviewTextarea}
                                      rows={3}
                                    />
                                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                      <button
                                        disabled={
                                          revLoading ||
                                          !(replyDraft[r._id] ?? r.ownerReply.text).trim()
                                        }
                                        onClick={() => submitOwnerReply(r._id)}
                                        className={styles.submitButton}
                                      >
                                        Guardar cambios
                                      </button>
                                      <button
                                        onClick={() => setReplyingId(null)}
                                        className={styles.replyButton}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setReplyingId(r._id);
                                      setReplyDraft((prev) => ({
                                        ...prev,
                                        [r._id]: r.ownerReply.text,
                                      }));
                                    }}
                                    className={styles.replyButton}
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}