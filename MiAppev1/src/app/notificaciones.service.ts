import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Utils, isAndroid } from '@nativescript/core';
import { Toasty, ToastDuration, ToastPosition } from '@triniwiz/nativescript-toasty';
import { firebase } from '@nativescript/firebase-core';


import '@nativescript/firebase-messaging';

import { AuthorizationStatus, RemoteMessage } from '@nativescript/firebase-messaging';

export type EstadoPermiso = 'pendiente' | 'concedido' | 'denegado';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  private readonly _token = new BehaviorSubject<string>('');
  private readonly _estadoPermiso = new BehaviorSubject<EstadoPermiso>('pendiente');

  private iniciado = false;

  readonly token$: Observable<string> = this._token.asObservable();
  readonly estadoPermiso$: Observable<EstadoPermiso> = this._estadoPermiso.asObservable();

  async inicializar(): Promise<void> {
    if (this.iniciado) {
      return;
    }

    this.iniciado = true;

    this.registrarListeners();

    let estado: AuthorizationStatus;

    try {
      estado = await firebase().messaging().requestPermission();
    } catch (error) {
      console.log('FCM: fallo al pedir permiso', error);
      this._estadoPermiso.next('denegado');

      return;
    }

    
    const concedido =
      estado === AuthorizationStatus.AUTHORIZED || estado === AuthorizationStatus.PROVISIONAL;

    this._estadoPermiso.next(concedido ? 'concedido' : 'denegado');

    if (!concedido) {
      console.log('FCM: permiso de notificaciones denegado');

      return;
    }

    try {
      const token = await firebase().messaging().getToken();

      this._token.next(token ?? '');
      console.log(`FCM token: ${token}`);
    } catch (error) {
      console.log('FCM: fallo al obtener el token', error);
    }
  }

  copiarToken(): boolean {
    const token = this._token.value;

    if (!token || !isAndroid) {
      return false;
    }

    try {
      const contexto = Utils.android.getApplicationContext();
      const portapapeles = contexto.getSystemService(
        android.content.Context.CLIPBOARD_SERVICE
      ) as unknown as android.content.ClipboardManager;

      portapapeles.setPrimaryClip(android.content.ClipData.newPlainText('token FCM', token));

      return true;
    } catch (error) {
      console.log('FCM: fallo al copiar el token', error);

      return false;
    }
  }

  private registrarListeners(): void {
    const messaging = firebase().messaging();

    messaging.onToken((token) => {
      this._token.next(token ?? '');
      console.log(`FCM token actualizado: ${token}`);
    });

    messaging.onMessage((mensaje) => {
      this.mostrarToast(mensaje);
    });

    messaging.onNotificationTap((mensaje) => {
      console.log('FCM: notificacion pulsada', JSON.stringify(mensaje?.data ?? {}));
    });
  }

  private mostrarToast(mensaje: RemoteMessage): void {
    const titulo = mensaje?.notification?.title ?? mensaje?.data?.titulo;
    const cuerpo = mensaje?.notification?.body ?? mensaje?.data?.cuerpo;

    const texto = [titulo, cuerpo].filter((parte) => !!parte).join('\n');

    if (!texto) {
      console.log('FCM: mensaje sin titulo ni cuerpo, no se muestra toast');

      return;
    }

    new Toasty({
      text: texto,
      duration: ToastDuration.LONG,
      position: ToastPosition.BOTTOM,
    }).show();
  }
}
