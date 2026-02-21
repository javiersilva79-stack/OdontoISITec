"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type Paciente = { id: number; nombre: string; apellido: string };
type Usuario = { id: number; nombre: string; email: string; rol: string };
type Consultorio = { id: number; nombre: string };

type Turno = {
  id: number;
  consultorio_id: number;
  paciente_id: number;
  odontologo_id: number;
  fecha: string;
  hora_inicio: string;
  duracion_min: number;
  estado: string;
};

function hoyISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AgendaPage() {
  const [fecha, setFecha] = useState(hoyISO());
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [odontologos, setOdontologos] = useState<Usuario[]>([]);
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form nuevo turno
  const [consultorioId, setConsultorioId] = useState<number | "">("");
  const [pacienteId, setPacienteId] = useState<number | "">("");
  const [odontologoId, setOdontologoId] = useState<number | "">("");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [duracion, setDuracion] = useState(30);
  const [saving, setSaving] = useState(false);

  const pacientesMap = useMemo(() => {
    const m = new Map<number, string>();
    pacientes.forEach((p) => m.set(p.id, `${p.apellido}, ${p.nombre}`));
    return m;
  }, [pacientes]);

  const odontologosMap = useMemo(() => {
    const m = new Map<number, string>();
    odontologos.forEach((u) => m.set(u.id, u.nombre));
    return m;
  }, [odontologos]);

  const consultoriosMap = useMemo(() => {
    const m = new Map<number, string>();
    consultorios.forEach((c) => m.set(c.id, c.nombre));
    return m;
  }, [consultorios]);

  async function cargarTodo() {
    setError("");
    setLoading(true);
    try {
      const [t, p, u, c] = await Promise.all([
        apiFetch(`/agenda/?fecha=${fecha}`),
        apiFetch("/pacientes/"),
        apiFetch("/usuarios/"),
        apiFetch("/consultorios/"),
      ]);

      setTurnos(Array.isArray(t) ? t : []);
      setPacientes(Array.isArray(p) ? p : []);
      const od = Array.isArray(u)
        ? u.filter((x: any) => x.rol === "odontologo" || x.rol === "admin")
        : [];
      setOdontologos(od);
      setConsultorios(Array.isArray(c) ? c : []);

      if (consultorioId === "" && Array.isArray(c) && c[0]?.id)
        setConsultorioId(c[0].id);
      if (odontologoId === "" && Array.isArray(od) && od[0]?.id)
        setOdontologoId(od[0].id);
      if (pacienteId === "" && Array.isArray(p) && p[0]?.id)
        setPacienteId(p[0].id);
    } catch (e: any) {
      setError(e?.message || "Error cargando agenda");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  async function crearTurno(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!consultorioId || !pacienteId || !odontologoId) {
      setError("Falta seleccionar consultorio, paciente u odontólogo.");
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/turnos/", {
        method: "POST",
        body: JSON.stringify({
          consultorio_id: consultorioId,
          paciente_id: pacienteId,
          odontologo_id: odontologoId,
          fecha,
          hora_inicio: `${horaInicio}:00`,
          duracion_min: duracion,
          estado: "reservado",
        }),
      });

      await cargarTodo();
    } catch (e: any) {
      setError(e?.message || "Error creando turno");
    } finally {
      setSaving(false);
    }
  }

  // 👉 NUEVO: cambiar estado del turno
  async function cambiarEstado(id: number, nuevo_estado: string) {
    try {
      await apiFetch(`/turnos/${id}/estado?nuevo_estado=${nuevo_estado}`, {
        method: "PUT",
      });
      await cargarTodo();
    } catch (e: any) {
      setError(e?.message || "Error cambiando estado");
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
        Agenda
      </h1>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <label style={{ fontWeight: 700 }}>Fecha:</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <button
          onClick={cargarTodo}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
          }}
        >
          Recargar
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

      {/* Lista turnos */}
      <div style={{ background: "white", padding: 16, borderRadius: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
          Turnos del día
        </h2>

        {loading ? (
          <div>Cargando...</div>
        ) : turnos.length === 0 ? (
          <div>No hay turnos para esta fecha.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: 10 }}>Hora</th>
                <th style={{ padding: 10 }}>Paciente</th>
                <th style={{ padding: 10 }}>Odontólogo</th>
                <th style={{ padding: 10 }}>Consultorio</th>
                <th style={{ padding: 10 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: 10 }}>
                    {t.hora_inicio.slice(0, 5)}
                  </td>
                  <td style={{ padding: 10 }}>
                    {pacientesMap.get(t.paciente_id)}
                  </td>
                  <td style={{ padding: 10 }}>
                    {odontologosMap.get(t.odontologo_id)}
                  </td>
                  <td style={{ padding: 10 }}>
                    {consultoriosMap.get(t.consultorio_id)}
                  </td>
                  <td style={{ padding: 10 }}>
                    <select
                      value={t.estado}
                      onChange={(e) =>
                        cambiarEstado(t.id, e.target.value)
                      }
                    >
                      <option value="reservado">Reservado</option>
                      <option value="atendido">Atendido</option>
                      <option value="cancelado">Cancelado</option>
                      <option value="ausente">Ausente</option>
                    </select>
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