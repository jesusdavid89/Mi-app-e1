import { Component, OnInit } from '@angular/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'
import { Application, ItemEventData, SearchBar } from '@nativescript/core'
import { RouterExtensions } from '@nativescript/angular'
import { Empleado, EmpleadoService } from '../empleado.service'

@Component({
  selector: 'Search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  consulta = ''
  soloNombre = false

  resultados: Empleado[] = []

  constructor(
    private empleadoService: EmpleadoService,
    private routerExtensions: RouterExtensions
  ) {}

  ngOnInit(): void {
    this.buscar()
  }

  get resumen(): string {
    const total = this.resultados.length
    const consulta = this.consulta.trim()

    if (!consulta) {
      return `${total} empleado(s) en total`
    }

    return `${total} resultado(s) para "${consulta}"`
  }

  buscar(): void {
    this.resultados = this.empleadoService.buscarEmpleados(this.consulta, this.soloNombre)
  }

  onSubmit(args: any): void {
    const searchBar = args.object as SearchBar
    searchBar.dismissSoftInput()
  }

  onItemTap(args: ItemEventData): void {
    const empleado = this.resultados[args.index]
    this.routerExtensions.navigate(['/empleados', empleado.id])
  }

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>Application.getRootView()
    sideDrawer.showDrawer()
  }
}
