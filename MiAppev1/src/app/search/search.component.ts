import { Component, OnInit } from '@angular/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'
import { Application, ItemEventData, TextField } from '@nativescript/core'
import { RouterExtensions } from '@nativescript/angular'
import { Toasty, ToastDuration, ToastPosition } from '@triniwiz/nativescript-toasty'
import { Empleado } from '../empleado.service'
import { EmpleadoApiService, ERROR_SIN_CONFIGURAR, FiltrosEmpleado } from '../empleado-api.service'
import { ConfiguracionService } from '../configuracion.service'
import { FavoritosService } from '../favoritos.service'

@Component({
  selector: 'Search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  consulta = ''

  soloNombre = false

  soloFavoritos = false

  resultados: Empleado[] = []

  cargando = false
  error = ''

  private consultaAplicada = ''

  private tapEnEstrella = 0

  sinConfigurar = false

  constructor(
    private empleadoApi: EmpleadoApiService,
    private configuracion: ConfiguracionService,
    private favoritos: FavoritosService,
    private routerExtensions: RouterExtensions
  ) {}

  ngOnInit(): void {
    this.buscar()
  }

  get resultadosVisibles(): Empleado[] {
    if (!this.soloFavoritos) {
      return this.resultados
    }

    return this.resultados.filter((empleado) => this.favoritos.esFavorito(empleado.id))
  }

  esFavorito(empleado: Empleado): boolean {
    return this.favoritos.esFavorito(empleado.id)
  }

  alternarFavorito(empleado: Empleado): void {
    this.tapEnEstrella = Date.now()

    const quedoMarcado = this.favoritos.alternar(empleado.id)

    this.avisar(quedoMarcado ? `${empleado.name} agregado a favoritos` : `${empleado.name} quitado de favoritos`)
  }

  get resumen(): string {
    const total = this.resultadosVisibles.length

    if (!this.consultaAplicada) {
      return `${total} empleado(s) en total`
    }

    return `${total} resultado(s) para "${this.consultaAplicada}"`
  }

  buscar(): void {
    const consulta = this.consulta.trim()
    const filtros: FiltrosEmpleado = {}

    if (consulta) {
      if (this.soloNombre) {
        filtros.nombre = consulta
      } else {
        filtros.q = consulta
      }
    }

    this.cargando = true
    this.error = ''
    this.sinConfigurar = false

    this.empleadoApi.listar(filtros).subscribe({
      next: (respuesta) => {
        this.resultados = respuesta.datos
        this.consultaAplicada = consulta
        this.cargando = false
      },
      error: (error) => {
        this.resultados = []
        this.consultaAplicada = consulta
        this.cargando = false
        this.error = this.describirError(error)
      },
    })
  }

  limpiar(): void {
    this.consulta = ''
    this.buscar()
  }

  onReturnPress(args: any): void {
    const campo = args.object as TextField
    campo.dismissSoftInput()
    this.buscar()
  }

  onItemTap(args: ItemEventData): void {
    if (Date.now() - this.tapEnEstrella < 500) {
      return
    }

    const empleado = this.resultadosVisibles[args.index]
    this.routerExtensions.navigate(['/empleados', empleado.id])
  }

  private avisar(texto: string): void {
    new Toasty({
      text: texto,
      duration: ToastDuration.SHORT,
      position: ToastPosition.BOTTOM,
    }).show()
  }

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>Application.getRootView()
    sideDrawer.showDrawer()
  }

  irAConfiguracion(): void {
    this.routerExtensions.navigate(['/settings'])
  }

  private describirError(error: any): string {
    if (error?.message === ERROR_SIN_CONFIGURAR) {
      this.sinConfigurar = true

      return 'Aun no has configurado la URL del servidor.\nVe a Settings y pega la URL de ngrok.'
    }

    if (error?.status === 0 || !error?.status) {
      return `No se pudo conectar con ${this.configuracion.obtenerUrl()}.\nVerifica que el backend y el tunel de ngrok esten arriba.`
    }

    return error?.error?.error || `El servidor respondio con un error (${error.status}).`
  }
}
