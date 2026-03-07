"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Paciente = {
  id: number;
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;

  obra_social?: string;
  numero_afiliado?: string;

  activo: boolean;
  created_at?: string;
  updated_at?: string;
};

function fmtFecha(v?: string) {
  if (!v) return "-";
  // asumiendo ISO
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

export default function PacienteDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function cargarPaciente() {
    setLoading(true);
    setError("");

    try {
      const p = await apiFetch(`/pacientes/${id}`);
      setPaciente(p);
    } catch (e: any) {
      setError(e?.message || "Error cargando paciente");
    } finally {
      setLoading(false);
    }
  }

  async function desactivarPaciente() {
    if (!paciente) return;

    if (!paciente.activo) {
      window.alert("El paciente ya está inactivo.");
      return;
    }

    const ok = window.confirm(
      `¿Dar de baja a ${paciente.apellido}, ${paciente.nombre}?\n\n(No se borra: queda Inactivo.)`
    );
    if (!ok) return;

    try {
      await apiFetch(`/pacientes/${paciente.id}`, { method: "DELETE" });
      await cargarPaciente();
    } catch (e: any) {
      window.alert(e?.message || "Error dando de baja al paciente");
    }
  }

  useEffect(() => {
    if (!id) return;
    cargarPaciente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <div>Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <button
          onClick={() => router.push("/pacientes")}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          ← Volver
        </button>
        <div style={{ color: "#b00020" }}>{error}</div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <button
          onClick={() => router.push("/pacientes")}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          ← Volver
        </button>
        <div>No encontrado.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <button
            onClick={() => router.push("/pacientes")}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            ← Volver
          </button>

          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
            {paciente.apellido}, {paciente.nombre}
          </h1>

          <div style={{ marginTop: 8 }}>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                background: paciente.activo ? "#e8f7ee" : "#fdecec",
                color: paciente.activo ? "#0b6b2b" : "#9b1c1c",
              }}
            >
              {paciente.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
          <button
            onClick={() => router.push(`/pacientes/${paciente.id}/editar`)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Editar
          </button>

          <button
            onClick={desactivarPaciente}
            disabled={!paciente.activo}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: !paciente.activo ? "#f5f5f5" : "white",
              fontWeight: 800,
              cursor: !paciente.activo ? "not-allowed" : "pointer",
              opacity: !paciente.activo ? 0.7 : 1,
            }}
          >
            Baja
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20, background: "white", padding: 16, borderRadius: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 900, marginTop: 0 }}>Datos</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><b>DNI:</b> {paciente.dni || "-"}</div>
          <div><b>Teléfono:</b> {paciente.telefono || "-"}</div>
          <div><b>Email:</b> {paciente.email || "-"}</div>
          <div><b>Dirección:</b> {paciente.direccion || "-"}</div>
          <div><b>Ciudad:</b> {paciente.ciudad || "-"}</div>
          <div><b>Provincia:</b> {paciente.provincia || "-"}</div>
          <div><b>Obra social:</b> {paciente.obra_social || "-"}</div>
          <div><b>Nº afiliado:</b> {paciente.numero_afiliado || "-"}</div>
        </div>

        <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #eee" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12, color: "#555" }}>
          <div><b>Creado:</b> {fmtFecha(paciente.created_at)}</div>
          <div><b>Actualizado:</b> {fmtFecha(paciente.updated_at)}</div>
        </div>
      </div>
    </div>
  );
}