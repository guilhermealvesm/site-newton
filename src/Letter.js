import React from "react";

function Letter({ letter }) {
  return (
    <span
      style={{
        margin: "0 -1px", // Ajuste o espaçamento entre as letras conforme necessário
        position: "relative",
        zIndex: 1,
      }}
    >
      {letter}
    </span>
  );
}

export default Letter;
