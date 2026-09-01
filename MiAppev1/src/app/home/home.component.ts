import { Component, OnInit } from '@angular/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'
import { Application, ItemEventData } from '@nativescript/core'
import { RouterExtensions } from '@nativescript/angular'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'

import { Empleado } from '../empleado.service'
import { dejarDeLeer, limpiarHistorial, quitarDelHistorial } from '../store/lectura.actions'
import {
  seleccionarHistorial,
  seleccionarLeyendoAhora,
  seleccionarTotalHistorial,
} from '../store/lectura.selectors'

@Component({
  selector: 'Home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  leyendoAhora: Empleado | null = null

  historial$: Observable<Empleado[]>
  total$: Observable<number>

  private historialActual: Empleado[] = []

  constructor(
    private store: Store,
    private routerExtensions: RouterExtensions
  ) {
    this.historial$ = this.store.select(seleccionarHistorial)
    this.total$ = this.store.select(seleccionarTotalHistorial)
  }

  ngOnInit(): void {
    this.store.select(seleccionarLeyendoAhora).subscribe((empleado) => {
      this.leyendoAhora = empleado
    })

    this.historial$.subscribe((historial) => {
      this.historialActual = historial
    })
  }

  estaLeyendo(empleado: Empleado): boolean {
    return this.leyendoAhora !== null && this.leyendoAhora.id === empleado.id
  }

  dejarDeLeer(): void {
    this.store.dispatch(dejarDeLeer())
  }

  quitar(empleado: Empleado): void {
    this.tapEnBoton = Date.now()

    this.store.dispatch(quitarDelHistorial({ id: empleado.id }))
  }

  limpiar(): void {
    this.store.dispatch(limpiarHistorial())
  }

  verDetalle(): void {
    if (this.leyendoAhora) {
      this.routerExtensions.navigate(['/empleados', this.leyendoAhora.id])
    }
  }

  onItemTap(args: ItemEventData): void {
    if (Date.now() - this.tapEnBoton < 500) {
      return
    }

    this.routerExtensions.navigate(['/empleados', this.historialActual[args.index].id])
  }

  irAFavoritos(): void {
    this.routerExtensions.navigate(['/favoritos'])
  }

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>Application.getRootView()
    sideDrawer.showDrawer()
  }

  private tapEnBoton = 0
}
