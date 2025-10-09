// frontend/src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Layout/Navbar";
import { AuthService } from "@/lib/auth";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    nickname: "",
    customPhoto: "",
  });
  const [previewImage, setPreviewImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

// Cargar datos del usuario cuando esté disponible
useEffect(() => {
  if (user) {
    setFormData({
      nickname: user.nickname || '',
      customPhoto: user.customPhoto || ''
    });
    
    // CORREGIR: Manejar tanto base64 como URLs normales
    if (user.customPhoto) {
      // Si es base64 (no empieza con http), agregar prefijo
      if (!user.customPhoto.startsWith('http')) {
        setPreviewImage(`data:image/jpeg;base64,${user.customPhoto}`);
      } else {
        setPreviewImage(user.customPhoto);
      }
    } else if (user.photo) {
      setPreviewImage(user.photo);
    } else {
      setPreviewImage('/default-avatar.png');
    }
  }
}, [user]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);


  // ✅ AGREGAR ESTO PARA DEBUG
  useEffect(() => {
    if (user) {
      console.log('🔍 DEBUG Profile - Rol del usuario:', user.role);
    }
  }, [user]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        setMessage("Por favor selecciona una imagen válida");
        return;
      }

      // Ahora validamos con 1MB (igual que el backend)
      if (file.size > 1 * 1024 * 1024) {
        setMessage("La imagen debe ser menor a 1MB");
        return;
      }

      // Guardar el File object para enviarlo
      setSelectedFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const profileData: { nickname?: string; profilePhoto?: File } = {
        nickname: formData.nickname,
      };

      // Si hay una nueva imagen (es un File object), agregarla
      if (selectedFile) {
        profileData.profilePhoto = selectedFile;
      }

      await AuthService.updateProfile(profileData);
      setMessage("Perfil actualizado correctamente");

      // Refrescar datos del usuario
      await refreshUser();
      // Limpiar el archivo seleccionado después de guardar
      setSelectedFile(null); //agregado el 27-09-25 02:59
    } catch (error: any) {
      setMessage(error.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.profileCard}>
          <h1 className={styles.title}>Gestión de Perfil</h1>

          {message && (
            <div
              className={`${styles.message} ${
                message.includes("Error") ? styles.error : styles.success
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Información de Google (no editable) */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Información de Google</h2>

              <div className={styles.fields}>
                <div className={styles.field}>
                  <label className={styles.label}>Nombre</label>
                  <input
                    type="text"
                    value={user.name}
                    disabled
                    className={styles.disabledInput}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className={styles.disabledInput}
                  />
                </div>
              </div>
            </div>

            {/* Información editable directamente */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Información Pública</h2>

              {/* Foto de perfil - SIEMPRE EDITABLE */}
              <div className={styles.photoSection}>
                <label className={styles.label}>Foto de Perfil</label>
                <div className={styles.photoContainer}>
                  <div className={styles.photoPreview}>
                    <img
                      src={previewImage || "/default-avatar.png"}
                      alt="Foto de perfil"
                      className={styles.avatar}
                    />
                  </div>

                  <div className={styles.photoUpload}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={styles.fileInput}
                    />
                    <p className={styles.helpText}>
                      Formatos: JPEG, PNG, GIF. Máximo 1MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Apodo - SIEMPRE EDITABLE */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Apodo (Visible públicamente)
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData({ ...formData, nickname: e.target.value })
                  }
                  placeholder="Ingresa un apodo para que te identifiquen"
                  className={styles.input}
                />
                <p className={styles.helpText}>
                  Este es el nombre que otros usuarios verán cuando interactúes
                  en la plataforma
                </p>
              </div>
            </div>

            {/* Botón de guardar */}
            <div className={styles.actions}>
              <button
                type="submit"
                disabled={loading}
                className={styles.saveButton}
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>

          {/* Información adicional */}
          <div className={styles.infoSection}>
            <h3 className={styles.infoTitle}>Información de la Cuenta</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Rol:</span>
                <span className={styles.infoValue}>
                  {user.role === "provider" ? "Proveedor" : "Usuario"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Miembro desde:</span>
                <span className={styles.infoValue}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("es-PE") : "-"}
                  </span>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
