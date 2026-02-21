"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Paciente = {
  id?: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  consultorio_id?: number;
};

const API_BASE = "http://localhost:8000";

export default function PacientesPage() {
  const router = useRouter();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving] = useState(false);

  // =============================
  // CARGAR PACIENTES
  // =============================
  async function cargarPacientes() {
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/pacientes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`GET /pacientes -> ${res.status}`);
      }

      const data = await res.json();
      setPacientes(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Error cargando pacientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarPacientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =============================
  // CREAR PACIENTE
  // =============================
  async function crearPaciente(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !apellido.trim()) {
      setError("Nombre y apellido son obligatorios.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      const body: any = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        consultorio_id: 1, // 🔴 requerido por el backend
      };

      if (telefono.trim()) body.telefono = telefono.trim();

      const res = await fetch(`${API_BASE}/pacientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`POST /pacientes -> ${res.status} ${txt}`);
      }

      // limpiar form
      setNombre("");
      setApellido("");
      setTelefono("");

      // recargar lista
      await cargarPacientes();
    } catch (e: any) {
      setError(e?.message || "Error creando paciente");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Pacientes</h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#ffecec",
            color: "#b00020",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* FORMULARIO */}
      <form
        onSubmit={crearPaciente}
        style={{
          background: "white",
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          Nuevo paciente
        </h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
          <input
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>

        <button type="submit" disabled={saving} style={{ marginTop: 12 }}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {/* TABLA */}
      <div style={{ background: "white", padding: 16, borderRadius: 12 }}>
        {loading ? (
          <p>Cargando...</p>
        ) : pacientes.length === 0 ? (
          <p>No hay pacientes cargados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p, i) => (
                <tr key={p.id ?? i}>
                  <td>{p.nombre}</td>
                  <td>{p.apellido}</td>
                  <td>{p.telefono ?? "-"}</td>
                  <td>Ver</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
