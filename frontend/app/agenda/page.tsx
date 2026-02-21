"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ===== Interfaces ===== */

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
}

interface Turno {
  id: number;
  fecha: string;
  hora: string;
  duracion_minutos: number;
  paciente: Paciente;
  odontologo_id: number;
  consultorio_id: number;
}

/* ===== Componente ===== */

export default function AgendaPage() {
  const router = useRouter();

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mostrarForm, setMostrarForm] = useState(false);
  const [hora, setHora] = useState("");
  const [pacienteId, setPacienteId] = useState("");

  /* ===== Seguridad + carga inicial ===== */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    cargarAgenda();
    cargarPacientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  /* ===== API Calls ===== */

  const cargarAgenda = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/agenda/diaria?fecha=${fecha}&odontologo_id=1&consultorio_id=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error al cargar la agenda");
      }

      const data = await res.json();
      setTurnos(data);
    } catch {
      setError("No se pudo cargar la agenda");
    } finally {
      setLoading(false);
    }
  };

  const cargarPacientes = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8000/pacientes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setPacientes(data);
  };

  const crearTurno = async () => {
    const token = localStorage.getItem("token");

    await fetch("http://localhost:8000/turnos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fecha,
        hora,
        duracion_minutos: 30,
        paciente_id: Number(pacienteId),
        odontologo_id: 1,
        consultorio_id: 1,
      }),
    });

    setMostrarForm(false);
    setHora("");
    setPacienteId("");
    cargarAgenda();
  };

  /* ===== Render ===== */

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Agenda diaria</h1>

      {/* Selector de fecha */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Botón nuevo turno */}
      <button
        onClick={() => setMostrarForm(!mostrarForm)}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        Nuevo turno
      </button>

      {/* Formulario nuevo turno */}
      {mostrarForm && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-bold mb-3">Nuevo turno</h2>

          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="border p-2 mr-2"
            required
          />

          <select
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
            className="border p-2 mr-2"
            required
          >
            <option value="">Paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.apellido}, {p.nombre}
              </option>
            ))}
          </select>

          <button
            onClick={crearTurno}
            className="bg-blue-700 text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
        </div>
      )}

      {/* Estados */}
      {loading && <p>Cargando agenda...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && turnos.length === 0 && (
        <p className="text-gray-500">No hay turnos para este día</p>
      )}

      {/* Tabla agenda */}
      {turnos.length > 0 && (
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="p-3 text-left">Hora</th>
              <th className="p-3 text-left">Paciente</th>
              <th className="p-3 text-left">Duración</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((turno) => (
              <tr key={turno.id} className="border-b">
                <td className="p-3">
                  {turno.hora.slice(0, 5)}
                </td>
                <td className="p-3">
                  {turno.paciente.apellido}, {turno.paciente.nombre}
                </td>
                <td className="p-3">
                  {turno.duracion_minutos} min
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
