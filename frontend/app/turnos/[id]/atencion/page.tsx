"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Odontograma from "@/components/Odontograma";
import { useRouter } from "next/navigation";

type Tratamiento = {
  id: number;
  pieza_dental: string;
  precio: number;
  estado: string;
  tratamiento_id: number;
  tratamiento?: {
    nombre: string;
  };
};

export default function AtencionTurnoPage() {
  const params = useParams();
  const router = useRouter();
  const turnoId = params.id;

  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [pieza, setPieza] = useState("");
  const [tratamientoId, setTratamientoId] = useState("");
  const [precio, setPrecio] = useState("");
  const [turno, setTurno] = useState<any>(null);

  function seleccionarPieza(p: string, cara: string) {
    setPieza(`${p}-${cara}`);
  }

  async function cargarTurno() {
    const data = await apiFetch(`/turnos/${turnoId}`);
    setTurno(data);
  }

  async function cargarTratamientos() {
    const data = await apiFetch(`/tratamientos_realizados/turno/${turnoId}`);
    setTratamientos(data);
    return data; // ← IMPORTANTE
  }

  async function cargarCatalogo() {
    const data = await apiFetch(`/tratamientos_catalogo`);
    setCatalogo(data);
  }

  useEffect(() => {
    cargarTurno();
    cargarTratamientos();
    cargarCatalogo();
  }, []);

  async function agregarTratamiento() {
    try {

      if (!pieza || !tratamientoId || !precio) {
        alert("Complete todos los campos");
        return;
      }

      // obtener turno actualizado
      const turnoData = await apiFetch(`/turnos/${turnoId}`);

      await apiFetch("/tratamientos_realizados/lote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          turno_id: Number(turnoId),
          paciente_id: turnoData.paciente_id,
          odontologo_id: turnoData.odontologo_id,
          consultorio_id: turnoData.consultorio_id,
          tratamientos: [
            {
              tratamiento_id: Number(tratamientoId),
              pieza_dental: pieza,
              precio: Number(precio),
              descuento: 0,
              observaciones: ""
            }
          ]
        })
      });

      setPieza("");
      setTratamientoId("");
      setPrecio("");

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
  
    async function finalizarTratamiento(id: number) {
      try {
        // 1) Marcar tratamiento como realizado
        await apiFetch(`/tratamientos_realizados/${id}/estado?estado=realizado`, {
          method: "PUT",
        });

        // 2) Recargar tratamientos y obtener la lista actualizada
        const lista = await cargarTratamientos();

        // 3) Verificar si todos están realizados
        const todosFinalizados =
          Array.isArray(lista) &&
          lista.length > 0 &&
          lista.every((t: any) => String(t.estado).trim().toLowerCase() === "realizado");

        // 4) Si todos finalizados → cerrar turno
        if (todosFinalizados) {
          await apiFetch(`/turnos/${Number(turnoId)}/estado?nuevo_estado=atendido`, {
            method: "PUT",
          });
        }
      } catch (e) {
        console.error("Error finalizando tratamiento:", e);
      }
    }

    async function volverAgenda() {
      try {
        const id = Number(turnoId);

        // 1) Traer SIEMPRE los tratamientos actualizados desde backend
        const tratamientosActualizados = await apiFetch(`/turnos/${id}/tratamientos`);

        const todosFinalizados =
          Array.isArray(tratamientosActualizados) &&
          tratamientosActualizados.length > 0 &&
          tratamientosActualizados.every(
            (t: any) => String(t.estado).trim().toLowerCase() === "realizado"
          );

        // 2) Si todos están finalizados, cerrar el turno
        if (todosFinalizados) {
          await apiFetch(`/turnos/${id}/estado?nuevo_estado=atendido`, {
            method: "PUT",
          });
        }

        // 3) Ir a agenda forzando recarga real
        window.location.href = "/agenda";
      } catch (error) {
        console.error("Error al volver a agenda:", error);
        window.location.href = "/agenda";
      }
    }
    
    return (
    <div style={{ padding: 30 }}>
      
      <button
        type="button"
        onClick={volverAgenda}
        style={{
          marginBottom: 20,
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "#f5f5f5",
          cursor: "pointer"
        }}
      >
        ← Volver
      </button>

      <h1>Atención del Turno</h1>

      <h2>Tratamientos</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 20,
          border: "1px solid #ddd"
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Pieza</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Tratamiento</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Precio</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Estado</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Acción</th>
          </tr>
        </thead>

        <tbody>
          {tratamientos.map((t) => (
            <tr key={t.id}>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                {t.pieza_dental}
              </td>

              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                {t.tratamiento?.nombre || catalogo.find(c => c.id === t.tratamiento_id)?.nombre}
              </td>

              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                ${t.precio}
              </td>

              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                {t.estado}
              </td>

              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                {t.estado !== "realizado" && (
                  <button
                    onClick={() => finalizarTratamiento(t.id)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid #0b6b2b",
                      background: "#e8f7ee",
                      cursor: "pointer"
                    }}
                  >
                    Finalizar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        </table>

     
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 25,
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 8,
                background: "#fafafa",
                width: "fit-content"
              }}
            >

              <input
                placeholder="pieza"
                value={pieza}
                readOnly
                style={{
                  padding: 8,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  width: 120
                }}
              />

              <select
                value={tratamientoId}
                onChange={(e) => setTratamientoId(e.target.value)}
                style={{
                  padding: 8,
                  border: "1px solid #ccc",
                  borderRadius: 6
                }}
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
                style={{
                  padding: 8,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  width: 120
                }}
              />

              <button
                onClick={agregarTratamiento}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0b6b2b",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Agregar
              </button>

            </div>

      <Odontograma
        onSelect={seleccionarPieza}
        estados={estadosPiezas}
      />
      
      

    </div>
  );
}