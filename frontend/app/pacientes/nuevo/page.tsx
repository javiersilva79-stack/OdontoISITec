"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

function esEmailValido(v: string) {
  const s = (v || "").trim();
  if (!s) return true; // email opcional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
export default function NuevoPacientePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    obra_social: "",
    numero_afiliado: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const email = form.email.trim();

    if (!esEmailValido(email)) {
        setError("Email inválido (ej: nombre@dominio.com)");
        setSaving(false);
        return;
    }

    try {
      await apiFetch("/pacientes/", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          activo: true,
          consultorio_id: 1, // ⚠️ temporal
        }),
      });

      router.push("/pacientes");
    } catch (e: any) {
        console.log("ERROR COMPLETO:", e);

        const msg =
            typeof e === "string"
            ? e
            : e?.detail
            ? Array.isArray(e.detail)
                ? e.detail
                    .map((x: any) => x?.msg || x?.message || JSON.stringify(x))
                    .join(" | ")
                : typeof e.detail === "object"
                ? JSON.stringify(e.detail)
                : String(e.detail)
            : e?.message
            ? String(e.message)
            : JSON.stringify(e);

        setError(msg || "Error creando paciente");
    } finally {
        setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>
        Nuevo Paciente
      </h1>

      {error && (
        <div style={{ color: "red", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: 16,
          maxWidth: 500,
        }}
      >
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />

        <input
          name="apellido"
          placeholder="Apellido"
          value={form.apellido}
          onChange={handleChange}
          required
        />

        <input
          name="dni"
          placeholder="DNI"
          value={form.dni}
          onChange={handleChange}
        />

        <input
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
        />

        <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
        />

        <input
          name="obra_social"
          placeholder="Obra social"
          value={form.obra_social}
          onChange={handleChange}
        />

        <input
          name="numero_afiliado"
          placeholder="Número afiliado"
          value={form.numero_afiliado}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: 10,
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {saving ? "Guardando..." : "Crear paciente"}
        </button>
      </form>
    </div>
  );
}