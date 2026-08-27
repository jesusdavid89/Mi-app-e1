import { Component, OnDestroy, OnInit } from '@angular/core';
import { Page } from '@nativescript/core';
import { RouterExtensions } from '@nativescript/angular';

const PASO = 5;
const INTERVALO_MS = 100;

@Component({
  selector: 'ns-splash',
  template: `
    <GridLayout rows="*, auto, auto, *" class="splash">
      <StackLayout row="1" class="splash-marca">
        <Label class="splash-marca__nombre" text="TecnoApp"></Label>
        <Label class="splash-marca__autor" text="by Jesus Quintero"></Label>
      </StackLayout>

      <StackLayout row="2" class="splash-panel">
        <Progress class="splash-barra" [value]="progreso" maxValue="100"></Progress>
        <Label class="splash-texto" [text]="mensaje"></Label>
      </StackLayout>
    </GridLayout>
  `,
  styleUrls: ['./splash.component.css'],
})
export class SplashComponent implements OnInit, OnDestroy {
  progreso = 0;

  private temporizador: any;

  constructor(private page: Page, private routerExtensions: RouterExtensions) {
    this.page.actionBarHidden = true;
  }

  get mensaje(): string {
    return this.progreso >= 100 ? 'Listo' : `Cargando… ${this.progreso}%`;
  }

  ngOnInit(): void {
    this.temporizador = setInterval(() => {
      this.progreso = Math.min(100, this.progreso + PASO);

      if (this.progreso >= 100) {
        this.detener();
        this.routerExtensions.navigate(['/home'], {
          clearHistory: true,
          transition: { name: 'fade' },
        });
      }
    }, INTERVALO_MS);
  }

  ngOnDestroy(): void {
    this.detener();
  }

  private detener(): void {
    if (this.temporizador) {
      clearInterval(this.temporizador);
      this.temporizador = undefined;
    }
  }
}
