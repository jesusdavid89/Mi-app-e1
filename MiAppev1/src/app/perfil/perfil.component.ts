import { Component, OnInit } from '@angular/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'
import { Application, TextField } from '@nativescript/core'
import { Toasty, ToastDuration, ToastPosition } from '@triniwiz/nativescript-toasty'

import { NOMBRE_POR_DEFECTO, UsuarioService } from '../usuario.service'

@Component({
  selector: 'Perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  nombre = ''

  nombreGuardado = ''

  mensaje = ''
  mensajeEsError = false

  constructor(private usuario: UsuarioService) {}

  ngOnInit(): void {
    this.recargar()
  }

  get nombreParaMostrar(): string {
    return this.nombreGuardado || NOMBRE_POR_DEFECTO
  }

  get estaConfigurado(): boolean {
    return this.nombreGuardado !== ''
  }

  get puedeGuardar(): boolean {
    const limpio = this.usuario.normalizar(this.nombre)

    return limpio !== '' && limpio !== this.nombreGuardado
  }

  guardar(): void {
    if (!this.usuario.esValido(this.nombre)) {
      this.avisarEnPantalla('El nombre debe tener al menos 2 caracteres.', true)

      return
    }

    this.nombreGuardado = this.usuario.guardarNombre(this.nombre)
    this.nombre = this.nombreGuardado

    this.avisarEnPantalla('Nombre guardado en el dispositivo.', false)
    this.avisarConToast('Nombre guardado')
  }

  descartar(): void {
    this.recargar()
    this.mensaje = ''
  }

  borrar(): void {
    this.usuario.limpiar()
    this.nombre = ''
    this.nombreGuardado = ''

    this.avisarEnPantalla('Nombre borrado.', false)
    this.avisarConToast('Nombre borrado')
  }

  onReturnPress(args: any): void {
    const campo = args.object as TextField
    campo.dismissSoftInput()
    this.guardar()
  }

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>Application.getRootView()
    sideDrawer.showDrawer()
  }

  private recargar(): void {
    this.nombreGuardado = this.usuario.obtenerNombre()
    this.nombre = this.nombreGuardado
  }

  private avisarEnPantalla(texto: string, esError: boolean): void {
    this.mensaje = texto
    this.mensajeEsError = esError
  }

  private avisarConToast(texto: string): void {
    new Toasty({
      text: texto,
      duration: ToastDuration.SHORT,
      position: ToastPosition.BOTTOM,
    }).show()
  }
}
