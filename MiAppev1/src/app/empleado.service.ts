import { Injectable } from '@angular/core';

export interface Empleado {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private empleados: Empleado[] = [
    { id: 1, name: 'Jesús David Quintero Llanos' },
    { id: 2, name: 'Ariel Jose Perez Tirado' },
    { id: 3, name: 'Jeison Castro' },
  ];

  getEmpleados(): Empleado[] {
    return this.empleados;
  }

  getEmpleado(id: number): Empleado | undefined {
    return this.empleados.find((empleado) => empleado.id === id);
  }
}