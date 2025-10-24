// frontend/src/components/Layout/Navbar.tsx

"use client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { BusinessService } from "@/lib/services";


export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("/default-avatar.png");
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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
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


  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo} onClick={() => router.push("/")}>
          <h2>ServiciosPE</h2>
        </div>

        {/* Botones de navegación */}
        <div className={styles.actions}>
          <button 
            className={styles.businessButton}
            onClick={handleRegisterBusiness}
          >
            {user?.role === 'provider' ? 'Editar mi negocio' : 'Mi Negocio'}
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
                  <button onClick={handleProfile} className={styles.menuItem}>
                    👤 Mi Perfil
                  </button>

                  {user?.role === "provider" && (
                    <button onClick={handleViewMyBusiness} className={styles.menuItem}>
                      💬 Ver mi negocio (responder reseñas)
                    </button>
                  )}


                  <button onClick={handleFavorites} className={styles.menuItem}>
                    ❤️ Favoritos
                  </button>
                  <hr className={styles.divider} />

                  <button
                    onClick={handleLogout}
                    className={styles.menuItem}
                    style={{ color: "red" }}
                  >
                    🚪 Cerrar Sesión
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
