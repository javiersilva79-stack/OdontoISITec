"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Odontologo = {
  id: number;
  nombre: string;
  apellido: string;
  matricula?: string;
  especialidad?: string;
  activo: boolean;
};

export default function OdontologosPage() {
  const router = useRouter();
  const [odontologos, setOdontologos] = useState<Odontologo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cargarOdontologos() {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/odontologos?solo_activos=false");
      setOdontologos(data);
    } catch (e: any) {
      setError("Error cargando odontólogos");
    } finally {
      setLoading(false);
    }
  }

  async function cambiarEstado(id: number, activo: boolean) {
    try {
      await apiFetch(`/odontologos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ activo: !activo }),
      });

      cargarOdontologos();
    } catch {
      setError("No se pudo cambiar el estado");
    }
  }

  useEffect(() => {
    cargarOdontologos();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>
        Odontólogos
      </h1>

      <button
        onClick={() => router.push("/odontologos/nuevo")}
        style={{
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid #ddd",
          background: "white",
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        + Nuevo odontólogo
      </button>

      {error && (
        <div style={{ background: "#ffecec", padding: 10, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ background: "white", padding: 16, borderRadius: 12 }}>
        {loading ? (
          <div>Cargando...</div>
        ) : odontologos.length === 0 ? (
          <div>No hay odontólogos.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "separate" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: 10 }}>Nombre</th>
                <th style={{ padding: 10 }}>Matrícula</th>
                <th style={{ padding: 10 }}>Especialidad</th>
                <th style={{ padding: 10 }}>Estado</th>
                <th style={{ padding: 10 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {odontologos.map((o) => (
                <tr key={o.id}>
                  <td style={{ padding: 10 }}>
                    {o.apellido}, {o.nombre}
                  </td>
                  <td style={{ padding: 10 }}>{o.matricula || "-"}</td>
                  <td style={{ padding: 10 }}>{o.especialidad || "-"}</td>
                  <td style={{ padding: 10 }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: o.activo ? "#e8f7ee" : "#fdecec",
                        color: o.activo ? "#0b6b2b" : "#9b1c1c",
                      }}
                    >
                      {o.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: 10 }}>
                    <button
                      onClick={() => router.push(`/odontologos/${o.id}/editar`)}
                      style={{
                        marginRight: 8,
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => cambiarEstado(o.id, o.activo)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        background: o.activo ? "#ef4444" : "#22c55e",
                        color: "white",
                      }}
                    >
                      {o.activo ? "Baja" : "Reactivar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}