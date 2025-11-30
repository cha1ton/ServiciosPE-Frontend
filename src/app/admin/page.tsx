// frontend/src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Layout/Navbar";
import styles from "./admin.module.css";

interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminService {
  _id: string;
  name: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  owner?: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"services" | "users">("services");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user === null) return;

    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        let token: string | null = null;
        if (typeof window !== "undefined") {
          token = localStorage.getItem("token");
        }

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const [srvRes, usrRes] = await Promise.all([
          fetch(`${API_BASE}/admin/services`, {
            method: "GET",
            headers,
            credentials: "include",
          }),
          fetch(`${API_BASE}/admin/users`, {
            method: "GET",
            headers,
            credentials: "include",
          }),
        ]);

        if (!srvRes.ok || !usrRes.ok) {
          throw new Error("Error cargando datos de admin");
        }

        const srvJson = await srvRes.json();
        const usrJson = await usrRes.json();

        setServices(srvJson.services || []);
        setUsers(usrJson.users || []);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className={styles.container}>
      {}
      <Navbar />

      {}
      <main className={styles.main}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Cargando datos...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <div className={styles.header}>
              <h1 className={styles.title}>Panel de Administración</h1>
              <p className={styles.subtitle}>
                Gestiona usuarios y servicios de la plataforma
              </p>
            </div>

            <div className={styles.tabContainer}>
              <button
                onClick={() => setTab("services")}
                className={`${styles.tabButton} ${
                  tab === "services" ? styles.tabButtonActive : ""
                }`}
              >
                <span>🏪 Negocios</span>
                <span className={styles.tabCount}>{services.length}</span>
              </button>
              <button
                onClick={() => setTab("users")}
                className={`${styles.tabButton} ${
                  tab === "users" ? styles.tabButtonActive : ""
                }`}
              >
                <span>👥 Usuarios</span>
                <span className={styles.tabCount}>{users.length}</span>
              </button>
            </div>

            {tab === "services" ? (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Negocios registrados</h2>
                {services.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No hay servicios registrados.</p>
                  </div>
                ) : (
                  <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th className={styles.tableHeaderCell}>Nombre</th>
                        <th className={styles.tableHeaderCell}>Categoría</th>
                        <th className={styles.tableHeaderCell}>Estado</th>
                        <th className={styles.tableHeaderCell}>Propietario</th>
                        <th className={styles.tableHeaderCell}>Fecha Creación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s) => (
                        <tr key={s._id} className={styles.tableRow}>
                          <td className={styles.tableCell}>{s.name}</td>
                          <td className={styles.tableCell}>{s.category}</td>
                          <td className={styles.tableCell}>
                            <span
                              className={`${styles.badge} ${
                                s.isActive ? styles.badgeActive : styles.badgeInactive
                              }`}
                            >
                              {s.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className={styles.tableCell}>
                            {s.owner ? (
                              <div className={styles.ownerInfo}>
                                <span className={styles.ownerName}>{s.owner.name}</span>
                                <span className={styles.ownerEmail}>{s.owner.email}</span>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className={styles.tableCell}>
                            <span className={styles.dateText}>
                              {new Date(s.createdAt).toLocaleString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            ) : (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Usuarios registrados</h2>
                {users.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No hay usuarios registrados.</p>
                  </div>
                ) : (
                  <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th className={styles.tableHeaderCell}>Nombre</th>
                        <th className={styles.tableHeaderCell}>Email</th>
                        <th className={styles.tableHeaderCell}>Rol</th>
                        <th className={styles.tableHeaderCell}>Estado</th>
                        <th className={styles.tableHeaderCell}>Fecha Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className={styles.tableRow}>
                          <td className={styles.tableCell}>{u.name}</td>
                          <td className={styles.tableCell}>{u.email}</td>
                          <td className={styles.tableCell}>
                            <span
                              className={styles.badge}
                              style={{
                                background:
                                  u.role === "admin" ? "#dbeafe" : "#f3e8ff",
                                color: u.role === "admin" ? "#1e40af" : "#6b21a8",
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className={styles.tableCell}>
                            <span
                              className={`${styles.badge} ${
                                u.isActive ? styles.badgeActive : styles.badgeInactive
                              }`}
                            >
                              {u.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className={styles.tableCell}>
                            <span className={styles.dateText}>
                              {new Date(u.createdAt).toLocaleString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}