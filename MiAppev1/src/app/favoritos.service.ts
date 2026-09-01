import { Injectable } from '@angular/core';
import { ApplicationSettings } from '@nativescript/core';
import { BehaviorSubject, Observable } from 'rxjs';

const CLAVE_FAVORITOS = 'empleados.favoritos';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {
  private ids = this.leer();
  private readonly sujeto = new BehaviorSubject<Set<number>>(new Set(this.ids));

  get favoritos$(): Observable<Set<number>> {
    return this.sujeto.asObservable();
  }

  get total(): number {
    return this.ids.size;
  }

  esFavorito(id: number): boolean {
    return this.ids.has(id);
  }

  listarIds(): number[] {
    return [...this.ids].sort((a, b) => a - b);
  }

  alternar(id: number): boolean {
    if (this.ids.has(id)) {
      this.ids.delete(id);
    } else {
      this.ids.add(id);
    }

    this.guardar();

    return this.ids.has(id);
  }

  limpiar(): void {
    this.ids.clear();
    ApplicationSettings.remove(CLAVE_FAVORITOS);
    this.sujeto.next(new Set());
  }

  private guardar(): void {
    ApplicationSettings.setString(CLAVE_FAVORITOS, JSON.stringify(this.listarIds()));
    this.sujeto.next(new Set(this.ids));
  }

  private leer(): Set<number> {
    const guardado = ApplicationSettings.getString(CLAVE_FAVORITOS, '');

    if (!guardado) {
      return new Set<number>();
    }

    try {
      const valores = JSON.parse(guardado);

      if (!Array.isArray(valores)) {
        return new Set<number>();
      }

      return new Set<number>(valores.map(Number).filter((id) => Number.isInteger(id) && id > 0));
    } catch {
      return new Set<number>();
    }
  }
}
