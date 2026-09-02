import { Empleado } from '../empleado.service';
import { dejarDeLeer, leerAhora, limpiarHistorial, quitarDelHistorial } from './lectura.actions';
import { EstadoLectura, estadoInicial, lecturaReducer } from './lectura.reducer';

function crearEmpleado(id: number, name: string): Empleado {
  return {
    id,
    name,
    cargo: 'Analista',
    area: 'proyectos',
    cedula: 1000 + id,
    edad: 30,
    sexo: 'Masculino',
    telefono: '3001234567',
    email: `empleado${id}@ejemplo.com`,
  };
}

const ana = crearEmpleado(1, 'Ana');
const beto = crearEmpleado(2, 'Beto');
const caro = crearEmpleado(3, 'Caro');

describe('lecturaReducer', () => {
  it('parte de un estado sin lectura activa y con historial vacio', () => {
    expect(estadoInicial.readingNow).toBeNull();
    expect(estadoInicial.historial).toEqual([]);
  });

  it('devuelve el mismo estado ante una accion desconocida', () => {
    const estado: EstadoLectura = { readingNow: ana, historial: [ana] };

    const resultado = lecturaReducer(estado, { type: '[Test] Accion inexistente' } as any);

    expect(resultado).toBe(estado);
  });

  describe('leerAhora', () => {
    it('fija la lectura activa y encabeza el historial', () => {
      const resultado = lecturaReducer(estadoInicial, leerAhora({ empleado: ana }));

      expect(resultado.readingNow).toEqual(ana);
      expect(resultado.historial).toEqual([ana]);
    });

    it('no duplica el historial al leer dos veces el mismo empleado', () => {
      let estado = lecturaReducer(estadoInicial, leerAhora({ empleado: ana }));
      estado = lecturaReducer(estado, leerAhora({ empleado: ana }));

      expect(estado.historial.length).toBe(1);
      expect(estado.historial).toEqual([ana]);
    });

    it('encabeza el historial con el nuevo y conserva el anterior', () => {
      let estado = lecturaReducer(estadoInicial, leerAhora({ empleado: ana }));
      estado = lecturaReducer(estado, leerAhora({ empleado: beto }));

      expect(estado.readingNow).toEqual(beto);
      expect(estado.historial).toEqual([beto, ana]);
    });

    it('mueve al frente un empleado que ya estaba en el historial, sin duplicarlo', () => {
      let estado = lecturaReducer(estadoInicial, leerAhora({ empleado: ana }));
      estado = lecturaReducer(estado, leerAhora({ empleado: beto }));
      estado = lecturaReducer(estado, leerAhora({ empleado: caro }));

      expect(estado.historial).toEqual([caro, beto, ana]);

      estado = lecturaReducer(estado, leerAhora({ empleado: ana }));

      expect(estado.historial).toEqual([ana, caro, beto]);
      expect(estado.historial.length).toBe(3);
    });
  });

  describe('dejarDeLeer', () => {
    it('limpia la lectura activa y conserva el historial', () => {
      let estado = lecturaReducer(estadoInicial, leerAhora({ empleado: ana }));
      estado = lecturaReducer(estado, leerAhora({ empleado: beto }));

      const resultado = lecturaReducer(estado, dejarDeLeer());

      expect(resultado.readingNow).toBeNull();
      expect(resultado.historial).toEqual([beto, ana]);
    });
  });

  describe('quitarDelHistorial', () => {
    it('quita del historial y conserva la lectura activa si es otro empleado', () => {
      let estado = lecturaReducer(estadoInicial, leerAhora({ empleado: ana }));
      estado = lecturaReducer(estado, leerAhora({ empleado: beto }));

      const resultado = lecturaReducer(estado, quitarDelHistorial({ id: ana.id }));

      expect(resultado.readingNow).toEqual(beto);
      expect(resultado.historial).toEqual([beto]);
    });

    it('limpia la lectura activa cuando se quita justo el empleado que se lee', () => {
      let estado = lecturaReducer(estadoInicial, leerAhora({ empleado: ana }));
      estado = lecturaReducer(estado, leerAhora({ empleado: beto }));

      const resultado = lecturaReducer(estado, quitarDelHistorial({ id: beto.id }));

      expect(resultado.readingNow).toBeNull();
      expect(resultado.historial).toEqual([ana]);
    });

    it('deja el estado igual si el id no esta en el historial', () => {
      const estado = lecturaReducer(estadoInicial, leerAhora({ empleado: ana }));

      const resultado = lecturaReducer(estado, quitarDelHistorial({ id: 999 }));

      expect(resultado.readingNow).toEqual(ana);
      expect(resultado.historial).toEqual([ana]);
    });
  });

  describe('limpiarHistorial', () => {
    it('vacia el historial y la lectura activa', () => {
      let estado = lecturaReducer(estadoInicial, leerAhora({ empleado: ana }));
      estado = lecturaReducer(estado, leerAhora({ empleado: beto }));

      const resultado = lecturaReducer(estado, limpiarHistorial());

      expect(resultado.readingNow).toBeNull();
      expect(resultado.historial).toEqual([]);
    });
  });

  describe('inmutabilidad', () => {
    it('no muta el estado recibido', () => {
      const estado: EstadoLectura = { readingNow: null, historial: [] };

      lecturaReducer(estado, leerAhora({ empleado: ana }));

      expect(estado.readingNow).toBeNull();
      expect(estado.historial).toEqual([]);
    });

    it('no reutiliza el arreglo de historial entre estados', () => {
      const estado = lecturaReducer(estadoInicial, leerAhora({ empleado: ana }));
      const siguiente = lecturaReducer(estado, leerAhora({ empleado: beto }));

      expect(siguiente.historial).not.toBe(estado.historial);
    });
  });
});
