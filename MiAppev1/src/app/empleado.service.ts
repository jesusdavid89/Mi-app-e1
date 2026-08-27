import { Injectable } from '@angular/core';

export type Sexo = 'Masculino' | 'Femenino';

export interface Empleado {
  id: number;
  name: string;
  cargo?: string;
  area?: string;
  cedula: number;
  edad: number;
  sexo: Sexo;
  telefono: string;
  email: string;
}

const NOMBRES_M = ['Carlos', 'Andrés', 'Miguel', 'Julián', 'Óscar', 'Fabián', 'Ricardo'];
const NOMBRES_F = ['Laura', 'Camila', 'Daniela', 'Valentina', 'Paola', 'Mariana', 'Sofía'];
const APELLIDOS = ['Gómez', 'Rodríguez', 'Martínez', 'Vargas', 'Ospina', 'Mendoza', 'Silva', 'Cárdenas'];
export const CARGOS = ['Técnico de Campo', 'Diseñador Solar', 'Coordinador HSE', 'Analista Comercial', 'Supervisor de Montaje'];
export const AREAS = ['Proyectos', 'Operaciones', 'Tecnología', 'Comercial', 'Mantenimiento'];

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private empleados: Empleado[] = [
    {
      id: 1,
      name: 'Jesús David Quintero Llanos',
      cargo: 'Desarrollador Móvil',
      area: 'Tecnología',
      cedula: 1098765432,
      edad: 29,
      sexo: 'Masculino',
      telefono: '300 123 4567',
      email: 'jesus.quintero@energiasolarsa.com',
    },
    {
      id: 2,
      name: 'Ariel Jose Perez Tirado',
      cargo: 'Analista de Datos',
      area: 'Operaciones',
      cedula: 1076543210,
      edad: 34,
      sexo: 'Masculino',
      telefono: '301 987 6543',
      email: 'ariel.perez@energiasolarsa.com',
    },
    {
      id: 3,
      name: 'Jeison Castro',
      cargo: 'Ingeniero Solar',
      area: 'Proyectos',
      cedula: 1045678901,
      edad: 41,
      sexo: 'Masculino',
      telefono: '310 456 7890',
      email: 'jeison.castro@energiasolarsa.com',
    },
  ];

  private ultimoId = this.empleados.reduce((mayor, e) => Math.max(mayor, e.id), 0);

  getEmpleados(): Empleado[] {
    return [...this.empleados];
  }

  getEmpleado(id: number): Empleado | undefined {
    return this.empleados.find((empleado) => empleado.id === id);
  }

  refrescarEmpleados(): Promise<Empleado[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevos = 1 + Math.floor(Math.random() * 2);

        for (let i = 0; i < nuevos; i++) {
          this.empleados.unshift(this.generarEmpleadoAleatorio());
        }

        resolve(this.getEmpleados());
      }, 1200);
    });
  }

  actualizarEmpleado(id: number, cambios: Partial<Empleado>): Empleado | undefined {
    const empleado = this.empleados.find((e) => e.id === id);

    if (!empleado) {
      return undefined;
    }

    Object.assign(empleado, cambios);

    return empleado;
  }

  buscarEmpleados(texto: string, soloNombre = false): Empleado[] {
    const consulta = (texto || '').trim().toLowerCase();

    if (!consulta) {
      return this.getEmpleados();
    }

    return this.empleados.filter((empleado) => {
      const campos = soloNombre ? [empleado.name] : [empleado.name, empleado.cargo, empleado.area];

      return campos.filter((campo) => !!campo).some((campo) => campo.toLowerCase().includes(consulta));
    });
  }

  private generarEmpleadoAleatorio(): Empleado {
    const sexo: Sexo = this.alAzar(['Masculino', 'Femenino']);
    const nombre = this.alAzar(sexo === 'Masculino' ? NOMBRES_M : NOMBRES_F);
    const apellido = `${this.alAzar(APELLIDOS)} ${this.alAzar(APELLIDOS)}`;
    const name = `${nombre} ${apellido}`;

    return {
      id: ++this.ultimoId,
      name,
      cargo: this.alAzar(CARGOS),
      area: this.alAzar(AREAS),
      cedula: 1000000000 + Math.floor(Math.random() * 99999999),
      edad: 22 + Math.floor(Math.random() * 40),
      sexo,
      telefono: `3${this.digitos(2)} ${this.digitos(3)} ${this.digitos(4)}`,
      email: `${this.aCorreo(nombre)}.${this.aCorreo(apellido.split(' ')[0])}@energiasolarsa.com`,
    };
  }

  private alAzar<T>(opciones: T[]): T {
    return opciones[Math.floor(Math.random() * opciones.length)];
  }

  private digitos(cantidad: number): string {
    let salida = '';

    for (let i = 0; i < cantidad; i++) {
      salida += Math.floor(Math.random() * 10);
    }

    return salida;
  }

  private aCorreo(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
