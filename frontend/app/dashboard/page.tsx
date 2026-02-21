"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Resumen = {
  citas_hoy: number;
  pacientes_total: number;
  tratamientos: number;
  pendientes_pago: number;
};

export default function Dashboard() {
  const [data, setData] = useState<Resumen>({
    citas_hoy: 0,
    pacientes_total: 0,
    tratamientos: 0,
    pendientes_pago: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function cargarResumen() {
    setError("");
    setLoading(true);
    try {
      const r = await apiFetch("/dashboard/resumen/");
      setData({
        citas_hoy: Number(r?.citas_hoy ?? 0),
        pacientes_total: Number(r?.pacientes_total ?? 0),
        tratamientos: Number(r?.tratamientos ?? 0),
        pendientes_pago: Number(r?.pendientes_pago ?? 0),
      });
    } catch (e: any) {
      setError(e?.message || "Error cargando dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarResumen();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Dashboard</h2>

        <button
          onClick={cargarResumen}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Recargar
        </button>
      </div>

      {error && (
        <div style={{ background: "#ffecec", color: "#b00020", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm">Citas Hoy</h3>
          <p className="text-3xl font-bold mt-2">
            {loading ? "..." : data.citas_hoy}
          </p>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm">Pacientes</h3>
          <p className="text-3xl font-bold mt-2">
            {loading ? "..." : data.pacientes_total}
          </p>
        </div>

        <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm">Tratamientos</h3>
          <p className="text-3xl font-bold mt-2">
            {loading ? "..." : data.tratamientos}
          </p>
        </div>

        <div className="bg-purple-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm">Pendientes de Pago</h3>
          <p className="text-3xl font-bold mt-2">
            {loading ? "..." : data.pendientes_pago}
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Agenda de Hoy</h3>
          <div className="text-sm text-gray-600">
            {loading ? (
              <div>Cargando...</div>
            ) : (
              <div>
                Hoy tenés <b>{data.citas_hoy}</b> turno(s) cargado(s).
                <div className="mt-2 text-gray-500">
                  (La lista detallada la ves en la pantalla <b>Agenda</b>)
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Estadísticas</h3>
          <div className="h-40 flex items-center justify-center text-gray-400">
            Gráfico próximamente
          </div>
        </div>
      </div>
    </div>
  );
}