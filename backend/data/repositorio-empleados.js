const { db, normalizar } = require('./db');

const COLUMNAS = 'id, name, cargo, area, cedula, edad, sexo, telefono, email';

const CAMPOS_TEXTO = { nombre: 'name_norm', cargo: 'cargo_norm', area: 'area_norm' };

function aEmpleado(fila) {
  return fila ? { ...fila } : undefined;
}

function listar(filtros = {}) {
  const condiciones = [];
  const valores = [];

  for (const [clave, columna] of Object.entries(CAMPOS_TEXTO)) {
    if (filtros[clave] !== undefined) {
      condiciones.push(`${columna} LIKE ?`);
      valores.push(`%${normalizar(filtros[clave])}%`);
    }
  }

  if (filtros.q !== undefined) {
    const patron = `%${normalizar(filtros.q)}%`;

    condiciones.push('(name_norm LIKE ? OR cargo_norm LIKE ? OR area_norm LIKE ?)');
    valores.push(patron, patron, patron);
  }

  if (filtros.sexo !== undefined) {
    condiciones.push('sexo_norm = ?');
    valores.push(normalizar(filtros.sexo));
  }

  if (filtros.edadMin !== undefined) {
    condiciones.push('edad >= ?');
    valores.push(filtros.edadMin);
  }

  if (filtros.edadMax !== undefined) {
    condiciones.push('edad <= ?');
    valores.push(filtros.edadMax);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  return db
    .prepare(`SELECT ${COLUMNAS} FROM empleados ${where} ORDER BY id`)
    .all(...valores)
    .map(aEmpleado);
}

function obtener(id) {
  return aEmpleado(db.prepare(`SELECT ${COLUMNAS} FROM empleados WHERE id = ?`).get(id));
}

function existeCedula(cedula, idAIgnorar = null) {
  const fila =
    idAIgnorar === null
      ? db.prepare('SELECT id FROM empleados WHERE cedula = ?').get(cedula)
      : db.prepare('SELECT id FROM empleados WHERE cedula = ? AND id <> ?').get(cedula, idAIgnorar);

  return fila !== undefined;
}

function crear(datos) {
  const resultado = db
    .prepare(
      `INSERT INTO empleados
         (name, cargo, area, cedula, edad, sexo, telefono, email, name_norm, cargo_norm, area_norm, sexo_norm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      datos.name,
      datos.cargo ?? null,
      datos.area ?? null,
      datos.cedula,
      datos.edad,
      datos.sexo,
      datos.telefono,
      datos.email,
      normalizar(datos.name),
      normalizar(datos.cargo),
      normalizar(datos.area),
      normalizar(datos.sexo)
    );

  return obtener(Number(resultado.lastInsertRowid));
}

function actualizar(id, cambios) {
  const asignaciones = [];
  const valores = [];

  const conNormalizada = { name: 'name_norm', cargo: 'cargo_norm', area: 'area_norm', sexo: 'sexo_norm' };

  for (const campo of ['name', 'cargo', 'area', 'cedula', 'edad', 'sexo', 'telefono', 'email']) {
    if (cambios[campo] === undefined) {
      continue;
    }

    asignaciones.push(`${campo} = ?`);
    valores.push(cambios[campo]);

    if (conNormalizada[campo]) {
      asignaciones.push(`${conNormalizada[campo]} = ?`);
      valores.push(normalizar(cambios[campo]));
    }
  }

  if (asignaciones.length === 0) {
    return obtener(id);
  }

  db.prepare(`UPDATE empleados SET ${asignaciones.join(', ')} WHERE id = ?`).run(...valores, id);

  return obtener(id);
}

function contar() {
  return db.prepare('SELECT COUNT(*) AS total FROM empleados').get().total;
}

module.exports = { listar, obtener, crear, actualizar, existeCedula, contar };
