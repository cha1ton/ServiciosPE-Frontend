// frontend/src/components/Layout/Navbar.tsx

"use client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { BusinessService } from "@/lib/services";
import { ReviewsService } from '@/lib/reviews';
import { 
  Bell, 
  Store, 
  User, 
  Heart, 
  Lock, 
  Info, 
  Settings, 
  Mail, 
  LogOut,
  MessageCircle
} from "lucide-react";


export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("/default-avatar.png");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadItems, setUnreadItems] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ✅ AGREGAR ESTO PARA DEBUG
  useEffect(() => {
    if (user) {
      console.log("🔍 DEBUG Navbar - Rol del usuario:", user.role);
      console.log("🔍 DEBUG Navbar - User completo:", user);
    }
  }, [user]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ CORRECCIÓN: Manejar correctamente customPhoto (base64) y photo (URL)
  useEffect(() => {
    if (user) {
      console.log("=== DEBUG AVATAR ===");
      console.log("Tiene customPhoto?:", !!user.customPhoto);
      console.log("Tiene photo?:", !!user.photo);

      if (user.customPhoto) {
        console.log("✅ Usando foto personalizada");

        // Si es base64 (no empieza con http), agregar prefijo data URL
        let photoUrl = user.customPhoto;
        if (
          !user.customPhoto.startsWith("http") &&
          user.customPhoto.length > 100
        ) {
          photoUrl = `data:image/jpeg;base64,${user.customPhoto}`;
          console.log("🔄 Convertido base64 a data URL");
        }

        setAvatarUrl(photoUrl);
      } else if (user.photo) {
        console.log("✅ Usando foto de Google");
        setAvatarUrl(user.photo);
      } else {
        console.log("ℹ️ Usando avatar por defecto");
        setAvatarUrl("/default-avatar.png");
      }
    }
  }, [user]);

  // Función para manejar errores de carga de imagen
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    console.log("❌ Error cargando imagen, usando avatar por defecto");
    e.currentTarget.src = "/default-avatar.png";
  };

  // Obtener respuestas no leídas
  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;
    let inFlight = false;

    const fetchUnread = async () => {
      if (!user) return;
      // Solo actualizar cuando la pestaña esté visible (evita polling en background)
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      if (inFlight) return;
      inFlight = true;
      try {
        const res = await ReviewsService.unread();
        if (!mounted) return;
        setUnreadCount(res.count || 0);
        setUnreadItems(res.items || []);
      } catch (err) {
        console.error('Error fetch unread replies', err);
      } finally {
        inFlight = false;
      }
    };

    void fetchUnread();
    // poll cada 45s
    timer = window.setInterval(() => { void fetchUnread(); }, 45000);

    return () => { mounted = false; if (timer) clearInterval(timer); };
  }, [user]);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleOpenNotification = async (item: any) => {
    try {
      await ReviewsService.markRead(item.reviewId);
    } catch (e) {
      console.warn('No se pudo marcar como leída', e);
    }
    // navegar a la ficha del servicio si existe
    const id = item.serviceId;
    if (id) {
      router.push(`/service/serviciospe/${id}`);
    } else {
      router.push('/profile');
    }
    setShowNotifications(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleRegisterBusiness = () => {
    if (user?.role === 'provider') {
      router.push('/my-business/edit');   // ya tiene negocio → editar
    } else {
      router.push('/register-business');  // aún no tiene → registrar
    }
  };

  const handleProfile = () => {
    router.push("/profile");
    setIsMenuOpen(false);
  };

  const handleFavorites = () => {
    router.push("/favorites");
    setIsMenuOpen(false);
  };

  const handleViewMyBusiness = async () => {
    try {
      const data = await BusinessService.getMyBusiness(); // { success, service }
      const svc = data?.service;
      // puede venir como _id o id según tu backend; cubrimos ambos
      const id = svc?._id || svc?.id;
      if (id) {
        router.push(`/service/serviciospe/${id}`);
        setIsMenuOpen(false);
      } else {
        alert("Aún no registraste un negocio.");
      }
    } catch {
      alert("No pudimos abrir tu ficha. ¿Ya registraste tu negocio?");
    }
  };

  const handleAbout = () => {
    router.push("/info/quienes-somos");
    setIsMenuOpen(false);
  };

  const handlePrivacy = () => {
    router.push('/privacy');
    setIsMenuOpen(false);
  };

  const handleHowItWorks = () => {
    router.push("/info/como-funciona");
    setIsMenuOpen(false);
  };

  const handleContact = () => {
    router.push("/info/contacto");
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo} onClick={() => router.push("/")}>
          <h2>ServiciosPE</h2>
        </div>

        {/* Enlaces visibles en DESKTOP (ocultos en móvil) */}
        <div className={styles.desktopLinks}>
          {user?.role === "provider" && (
            <button onClick={handleViewMyBusiness} className={styles.navLink}>
              <MessageCircle size={18} />
              <span>Mi Negocio</span>
            </button>
          )}

          <button onClick={handleAbout} className={styles.navLink}>
            <Info size={18} />
            <span>Quiénes somos</span>
          </button>

          <button onClick={handleHowItWorks} className={styles.navLink}>
            <Settings size={18} />
            <span>Cómo funciona</span>
          </button>
        </div>

        {/* Botones de navegación */}
        <div className={styles.actions}>
          {/* Campana de notificaciones */}
          <div style={{ position: 'relative' }}>
            <button className={styles.notificationButton} onClick={handleToggleNotifications} aria-label="Notificaciones">
              <Bell size={20} />
              {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className={styles.dropdownMenu} style={{ right: 48, minWidth: 320 }}>
                <div style={{ padding: 8 }}>
                  <strong>Respuestas</strong>
                </div>
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                  {unreadItems.length === 0 && <div style={{ padding: 12 }}>No hay respuestas nuevas</div>}
                  {unreadItems.map(item => (
                    <button key={item.reviewId} onClick={() => handleOpenNotification(item)} className={styles.menuItem}>
                      {item.type === 'owner_reply' ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.serviceTitle || 'Servicio'} te respondió</div>
                          <div style={{ fontSize: 12, color: '#666' }}>{item.ownerReply?.text?.slice(0, 120)}</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>Nueva reseña en {item.serviceTitle || 'Servicio'}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>{(item.authorName ? item.authorName + ': ' : '') + (item.comment || '').slice(0, 120)}</div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            className={styles.businessButton}
            onClick={handleRegisterBusiness}
          >
            <Store size={18} />
            <span>{user?.role === 'provider' ? 'Editar mi negocio' : 'Registrar negocio'}</span>
          </button>

          {/* Menú de perfil */}
          <div className={styles.profileMenu} ref={menuRef}>
            <button
              className={styles.profileButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img
                src={avatarUrl}
                alt="Perfil"
                className={styles.avatar}
                onError={handleImageError}
                onLoad={() =>
                  console.log("✅ Imagen cargada correctamente en navbar")
                }
              />
            </button>

            {isMenuOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.userInfo}>
                  <p className={styles.userName}>
                    {user?.nickname || user?.name}
                  </p>
                  <p className={styles.userEmail}>{user?.email}</p>
                  <p className={styles.userRole}>
                    Rol: {user?.role === "provider" ? "Proveedor" : "Usuario"}
                  </p>
                </div>

                <div className={styles.menuItems}>
                  {/* Enlaces para MÓVIL ÚNICAMENTE (solo se ven en móvil) */}
                  <div className={styles.mobileOnlyLinks}>
                    {user?.role === "provider" && (
                      <button onClick={handleViewMyBusiness} className={styles.menuItem}>
                        <MessageCircle size={18} />
                        <span>Ver mi negocio (responder reseñas)</span>
                      </button>
                    )}

                    <button onClick={handleAbout} className={styles.menuItem}>
                      <Info size={18} />
                      <span>Quiénes somos</span>
                    </button>
                    
                    <button onClick={handleHowItWorks} className={styles.menuItem}>
                      <Settings size={18} />
                      <span>Cómo funciona</span>
                    </button>

                    <hr className={styles.divider} />
                  </div>

                  {/* Enlaces visibles siempre en el menú desplegable */}
                  <button onClick={handleProfile} className={styles.menuItem}>
                    <User size={18} />
                    <span>Mi Perfil</span>
                  </button>

                  <button onClick={handleFavorites} className={styles.menuItem}>
                    <Heart size={18} />
                    <span>Favoritos</span>
                  </button>

                  <button onClick={handlePrivacy} className={styles.menuItem}>
                    <Lock size={18} />
                    <span>Política de Privacidad</span>
                  </button>

                  <button onClick={handleContact} className={styles.menuItem}>
                    <Mail size={18} />
                    <span>Contacto</span>
                  </button>

                  <hr className={styles.divider} />

                  <button
                    onClick={handleLogout}
                    className={styles.menuItem}
                    style={{ color: "red" }}
                  >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}