"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function EditarOdontologo() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    matricula: "",
    especialidad: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function cargarOdontologo() {
    try {
      const data = await apiFetch(`/odontologos/${id}`);
      setForm({
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        matricula: data.matricula || "",
        especialidad: data.especialidad || "",
      });
    } catch {
      setError("Error cargando odontólogo");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await apiFetch(`/odontologos/${id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      router.replace("/odontologos");
    } catch {
      setError("Error actualizando odontólogo");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (id) cargarOdontologo();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>
        Editar Odontólogo
      </h1>

      {error && (
        <div style={{ background: "#ffecec", padding: 10, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: 500, display: "grid", gap: 16 }}>
        <input name="nombre" value={form.nombre} onChange={handleChange} required />
        <input name="apellido" value={form.apellido} onChange={handleChange} required />
        <input name="matricula" value={form.matricula} onChange={handleChange} />
        <input name="especialidad" value={form.especialidad} onChange={handleChange} />

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}