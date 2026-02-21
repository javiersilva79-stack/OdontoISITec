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
  fecha: string;        // "YYYY-MM-DD"
  hora_inicio: string;  // "HH:MM:SS"
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
        apiFetch(`/agenda?fecha=${fecha}`),
        apiFetch("/pacientes"),
        apiFetch("/usuarios"),
        apiFetch("/consultorios"),
      ]);

      setTurnos(Array.isArray(t) ? t : []);
      setPacientes(Array.isArray(p) ? p : []);
      const od = Array.isArray(u) ? u.filter((x: any) => x.rol === "odontologo" || x.rol === "admin") : [];
      setOdontologos(od);
      setConsultorios(Array.isArray(c) ? c : []);

      // defaults si están vacíos
      if (consultorioId === "" && Array.isArray(c) && c[0]?.id) setConsultorioId(c[0].id);
      if (odontologoId === "" && Array.isArray(od) && od[0]?.id) setOdontologoId(od[0].id);
      if (pacienteId === "" && Array.isArray(p) && p[0]?.id) setPacienteId(p[0].id);
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
      await apiFetch("/turnos", {
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

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Agenda</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <label style={{ fontWeight: 700 }}>Fecha:</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <button
          onClick={cargarTodo}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
        >
          Recargar
        </button>
      </div>

      {error && (
        <div style={{ background: "#ffecec", color: "#b00020", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Alta turno */}
      <form onSubmit={crearTurno} style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Nuevo turno</h2>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Consultorio</div>
            <select value={consultorioId} onChange={(e) => setConsultorioId(Number(e.target.value))}>
              {consultorios.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Paciente</div>
            <select value={pacienteId} onChange={(e) => setPacienteId(Number(e.target.value))}>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Odontólogo</div>
            <select value={odontologoId} onChange={(e) => setOdontologoId(Number(e.target.value))}>
              {odontologos.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Hora</div>
            <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Duración (min)</div>
            <input
              type="number"
              min={5}
              step={5}
              value={duracion}
              onChange={(e) => setDuracion(Number(e.target.value))}
              style={{ width: 90 }}
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
          {saving ? "Guardando..." : "Crear turno"}
        </button>
      </form>

      {/* Lista turnos */}
      <div style={{ background: "white", padding: 16, borderRadius: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Turnos del día</h2>

        {loading ? (
          <div>Cargando...</div>
        ) : turnos.length === 0 ? (
          <div>No hay turnos para esta fecha.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Hora</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Paciente</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Odontólogo</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Consultorio</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{t.hora_inicio.slice(0, 5)}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{pacientesMap.get(t.paciente_id) ?? `#${t.paciente_id}`}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{odontologosMap.get(t.odontologo_id) ?? `#${t.odontologo_id}`}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{consultoriosMap.get(t.consultorio_id) ?? `#${t.consultorio_id}`}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{t.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}