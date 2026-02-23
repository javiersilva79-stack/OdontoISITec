"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Paciente = {
  id: number;
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?: string;
  obra_social?: string;
  activo: boolean;
};

export default function PacientesPage() {
  const router = useRouter();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  async function cargarPacientes() {
    setLoading(true);
    setError("");

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
  }, []);

  const pacientesFiltrados = useMemo(() => {
    const b = busqueda.toLowerCase().trim();
    if (!b) return pacientes;

    return pacientes.filter((p) =>
      `${p.nombre} ${p.apellido} ${p.dni ?? ""}`
        .toLowerCase()
        .includes(b)
    );
  }, [busqueda, pacientes]);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>
        Pacientes
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            minWidth: 250,
          }}
        />

        <button
          onClick={() => router.push("/pacientes/nuevo")}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Nuevo paciente
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

      <div style={{ background: "white", padding: 16, borderRadius: 12 }}>
        {loading ? (
          <div>Cargando...</div>
        ) : pacientesFiltrados.length === 0 ? (
          <div>No hay pacientes.</div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={{ padding: 10 }}>Nombre</th>
                <th style={{ padding: 10 }}>DNI</th>
                <th style={{ padding: 10 }}>Teléfono</th>
                <th style={{ padding: 10 }}>Obra social</th>
                <th style={{ padding: 10 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/pacientes/${p.id}`)}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <td style={{ padding: 10 }}>
                    {p.apellido}, {p.nombre}
                  </td>
                  <td style={{ padding: 10 }}>{p.dni || "-"}</td>
                  <td style={{ padding: 10 }}>{p.telefono || "-"}</td>
                  <td style={{ padding: 10 }}>
                    {p.obra_social || "-"}
                  </td>
                  <td style={{ padding: 10 }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: p.activo
                          ? "#e8f7ee"
                          : "#fdecec",
                        color: p.activo
                          ? "#0b6b2b"
                          : "#9b1c1c",
                      }}
                    >
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
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