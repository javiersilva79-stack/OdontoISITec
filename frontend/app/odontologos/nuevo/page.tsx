"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function NuevoOdontologo() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    matricula: "",
    especialidad: "",
    consultorio_id: 1,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await apiFetch("/odontologos", {
        method: "POST",
        body: JSON.stringify(form),
      });

      router.replace("/odontologos");
    } catch (e: any) {
      setError("Error creando odontólogo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>
        Nuevo Odontólogo
      </h1>

      {error && (
        <div style={{ background: "#ffecec", padding: 10, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: 500, display: "grid", gap: 16 }}>
        <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input name="apellido" placeholder="Apellido" onChange={handleChange} required />
        <input name="matricula" placeholder="Matrícula" onChange={handleChange} />
        <input name="especialidad" placeholder="Especialidad" onChange={handleChange} />

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
          {saving ? "Guardando..." : "Crear"}
        </button>
      </form>
    </div>
  );
}