import { Component, OnInit } from '@angular/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'
import { Application } from '@nativescript/core'
import { Toasty, ToastDuration, ToastPosition } from '@triniwiz/nativescript-toasty'

import { ConfiguracionService, URL_EMULADOR } from '../configuracion.service'
import { UsuarioService } from '../usuario.service'
import { EmpleadoApiService } from '../empleado-api.service'

@Component({
  selector: 'Settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  url = ''

  urlGuardada = ''

  probando = false
  resultadoPrueba = ''
  pruebaExitosa = false

  nombreGuardado = ''

  constructor(
    private configuracion: ConfiguracionService,
    private empleadoApi: EmpleadoApiService,
    private usuario: UsuarioService
  ) {}

  ngOnInit(): void {
    this.urlGuardada = this.configuracion.obtenerUrl()
    this.url = this.urlGuardada

    this.usuario.nombre$.subscribe((nombre) => {
      this.nombreGuardado = nombre
    })
  }

  get nombreEstadoTexto(): string {
    return this.nombreGuardado ? this.nombreGuardado : 'Sin configurar'
  }

  get estadoTexto(): string {
    return this.urlGuardada ? this.urlGuardada : 'Sin configurar'
  }

  guardar(): void {
    if (!this.configuracion.esValida(this.url)) {
      this.resultadoPrueba = 'URL invalida. Debe ser solo el dominio, sin rutas: https://algo.ngrok-free.dev'
      this.pruebaExitosa = false

      return
    }

    this.urlGuardada = this.configuracion.guardarUrl(this.url)
    this.url = this.urlGuardada
    this.resultadoPrueba = ''

    this.avisar('URL guardada')
  }

  usarEmulador(): void {
    this.url = URL_EMULADOR
    this.guardar()
  }

  borrar(): void {
    this.configuracion.limpiar()
    this.url = ''
    this.urlGuardada = ''
    this.resultadoPrueba = ''

    this.avisar('URL borrada')
  }

  probar(): void {
    if (!this.urlGuardada) {
      this.resultadoPrueba = 'Primero guarda una URL.'
      this.pruebaExitosa = false

      return
    }

    this.probando = true
    this.resultadoPrueba = ''

    this.empleadoApi.probarConexion().subscribe({
      next: (respuesta) => {
        this.probando = false
        this.pruebaExitosa = true
        this.resultadoPrueba = `Conexion exitosa con ${respuesta.servicio}`
      },
      error: (error) => {
        this.probando = false
        this.pruebaExitosa = false
        this.resultadoPrueba = error?.status
          ? `El servidor respondio con error ${error.status}.`
          : 'No se pudo conectar. Revisa que el tunel de ngrok y el backend esten arriba.'
      },
    })
  }

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>Application.getRootView()
    sideDrawer.showDrawer()
  }

  private avisar(texto: string): void {
    new Toasty({
      text: texto,
      duration: ToastDuration.SHORT,
      position: ToastPosition.BOTTOM,
    }).show()
  }
}
