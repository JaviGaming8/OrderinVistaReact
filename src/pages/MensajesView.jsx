import React, { useEffect, useState } from "react";

function MensajesView({ darkMode }) {
  const [ultimoMensaje, setUltimoMensaje] = useState(null);

  useEffect(() => {
    // Simulación de recepción de mensaje
    const interval = setInterval(() => {
      const nuevoMensaje = {
        id: Date.now(),
        texto: `[QUEUE] Mensaje recibido → ${new Date().toLocaleTimeString()}`,
      };
      setUltimoMensaje(nuevoMensaje); // ⚡ Reemplaza el mensaje anterior
    }, 5000); // Cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`mensajes-container ${darkMode ? "dark" : ""}`}>
      <h2 className="mensajes-titulo">📩 Mensaje Recibido</h2>

      <div className="mensajes-lista">
        {ultimoMensaje ? (
          <div key={ultimoMensaje.id} className="mensaje-item">
            {ultimoMensaje.texto}
          </div>
        ) : (
          <p className="mensajes-vacio">Sin mensajes aún...</p>
        )}
      </div>
    </div>
  );
}

export default MensajesView;
