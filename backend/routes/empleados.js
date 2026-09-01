const express = require('express');

const repositorio = require('./../data/repositorio-empleados');

const router = express.Router();

const SEXOS = ['Masculino', 'Femenino'];

const EDAD_MINIMA = 18;
const EDAD_MAXIMA = 99;

const TELEFONO_MAX_DIGITOS = 10;
const TELEFONO_MIN_DIGITOS = 7;

function errorHttp(estado, mensaje) {
  const error = new Error(mensaje);
  error.estado = estado;

  return error;
}

function leerTexto(query, clave) {
  const valor = query[clave];

  if (typeof valor !== 'string' || valor.trim() === '') {
    return undefined;
  }

  return valor.trim();
}

function leerEdad(query, clave) {
  const valor = leerTexto(query, clave);

  if (valor === undefined) {
    return undefined;
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero < 0) {
    throw errorHttp(400, `El parametro "${clave}" debe ser un numero positivo. Se recibio: "${valor}".`);
  }

  return numero;
}

function construirFiltros(query) {
  const filtros = {};

  for (const clave of ['nombre', 'cargo', 'area', 'q', 'sexo']) {
    const valor = leerTexto(query, clave);

    if (valor !== undefined) {
      filtros[clave] = valor;
    }
  }

  const edadMin = leerEdad(query, 'edadMin');

  if (edadMin !== undefined) {
    filtros.edadMin = edadMin;
  }

  const edadMax = leerEdad(query, 'edadMax');

  if (edadMax !== undefined) {
    filtros.edadMax = edadMax;
  }

  return filtros;
}

function digitosDe(texto) {
  return String(texto ?? '').replace(/\D/g, '');
}

function validarEmpleado(cuerpo, parcial) {
  const errores = [];
  const datos = {};
  const c = cuerpo && typeof cuerpo === 'object' ? cuerpo : {};

  const presente = (campo) => c[campo] !== undefined && c[campo] !== null && String(c[campo]).trim() !== '';

  if (presente('name')) {
    const name = String(c.name).trim().replace(/\s+/g, ' ');

    if (name.length < 2) {
      errores.push('El nombre debe tener al menos 2 caracteres.');
    } else {
      datos.name = name;
    }
  } else if (!parcial) {
    errores.push('El nombre es obligatorio.');
  }

  for (const campo of ['cargo', 'area']) {
    if (presente(campo)) {
      datos[campo] = String(c[campo]).trim();
    }
  }

  if (presente('cedula')) {
    const cedula = Number(c.cedula);

    if (!Number.isInteger(cedula) || cedula <= 0) {
      errores.push('La cedula debe ser un numero entero positivo.');
    } else {
      datos.cedula = cedula;
    }
  } else if (!parcial) {
    errores.push('La cedula es obligatoria.');
  }

  if (presente('edad')) {
    const edad = Number(c.edad);

    if (!Number.isInteger(edad) || edad < EDAD_MINIMA || edad > EDAD_MAXIMA) {
      errores.push(`La edad debe ser un entero entre ${EDAD_MINIMA} y ${EDAD_MAXIMA}.`);
    } else {
      datos.edad = edad;
    }
  } else if (!parcial) {
    errores.push('La edad es obligatoria.');
  }

  if (presente('sexo')) {
    const sexo = SEXOS.find((opcion) => opcion.toLowerCase() === String(c.sexo).trim().toLowerCase());

    if (!sexo) {
      errores.push(`El sexo debe ser uno de: ${SEXOS.join(', ')}.`);
    } else {
      datos.sexo = sexo;
    }
  } else if (!parcial) {
    errores.push('El sexo es obligatorio.');
  }

  if (presente('telefono')) {
    const telefono = String(c.telefono).trim();
    const digitos = digitosDe(telefono);

    if (digitos.length < TELEFONO_MIN_DIGITOS || digitos.length > TELEFONO_MAX_DIGITOS) {
      errores.push(
        `El telefono debe tener entre ${TELEFONO_MIN_DIGITOS} y ${TELEFONO_MAX_DIGITOS} digitos. Se recibieron ${digitos.length}.`
      );
    } else {
      datos.telefono = telefono;
    }
  } else if (!parcial) {
    errores.push('El telefono es obligatorio.');
  }

  if (presente('email')) {
    const email = String(c.email).trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errores.push('El correo no tiene un formato valido.');
    } else {
      datos.email = email;
    }
  } else if (!parcial) {
    errores.push('El correo es obligatorio.');
  }

  return { datos, errores };
}

router.get('/', (req, res, next) => {
  try {
    const filtros = construirFiltros(req.query);
    const datos = repositorio.listar(filtros);

    res.json({ total: datos.length, filtros, datos });
  } catch (error) {
    next(error);
  }
});

router.post('/', (req, res, next) => {
  try {
    const { datos, errores } = validarEmpleado(req.body, false);

    if (errores.length > 0) {
      return res.status(400).json({ error: errores[0], errores });
    }

    if (repositorio.existeCedula(datos.cedula)) {
      return res.status(409).json({ error: `Ya existe un empleado con la cedula ${datos.cedula}.` });
    }

    const creado = repositorio.crear(datos);

    res.status(201).json(creado);
  } catch (error) {
    next(error);
  }
});

function leerId(req) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw errorHttp(400, `El id debe ser un numero entero positivo. Se recibio: "${req.params.id}".`);
  }

  return id;
}

router.get('/:id', (req, res, next) => {
  try {
    const id = leerId(req);
    const empleado = repositorio.obtener(id);

    if (!empleado) {
      throw errorHttp(404, `No existe un empleado con id ${id}.`);
    }

    res.json(empleado);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', (req, res, next) => {
  try {
    const id = leerId(req);

    if (!repositorio.obtener(id)) {
      throw errorHttp(404, `No existe un empleado con id ${id}.`);
    }

    const { datos, errores } = validarEmpleado(req.body, true);

    if (errores.length > 0) {
      return res.status(400).json({ error: errores[0], errores });
    }

    if (Object.keys(datos).length === 0) {
      throw errorHttp(400, 'No se envio ningun campo para actualizar.');
    }

    if (datos.cedula !== undefined && repositorio.existeCedula(datos.cedula, id)) {
      return res.status(409).json({ error: `Ya existe otro empleado con la cedula ${datos.cedula}.` });
    }

    res.json(repositorio.actualizar(id, datos));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
