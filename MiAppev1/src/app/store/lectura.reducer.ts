import { createReducer, on } from '@ngrx/store';

import { Empleado } from '../empleado.service';
import { dejarDeLeer, leerAhora, limpiarHistorial, quitarDelHistorial } from './lectura.actions';

export const CLAVE_LECTURA = 'lectura';

export interface EstadoLectura {
  readingNow: Empleado | null;
  historial: Empleado[];
}

export const estadoInicial: EstadoLectura = {
  readingNow: null,
  historial: [],
};

export const lecturaReducer = createReducer(
  estadoInicial,

  on(leerAhora, (estado, { empleado }) => ({
    ...estado,
    readingNow: empleado,
    historial: [empleado, ...estado.historial.filter((leido) => leido.id !== empleado.id)],
  })),

  on(dejarDeLeer, (estado) => ({ ...estado, readingNow: null })),

  on(quitarDelHistorial, (estado, { id }) => ({
    ...estado,
    readingNow: estado.readingNow && estado.readingNow.id === id ? null : estado.readingNow,
    historial: estado.historial.filter((leido) => leido.id !== id),
  })),

  on(limpiarHistorial, (estado) => ({ ...estado, readingNow: null, historial: [] }))
);
