"use client";

type Props = {
  onSelect: (pieza: string, cara: string) => void;
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
    case "realizado":
      return "#c8e6c9";
    case "en_proceso":
      return "#ffcc80";
    default:
      return "#ffffff";
  }
}

function Diente({ pieza, onSelect, estados }: any) {
  return (
    <svg width="60" height="70" viewBox="0 0 100 110">

      {/* Vestibular */}
      <rect
        x="35"
        y="0"
        width="30"
        height="30"
        fill={colorEstado(estados[`${pieza}-vestibular`])}
        stroke="#333"
        onClick={() => onSelect(pieza, "vestibular")}
      />

      {/* Mesial */}
      <rect
        x="0"
        y="35"
        width="30"
        height="30"
        fill={colorEstado(estados[`${pieza}-mesial`])}
        stroke="#333"
        onClick={() => onSelect(pieza, "mesial")}
      />

      {/* Oclusal */}
      <rect
        x="35"
        y="35"
        width="30"
        height="30"
        fill={colorEstado(estados[`${pieza}-oclusal`])}
        stroke="#333"
        onClick={() => onSelect(pieza, "oclusal")}
      />

      {/* Distal */}
      <rect
        x="70"
        y="35"
        width="30"
        height="30"
        fill={colorEstado(estados[`${pieza}-distal`])}
        stroke="#333"
        onClick={() => onSelect(pieza, "distal")}
      />

      {/* Lingual */}
      <rect
        x="35"
        y="70"
        width="30"
        height="30"
        fill={colorEstado(estados[`${pieza}-lingual`])}
        stroke="#333"
        onClick={() => onSelect(pieza, "lingual")}
      />

      {/* Número de pieza */}
      <text
        x="50"
        y="108"
        fontSize="14"
        textAnchor="middle"
        fill="#000"
        fontWeight="bold"
      >
        {pieza}
      </text>

    </svg>
  );
}

export default function Odontograma({ onSelect, estados = {} }: Props) {
  return (
    <div style={{ marginBottom: 30 }}>

      <h2 style={{ marginBottom: 10 }}>Odontograma</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 70px)",
          gap: 12,
          justifyContent: "start",
          alignItems: "center"
        }}
      >
        {piezas.map((p) => (
          <Diente
            key={p}
            pieza={p}
            estados={estados}
            onSelect={onSelect}
          />
        ))}
      </div>

    </div>
  );
}