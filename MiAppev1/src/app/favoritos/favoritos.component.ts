import { Component, OnInit } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { Application, ItemEventData } from '@nativescript/core'
import { RouterExtensions } from '@nativescript/angular'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'
import { Store } from '@ngrx/store'
import { Toasty, ToastDuration, ToastPosition } from '@triniwiz/nativescript-toasty'
import { filter } from 'rxjs/operators'

import { Empleado } from '../empleado.service'
import { EmpleadoApiService, ERROR_SIN_CONFIGURAR } from '../empleado-api.service'
import { FavoritosService } from '../favoritos.service'
import { leerAhora } from '../store/lectura.actions'
import { seleccionarLeyendoAhora } from '../store/lectura.selectors'

@Component({
  selector: 'Favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css'],
})
export class FavoritosComponent implements OnInit {
  favoritos: Empleado[] = []

  cargando = false
  error = ''

  leyendoId: number | null = null

  constructor(
    private empleadoApi: EmpleadoApiService,
    private favoritosService: FavoritosService,
    private routerExtensions: RouterExtensions,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.cargar()

    this.store.select(seleccionarLeyendoAhora).subscribe((empleado) => {
      this.leyendoId = empleado ? empleado.id : null
    })

    this.router.events
      .pipe(filter((evento: any) => evento instanceof NavigationEnd))
      .subscribe((evento: NavigationEnd) => {
        if (evento.urlAfterRedirects === '/favoritos') {
          this.cargar()
        }
      })
  }

  get resumen(): string {
    const total = this.favoritos.length

    return total === 1 ? '1 favorito' : `${total} favoritos`
  }

  cargar(): void {
    const ids = this.favoritosService.listarIds()

    if (ids.length === 0) {
      this.favoritos = []
      this.error = ''
      this.cargando = false

      return
    }

    this.cargando = true
    this.error = ''

    this.empleadoApi.listar().subscribe({
      next: (respuesta) => {
        this.favoritos = respuesta.datos.filter((empleado) => this.favoritosService.esFavorito(empleado.id))
        this.cargando = false
      },
      error: (error) => {
        this.favoritos = []
        this.cargando = false
        this.error = this.describirError(error)
      },
    })
  }

  estaLeyendo(empleado: Empleado): boolean {
    return this.leyendoId === empleado.id
  }

  leerAhora(empleado: Empleado): void {
    this.tapEnBoton = Date.now()

    this.store.dispatch(leerAhora({ empleado }))

    this.avisar(`${empleado.name} está en "Leyendo ahora"`)
  }

  quitarFavorito(empleado: Empleado): void {
    this.tapEnBoton = Date.now()

    this.favoritosService.alternar(empleado.id)
    this.favoritos = this.favoritos.filter((candidato) => candidato.id !== empleado.id)

    this.avisar(`${empleado.name} quitado de favoritos`)
  }

  onItemTap(args: ItemEventData): void {
    if (Date.now() - this.tapEnBoton < 500) {
      return
    }

    this.routerExtensions.navigate(['/empleados', this.favoritos[args.index].id])
  }

  irAlInicio(): void {
    this.routerExtensions.navigate(['/home'])
  }

  irABuscar(): void {
    this.routerExtensions.navigate(['/search'])
  }

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>Application.getRootView()
    sideDrawer.showDrawer()
  }

  private tapEnBoton = 0

  private avisar(texto: string): void {
    new Toasty({
      text: texto,
      duration: ToastDuration.SHORT,
      position: ToastPosition.BOTTOM,
    }).show()
  }

  private describirError(error: any): string {
    if (error?.message === ERROR_SIN_CONFIGURAR) {
      return 'No has configurado la URL del servidor. Ve a Settings.'
    }

    if (!error?.status) {
      return 'No se pudo conectar con el servidor.'
    }

    return `El servidor respondió con un error (${error.status}).`
  }
}
