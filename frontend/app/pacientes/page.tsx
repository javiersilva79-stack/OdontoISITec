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
  
  const [showSuccess, setShowSuccess] = useState(false);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);
  
  

  // Para evitar pegarle al backend en cada tecla, esperamos un poquito
  const [debouncedBusqueda, setDebouncedBusqueda] = useState(busqueda);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBusqueda(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  async function cargarPacientes() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (debouncedBusqueda.trim()) params.set("q", debouncedBusqueda.trim());
      params.set("solo_activos", soloActivos ? "true" : "false");
      params.set("limit", "200");
      params.set("offset", "0");

      const data = await apiFetch(`/pacientes/?${params.toString()}`);
      setPacientes(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Error cargando pacientes");
    } finally {
      setLoading(false);
    }
  }

  async function cambiarEstado(id: number, activo: boolean) {
    try {
      await apiFetch(`/pacientes/${id}`, {
        method: "PUT",
        body: JSON.stringify({ activo: !activo }),
      });

      cargarPacientes(); // refresca lista
    } catch (e: any) {
      console.error("Error cambiando estado", e);
      setError("No se pudo cambiar el estado del paciente");
    }
  }

  useEffect(() => {
    const flag = sessionStorage.getItem("pacienteActualizado");

    if (flag === "1") {
      setShowSuccess(true);
      sessionStorage.removeItem("pacienteActualizado");

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  }, []);

  useEffect(() => {
    cargarPacientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBusqueda, soloActivos]);

  async function desactivarPaciente(id: number) {
    const ok = window.confirm(
      "¿Dar de baja este paciente?\n\n(No se borra: queda como Inactivo y se puede reactivar más adelante.)"
    );
    if (!ok) return;

    try {
      await apiFetch(`/pacientes/${id}`, { method: "DELETE" });
      // Recargar lista
      cargarPacientes();
    } catch (e: any) {
      window.alert(e?.message || "Error dando de baja al paciente");
    }
  }

  // Si quisieras reactivar (si agregás endpoint en backend):
  // async function reactivarPaciente(id: number) {
  //   try {
  //     await apiFetch(`/pacientes/${id}/reactivar`, { method: "POST" });
  //     cargarPacientes();
  //   } catch (e: any) {
  //     window.alert(e?.message || "Error reactivando al paciente");
  //   }
  // }

  const pacientesFiltrados = useMemo(() => pacientes, [pacientes]);

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
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              minWidth: 280,
            }}
          />

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={soloActivos}
              onChange={(e) => setSoloActivos(e.target.checked)}
            />
            <span style={{ fontWeight: 700, fontSize: 13 }}>Solo activos</span>
          </label>
        </div>

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

      {showSuccess && (
        <div
          style={{
            background: "#e8f7ee",
            color: "#0b6b2b",
            padding: 14,
            borderRadius: 10,
            marginBottom: 16,
            fontWeight: 800,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          ✅ Paciente actualizado correctamente
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
                <th style={{ padding: 10, width: 220 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/pacientes/${p.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ padding: 10 }}>
                    {p.apellido}, {p.nombre}
                  </td>
                  <td style={{ padding: 10 }}>{p.dni || "-"}</td>
                  <td style={{ padding: 10 }}>{p.telefono || "-"}</td>
                  <td style={{ padding: 10 }}>{p.obra_social || "-"}</td>
                  <td style={{ padding: 10 }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: p.activo ? "#e8f7ee" : "#fdecec",
                        color: p.activo ? "#0b6b2b" : "#9b1c1c",
                      }}
                    >
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td style={{ padding: 10 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/pacientes/${p.id}/editar`);
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: "1px solid #ddd",
                          background: "white",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Editar
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cambiarEstado(p.id, p.activo);
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: "none",
                          fontWeight: 700,
                          cursor: "pointer",
                          background: p.activo ? "#ef4444" : "#22c55e",
                          color: "white",
                        }}
                        title={p.activo ? "Dar de baja" : "Reactivar paciente"}
                      >
                        {p.activo ? "Baja" : "Reactivar"}
                      </button>

                      
                    </div>
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