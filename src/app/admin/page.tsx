// frontend/src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

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

// 👇 Base del backend (igual que en tus otros servicios)
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
    // aún cargando auth
    if (user === null) return;

    // si no es admin, fuera
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // 🔑 Obtener token del localStorage para el Bearer
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
          console.error("srvRes status:", srvRes.status, await srvRes.text());
          console.error("usrRes status:", usrRes.status, await usrRes.text());
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
    // mientras redirige
    return null;
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Panel de administración</h1>
        <p>Cargando datos...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Panel de administración</h1>
        <p style={{ color: "red" }}>{error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Panel de administración</h1>

      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <button
          onClick={() => setTab("services")}
          style={{
            marginRight: 8,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: tab === "services" ? "#eee" : "#fff",
          }}
        >
          Negocios ({services.length})
        </button>
        <button
          onClick={() => setTab("users")}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: tab === "users" ? "#eee" : "#fff",
          }}
        >
          Usuarios ({users.length})
        </button>
      </div>

      {tab === "services" ? (
        <section>
          <h2>Negocios registrados</h2>
          {services.length === 0 ? (
            <p>No hay servicios registrados.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Nombre</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Categoría</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Activo</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Propietario</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Creado</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s._id}>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{s.name}</td>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{s.category}</td>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                      {s.isActive ? "Sí" : "No"}
                    </td>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                      {s.owner ? `${s.owner.name} (${s.owner.email})` : "—"}
                    </td>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : (
        <section>
          <h2>Usuarios registrados</h2>
          {users.length === 0 ? (
            <p>No hay usuarios registrados.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Nombre</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Email</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Rol</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Activo</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Creado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{u.name}</td>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{u.email}</td>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{u.role}</td>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                      {u.isActive ? "Sí" : "No"}
                    </td>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                      {new Date(u.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </main>
  );
}
