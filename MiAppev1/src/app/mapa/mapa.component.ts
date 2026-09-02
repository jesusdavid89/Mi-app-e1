import { Component } from '@angular/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'
import { Application } from '@nativescript/core'
import { LoadEventData } from '@nativescript/core/ui/web-view'
import { Toasty, ToastDuration, ToastPosition } from '@triniwiz/nativescript-toasty'

const COORDENADA = {
  lat: 10.9685,
  lon: -74.7813,
  titulo: 'Barranquilla, Colombia',
}

@Component({
  selector: 'Mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css'],
})
export class MapaComponent {

  readonly src = `~/assets/mapa/mapa.html?lat=${COORDENADA.lat}&lon=${COORDENADA.lon}&t=${COORDENADA.titulo}`

  error = ''

  get tituloCoordenada(): string {
    return `${COORDENADA.titulo}  (${COORDENADA.lat}, ${COORDENADA.lon})`
  }

  onLoadFinished(args: LoadEventData): void {
    const url = args.url || ''

    if (!url.startsWith('file://')) {
      if (args.error) {
        console.log('Mapa: subrecurso no cargado', url, args.error)
      }

      return
    }

    if (!args.error) {
      this.error = ''

      return
    }

    this.error = 'No se pudo cargar el mapa.'
    console.log('Mapa: fallo al cargar el documento', url, args.error)
    this.avisar(this.error)
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
