import { createFeatureSelector, createSelector } from '@ngrx/store';

import { CLAVE_LECTURA, EstadoLectura } from './lectura.reducer';

export const seleccionarEstadoLectura = createFeatureSelector<EstadoLectura>(CLAVE_LECTURA);

export const seleccionarLeyendoAhora = createSelector(
  seleccionarEstadoLectura,
  (estado) => estado.readingNow
);

export const seleccionarHayLectura = createSelector(
  seleccionarLeyendoAhora,
  (empleado) => empleado !== null
);

export const seleccionarHistorial = createSelector(
  seleccionarEstadoLectura,
  (estado) => estado.historial
);

export const seleccionarTotalHistorial = createSelector(
  seleccionarHistorial,
  (historial) => historial.length
);
