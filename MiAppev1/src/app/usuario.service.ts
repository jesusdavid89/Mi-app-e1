import { Injectable } from '@angular/core';
import { ApplicationSettings } from '@nativescript/core';
import { BehaviorSubject, Observable } from 'rxjs';

const CLAVE_NOMBRE = 'usuario.nombre';

export const NOMBRE_POR_DEFECTO = 'Invitado';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly nombreSujeto = new BehaviorSubject<string>(this.leer());

  get nombre$(): Observable<string> {
    return this.nombreSujeto.asObservable();
  }

  obtenerNombre(): string {
    return this.leer();
  }

  get estaConfigurado(): boolean {
    return this.leer() !== '';
  }

  get nombreParaMostrar(): string {
    return this.leer() || NOMBRE_POR_DEFECTO;
  }

  guardarNombre(nombre: string): string {
    const limpio = this.normalizar(nombre);

    ApplicationSettings.setString(CLAVE_NOMBRE, limpio);
    this.nombreSujeto.next(limpio);

    return limpio;
  }

  limpiar(): void {
    ApplicationSettings.remove(CLAVE_NOMBRE);
    this.nombreSujeto.next('');
  }

  normalizar(nombre: string): string {
    return (nombre || '').trim().replace(/\s+/g, ' ');
  }

  esValido(nombre: string): boolean {
    return this.normalizar(nombre).length >= 2;
  }

  private leer(): string {
    return ApplicationSettings.getString(CLAVE_NOMBRE, '');
  }
}
