const express = require('express');
const cors = require('cors');

const { sembrarSiEstaVacia, RUTA_BD } = require('./data/db');
const repositorio = require('./data/repositorio-empleados');
const empleadosRouter = require('./routes/empleados');

const PORT = 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/salud', (_req, res) => {
  res.json({
    estado: 'ok',
    servicio: 'MiAppev1 API',
    puerto: PORT,
    baseDeDatos: 'SQLite',
    empleados: repositorio.contar(),
  });
});

app.use('/api/empleados', empleadosRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  const estado = error.estado || 500;

  if (estado === 500) {
    console.error(error);
  }

  res.status(estado).json({ error: error.message || 'Error interno del servidor' });
});

const siembra = sembrarSiEstaVacia();

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
  console.log(`Base SQLite: ${RUTA_BD}`);
  console.log(
    siembra.sembrada
      ? `Base recien creada, sembrada con ${siembra.total} empleados.`
      : `Base existente con ${siembra.total} empleados.`
  );
  console.log(`Empleados:  http://localhost:${PORT}/api/empleados`);
  console.log(`Filtrado:   http://localhost:${PORT}/api/empleados?area=proyectos&edadMin=30`);
});
