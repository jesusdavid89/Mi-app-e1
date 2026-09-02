import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { RouterExtensions } from '@nativescript/angular'
import {
  DrawerTransitionBase,
  RadSideDrawer,
  SlideInOnTopTransition,
} from 'nativescript-ui-sidedrawer'
import { filter } from 'rxjs/operators'
import { Application, Color, View } from '@nativescript/core'
import { NOMBRE_POR_DEFECTO, UsuarioService } from './usuario.service'
import { NotificacionesService } from './notificaciones.service'


const FAB_COLOR_NORMAL = '#4fc3f7'
const FAB_COLOR_ACTIVO = '#ff7043'

@Component({
  selector: 'ns-app',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  @ViewChild('fabHome') fabHome: ElementRef

  private _activatedUrl: string
  private _sideDrawerTransition: DrawerTransitionBase

  nombreUsuario = ''

  constructor(
    private router: Router,
    private routerExtensions: RouterExtensions,
    private usuario: UsuarioService,
    private notificaciones: NotificacionesService
  ) {}

  ngOnInit(): void {
    this._activatedUrl = '/splash'
    this._sideDrawerTransition = new SlideInOnTopTransition()

    this.usuario.nombre$.subscribe((nombre) => {
      this.nombreUsuario = nombre || NOMBRE_POR_DEFECTO
    })

    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => (this._activatedUrl = event.urlAfterRedirects))

    this.notificaciones.inicializar()
  }

  get sideDrawerTransition(): DrawerTransitionBase {
    return this._sideDrawerTransition
  }

  get mostrarFab(): boolean {
    return this._activatedUrl !== '/splash'
  }

  isComponentSelected(url: string): boolean {
    return this._activatedUrl === url
  }

  onFabIrAlHome(): void {
    this.cerrarDrawer()

    this.animarFab().then(() => {
      if (this._activatedUrl === '/home') {
        return
      }

      this.routerExtensions.navigate(['/home'], {
        clearHistory: true,
        transition: {
          name: 'fade',
        },
      })
    })
  }

  private animarFab(): Promise<void> {
    const fab = this.fabHome?.nativeElement as View

    if (!fab) {
      return Promise.resolve()
    }

    return fab
      .animate({
        backgroundColor: new Color(FAB_COLOR_ACTIVO),
        scale: { x: 1.25, y: 1.25 },
        duration: 180,
      })
      .then(() =>
        fab.animate({
          backgroundColor: new Color(FAB_COLOR_NORMAL),
          scale: { x: 1, y: 1 },
          duration: 180,
        })
      )
      .then(() => undefined)
  }

  onNavItemTap(navItemRoute: string): void {
    this.routerExtensions.navigate([navItemRoute], {
      transition: {
        name: 'fade',
      },
    })

    this.cerrarDrawer()
  }

  private cerrarDrawer(): void {
    const sideDrawer = <RadSideDrawer>Application.getRootView()
    sideDrawer.closeDrawer()
  }
}
