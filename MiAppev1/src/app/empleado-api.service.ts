import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { Empleado } from './empleado.service';
import { ConfiguracionService } from './configuracion.service';

export interface FiltrosEmpleado {
  q?: string;
  nombre?: string;
  cargo?: string;
  area?: string;
  sexo?: string;
  edadMin?: number;
  edadMax?: number;
}

export type NuevoEmpleado = Omit<Empleado, 'id'>;

export interface RespuestaEmpleados {
  total: number;
  filtros: FiltrosEmpleado;
  datos: Empleado[];
}

export const ERROR_SIN_CONFIGURAR = 'SIN_CONFIGURAR';

@Injectable({
  providedIn: 'root',
})
export class EmpleadoApiService {
  constructor(
    private http: HttpClient,
    private configuracion: ConfiguracionService
  ) {}

  listar(filtros: FiltrosEmpleado = {}): Observable<RespuestaEmpleados> {
    const url = this.configuracion.urlEmpleados;

    if (!url) {
      return throwError(() => new Error(ERROR_SIN_CONFIGURAR));
    }

    let params = new HttpParams();

    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
        params = params.set(clave, String(valor).trim());
      }
    }

    return this.http.get<RespuestaEmpleados>(url, { params, headers: this.cabeceras() });
  }

  obtener(id: number): Observable<Empleado> {
    const url = this.configuracion.urlEmpleados;

    if (!url) {
      return throwError(() => new Error(ERROR_SIN_CONFIGURAR));
    }

    return this.http.get<Empleado>(`${url}/${id}`, { headers: this.cabeceras() });
  }

  crear(nuevo: NuevoEmpleado): Observable<Empleado> {
    const url = this.configuracion.urlEmpleados;

    if (!url) {
      return throwError(() => new Error(ERROR_SIN_CONFIGURAR));
    }

    return this.http.post<Empleado>(url, nuevo, { headers: this.cabeceras() });
  }

  actualizar(id: number, cambios: Partial<NuevoEmpleado>): Observable<Empleado> {
    const url = this.configuracion.urlEmpleados;

    if (!url) {
      return throwError(() => new Error(ERROR_SIN_CONFIGURAR));
    }

    return this.http.patch<Empleado>(`${url}/${id}`, cambios, { headers: this.cabeceras() });
  }

  probarConexion(): Observable<{ estado: string; servicio: string }> {
    const url = this.configuracion.urlSalud;

    if (!url) {
      return throwError(() => new Error(ERROR_SIN_CONFIGURAR));
    }

    return this.http.get<{ estado: string; servicio: string }>(url, { headers: this.cabeceras() });
  }

  private cabeceras(): HttpHeaders {
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      Accept: 'application/json',
    });
  }
}
