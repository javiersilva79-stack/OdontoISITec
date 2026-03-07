"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Odontograma from "@/components/Odontograma";

type Tratamiento = {
  id: number;
  pieza_dental: string;
  precio: number;
  estado: string;
  tratamiento: {
    nombre: string;
  };
};

export default function AtencionTurnoPage() {
  const params = useParams();
  const turnoId = params.id;

  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [pieza, setPieza] = useState("");
  const [tratamientoId, setTratamientoId] = useState("");
  const [precio, setPrecio] = useState("");

  function seleccionarPieza(p: string) {
    setPieza(p);
  }

  async function cargarTratamientos() {
    const data = await apiFetch(`/tratamientos_realizados?turno_id=${turnoId}`);
    setTratamientos(data);
  }

  async function cargarCatalogo() {
    const data = await apiFetch(`/tratamientos_catalogo`);
    setCatalogo(data);
  }

  useEffect(() => {
    cargarTratamientos();
    cargarCatalogo();
  }, []);

  async function agregarTratamiento() {
    try {
        if (!pieza || !tratamientoId || !precio) {
        alert("Complete todos los campos");
        return;
        }

        await apiFetch("/tratamientos_realizados/lote", {
        method: "POST",
        body: JSON.stringify({
            turno_id: Number(turnoId),
            tratamientos: [
            {
                tratamiento_id: Number(tratamientoId),
                pieza_dental: pieza,
                precio: Number(precio),
                descuento: 0,
                observaciones: ""
            }
            ]
        }),
        });

        // limpiar formulario
        setPieza("");
        setTratamientoId("");
        setPrecio("");

        // recargar tratamientos
        await cargarTratamientos();

    } catch (e) {
        console.error(e);
        alert("Error agregando tratamiento");
    }
    }
    const estadosPiezas: Record<string, string> = {};

    tratamientos.forEach((t) => {
        if (t.pieza_dental) {
            estadosPiezas[t.pieza_dental] = t.estado;
        }
    });
  return (
    <div style={{ padding: 30 }}>

      <h1>Atención del Turno</h1>

      <h2>Tratamientos</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Pieza</th>
            <th>Tratamiento</th>
            <th>Precio</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {tratamientos.map((t) => (
            <tr key={t.id}>
              <td>{t.pieza_dental}</td>
              <td>{t.tratamiento?.nombre}</td>
              <td>${t.precio}</td>
              <td>{t.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Odontograma
        onSelect={seleccionarPieza}
        estados={estadosPiezas}
      />

      <h2 style={{ marginTop: 30 }}>Agregar tratamiento</h2>

      <div style={{ display: "flex", gap: 10 }}>

        <input
          placeholder="pieza"
          value={pieza}
          onChange={(e) => setPieza(e.target.value)}
        />

        <select
          value={tratamientoId}
          onChange={(e) => setTratamientoId(e.target.value)}
        >
          <option value="">Tratamiento</option>

          {catalogo.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}

        </select>

        <input
          placeholder="precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <button onClick={agregarTratamiento}>
          Agregar
        </button>

      </div>

    </div>
  );
}