"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

function esEmailValido(v: string) {
  const s = (v || "").trim();
  if (!s) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

type FormState = {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  obra_social: string;
  numero_afiliado: string;
};

const styles = {
  page: { padding: 24, fontFamily: "sans-serif" as const },
  headerRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" as const },
  backBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontWeight: 700,
  },
  card: { background: "white", padding: 16, borderRadius: 12, maxWidth: 860 },
  form: { display: "grid", gap: 14 },
  grid2: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "1fr",
  } as React.CSSProperties,
  label: { fontSize: 12, fontWeight: 800, color: "#444", marginBottom: 6 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
    background: "white",
    fontSize: 14,
  } as React.CSSProperties,
  hint: { fontSize: 12, color: "#666", marginTop: 6 },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" as const, marginTop: 6 },
  primaryBtn: {
    padding: 10,
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
    border: "1px solid #111",
    background: "#111",
    color: "white",
  } as React.CSSProperties,
  secondaryBtn: {
    padding: 10,
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
    background: "white",
    border: "1px solid #ddd",
  } as React.CSSProperties,
};

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={styles.input}
      />
    </div>
  );
}

export default function EditarPacientePage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");

  const [form, setForm] = useState<FormState>({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    obra_social: "",
    numero_afiliado: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function cargarPaciente() {
    setLoading(true);
    setError("");
    try {
      const p = await apiFetch(`/pacientes/${id}`);
      setForm({
        nombre: p?.nombre ?? "",
        apellido: p?.apellido ?? "",
        dni: p?.dni ?? "",
        telefono: p?.telefono ?? "",
        email: p?.email ?? "",
        obra_social: p?.obra_social ?? "",
        numero_afiliado: p?.numero_afiliado ?? "",
      });
    } catch (e: any) {
      setError(e?.message || "Error cargando paciente");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    cargarPaciente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      await apiFetch(`/pacientes/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, email }),
      });

      // ✅ Volver al listado (y se recarga solo)
      router.replace("/pacientes");
    } catch (e: any) {
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

      setError(msg || "Error actualizando paciente");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <button onClick={() => router.back()} style={styles.backBtn}>
          ← Volver
        </button>

        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Editar paciente</div>
          <div style={{ fontSize: 12, color: "#666" }}>ID #{id}</div>
        </div>
      </div>

      <div style={styles.card}>
        {error && (
          <div
            style={{
              background: "#ffecec",
              color: "#b00020",
              padding: 12,
              borderRadius: 10,
              marginBottom: 14,
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div
            style={{
              ...styles.grid2,
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <Field label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Juan" />
            <Field label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} placeholder="Ej: Pérez" />
          </div>

          <div
            style={{
              ...styles.grid2,
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <Field label="DNI" name="dni" value={form.dni} onChange={handleChange} placeholder="Ej: 30123456" />
            <Field label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Ej: 3794..." />
          </div>

          <Field
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="nombre@dominio.com"
            autoComplete="email"
          />
          <div style={styles.hint}>El email es opcional.</div>

          <div
            style={{
              ...styles.grid2,
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <Field label="Obra social" name="obra_social" value={form.obra_social} onChange={handleChange} placeholder="Ej: OSDE" />
            <Field label="Nº afiliado" name="numero_afiliado" value={form.numero_afiliado} onChange={handleChange} placeholder="Ej: 123456" />
          </div>

          <div style={styles.actions}>
            <button type="submit" disabled={saving} style={{ ...styles.primaryBtn, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            <button type="button" onClick={() => router.replace("/pacientes")} style={styles.secondaryBtn}>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Responsive simple: 2 columnas -> 1 columna */}
      <style jsx>{`
        @media (max-width: 720px) {
          form :global(div[style*="grid-template-columns: 1fr 1fr"]) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}