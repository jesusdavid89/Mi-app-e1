import { createAction, props } from '@ngrx/store';

import { Empleado } from '../empleado.service';

export const leerAhora = createAction(
  '[Favoritos] Leer ahora',
  props<{ empleado: Empleado }>()
);

export const dejarDeLeer = createAction('[Inicio] Dejar de leer');

export const quitarDelHistorial = createAction(
  '[Inicio] Quitar del historial',
  props<{ id: number }>()
);

export const limpiarHistorial = createAction('[Inicio] Limpiar historial');
