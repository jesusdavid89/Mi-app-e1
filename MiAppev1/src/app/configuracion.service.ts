import { Injectable } from '@angular/core';
import { ApplicationSettings } from '@nativescript/core';

const CLAVE_URL = 'api.url.base';

export const URL_EMULADOR = 'http://10.0.2.2:3000';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionService {
  obtenerUrl(): string {
    return ApplicationSettings.getString(CLAVE_URL, '');
  }

  get estaConfigurada(): boolean {
    return this.obtenerUrl() !== '';
  }

  get urlEmpleados(): string {
    const base = this.obtenerUrl();

    return base ? `${base}/api/empleados` : '';
  }

  get urlSalud(): string {
    const base = this.obtenerUrl();

    return base ? `${base}/api/salud` : '';
  }

  guardarUrl(url: string): string {
    const normalizada = this.normalizar(url);

    ApplicationSettings.setString(CLAVE_URL, normalizada);

    return normalizada;
  }

  limpiar(): void {
    ApplicationSettings.remove(CLAVE_URL);
  }

  normalizar(url: string): string {
    let limpia = (url || '').trim();

    while (/^https?:\/\/https?:\/\//i.test(limpia)) {
      limpia = limpia.replace(/^https?:\/\//i, '');
    }

    limpia = limpia.replace(/\/+$/, '');

    if (!limpia) {
      return '';
    }

    if (!/^https?:\/\//i.test(limpia)) {
      limpia = `https://${limpia}`;
    }

    return limpia;
  }

  esValida(url: string): boolean {
    return /^https?:\/\/[a-z0-9][a-z0-9.\-]*(:\d{1,5})?$/i.test(this.normalizar(url));
  }
}
