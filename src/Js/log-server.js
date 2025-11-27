import express from "express";
import { exec } from "child_process";

const app = express();
const PORT = 4000;

// Endpoint que lee los últimos logs del contenedor ClientConsumerOrder
app.get("/logs", (req, res) => {
  // Cambia "naughty_meitner" por el nombre real de tu contenedor si cambia
  exec("docker logs naughty_meitner --tail 50", (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr });
    }
    // Divide por línea y filtra vacías
    const lines = stdout.split("\n").filter(line => line.trim() !== "");
    res.json(lines);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor de logs corriendo en http://localhost:${PORT}`);
});
