"use client";

type Props = {
  onSelect: (pieza: string) => void;
  estados?: Record<string, string>;
};

const piezas = [
  "18","17","16","15","14","13","12","11",
  "21","22","23","24","25","26","27","28",
  "48","47","46","45","44","43","42","41",
  "31","32","33","34","35","36","37","38",
];

function colorEstado(estado?: string) {
  switch (estado) {
    case "pendiente":
      return "#ffe082";
    case "en_proceso":
      return "#ffcc80";
    case "realizado":
      return "#c8e6c9";
    default:
      return "#f9f9f9";
  }
}

export default function Odontograma({ onSelect, estados = {} }: Props) {
  return (
    <div style={{ marginBottom: 30 }}>
      <h2>Odontograma</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 40px)",
          gap: 8,
        }}
      >
        {piezas.map((p) => (
          <div
            key={p}
            onClick={() => onSelect(p)}
            style={{
              width: 40,
              height: 40,
              border: "1px solid #999",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: colorEstado(estados[p]),
              fontWeight: 600,
            }}
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}