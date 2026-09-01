const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const { empleados: semilla } = require('./empleados');

const RUTA_BD = path.join(__dirname, '..', 'empleados.db');

function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const db = new DatabaseSync(RUTA_BD);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS empleados (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    cargo      TEXT,
    area       TEXT,
    cedula     INTEGER NOT NULL UNIQUE,
    edad       INTEGER NOT NULL,
    sexo       TEXT    NOT NULL,
    telefono   TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    name_norm  TEXT    NOT NULL,
    cargo_norm TEXT,
    area_norm  TEXT,
    sexo_norm  TEXT    NOT NULL
  )
`);

db.exec('CREATE INDEX IF NOT EXISTS idx_empleados_name_norm ON empleados(name_norm)');
db.exec('CREATE INDEX IF NOT EXISTS idx_empleados_edad ON empleados(edad)');

function sembrarSiEstaVacia() {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM empleados').get();

  if (total > 0) {
    return { sembrada: false, total };
  }

  const insertar = db.prepare(`
    INSERT INTO empleados
      (id, name, cargo, area, cedula, edad, sexo, telefono, email, name_norm, cargo_norm, area_norm, sexo_norm)
    VALUES
      (?,  ?,    ?,     ?,    ?,      ?,    ?,    ?,        ?,     ?,         ?,          ?,         ?)
  `);

  for (const e of semilla) {
    insertar.run(
      e.id,
      e.name,
      e.cargo ?? null,
      e.area ?? null,
      e.cedula,
      e.edad,
      e.sexo,
      e.telefono,
      e.email,
      normalizar(e.name),
      normalizar(e.cargo),
      normalizar(e.area),
      normalizar(e.sexo)
    );
  }

  return { sembrada: true, total: semilla.length };
}

module.exports = { db, normalizar, sembrarSiEstaVacia, RUTA_BD };
