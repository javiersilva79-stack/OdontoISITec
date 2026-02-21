"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Paciente = {
  id: number;
  consultorio_id: number;
  nombre: string;
  apellido: string;
  dni?: string | null;
  telefono?: string | null;
};

export default function PacientesPage() {
  const router = useRouter();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form mínimo (después lo ampliamos)
  const [consultorioId, setConsultorioId] = useState<number>(1);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving] = useState(false);

  async function cargarPacientes() {
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const data = await apiFetch("/pacientes/");
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

  async function crearPaciente(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !apellido.trim()) {
      setError("Nombre y apellido son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/pacientes/", {
        method: "POST",
        body: JSON.stringify({
          consultorio_id: consultorioId,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          dni: dni.trim() || null,
          telefono: telefono.trim() || null,
        }),
      });

      setNombre("");
      setApellido("");
      setDni("");
      setTelefono("");

      await cargarPacientes();
    } catch (e: any) {
      setError(e?.message || "Error creando paciente");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Pacientes</h1>

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
            fontWeight: 700,
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {error && (
        <div style={{ background: "#ffecec", color: "#b00020", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Form Alta */}
      <form onSubmit={crearPaciente} style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Nuevo paciente</h2>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label>Consultorio ID</label>
            <input
              type="number"
              value={consultorioId}
              onChange={(e) => setConsultorioId(Number(e.target.value))}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", width: 140 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label>Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", minWidth: 220 }}
              placeholder="Juan"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label>Apellido</label>
            <input
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", minWidth: 220 }}
              placeholder="Pérez"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label>DNI (opcional)</label>
            <input
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", minWidth: 180 }}
              placeholder="12345678"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label>Teléfono (opcional)</label>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", minWidth: 180 }}
              placeholder="3794..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: saving ? "#999" : "#1f4ed8",
            color: "white",
            fontWeight: 800,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {/* Tabla */}
      <div style={{ background: "white", padding: 16, borderRadius: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Listado</h2>

        {loading ? (
          <div>Cargando...</div>
        ) : pacientes.length === 0 ? (
          <div>No hay pacientes cargados.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Nombre</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Apellido</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>DNI</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{p.nombre}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{p.apellido}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{p.dni ?? "-"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{p.telefono ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}