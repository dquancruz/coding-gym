// Punto de entrada real: importa la app ya configurada y la pone a escuchar.
// Este archivo NO se toca en los tests.

import app from "./app";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
