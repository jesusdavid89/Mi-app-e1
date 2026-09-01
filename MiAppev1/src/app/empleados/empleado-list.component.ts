import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Application, Dialogs, isAndroid, ItemEventData } from '@nativescript/core';
import { Toasty, ToastDuration, ToastPosition } from '@triniwiz/nativescript-toasty';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import { RouterExtensions } from '@nativescript/angular';
import { PullToRefresh } from '@nativescript-community/ui-pulltorefresh';
import { filter } from 'rxjs/operators';

import { AREAS, CARGOS, Empleado } from '../empleado.service';
import { EmpleadoApiService, ERROR_SIN_CONFIGURAR, NuevoEmpleado } from '../empleado-api.service';

@Component({
  selector: 'ns-empleado-list',
  template: `
    <ActionBar class="action-bar">
      <NavigationButton visibility="hidden"></NavigationButton>
      <GridLayout columns="50, *, 50">
        <Label class="action-bar-title" text="Empleados" colSpan="3"></Label>

        <Label col="0" class="fas" text="&#xf0c9;" (tap)="onDrawerButtonTap()"></Label>
        <Label col="2" class="fas action-bar-nuevo" text="&#xf067;" (tap)="onNuevoTap()"></Label>
      </GridLayout>
    </ActionBar>

    <GridLayout rows="auto, *" class="page-content">
      <Label row="0" [text]="platformMessage" class="platform-text" textWrap="true"></Label>

      <PullToRefresh row="1" (refresh)="onRefresh($event)">
        <ListView [items]="empleados" class="empleado-list" (itemTap)="onItemTap($event)">
          <ng-template let-item="item">
            <GridLayout rows="auto, auto" columns="auto, *, auto, auto" class="item">
              <Label row="0" rowSpan="2" col="0" class="fas item-icon" text="&#xf007;" verticalAlignment="center"></Label>
              <Label row="0" col="1" [text]="item.name" class="item-name" textWrap="true"></Label>
              <Label row="1" col="1" [text]="item.cargo" class="item-cargo"></Label>
              <Label
                row="0"
                rowSpan="2"
                col="2"
                class="fas item-edit"
                text="&#xf304;"
                verticalAlignment="center"
                (tap)="onEditarTap(item)"
              ></Label>
              <Label row="0" rowSpan="2" col="3" class="fas item-chevron" text="&#xf054;" verticalAlignment="center"></Label>
            </GridLayout>
          </ng-template>
        </ListView>
      </PullToRefresh>

      <StackLayout row="1" class="lista-estado" [visibility]="cargando ? 'visible' : 'collapse'">
        <ActivityIndicator busy="true"></ActivityIndicator>
        <Label class="lista-estado-texto" text="Consultando el servidor..." textWrap="true"></Label>
      </StackLayout>

      <StackLayout row="1" class="lista-estado" [visibility]="error ? 'visible' : 'collapse'">
        <Label class="fas lista-estado-icono" text="&#xf071;"></Label>
        <Label class="lista-estado-texto" [text]="error" textWrap="true"></Label>
        <Button class="lista-estado-boton" text="Reintentar" (tap)="cargar()"></Button>
      </StackLayout>
    </GridLayout>
  `,
  styleUrls: ['./empleado-list.component.css'],
})
export class EmpleadoListComponent implements OnInit {
  empleados: Empleado[] = [];
  platformMessage: string = 'Ejecutando en entorno general';

  cargando = false;
  error = '';

  constructor(
    private empleadoApi: EmpleadoApiService,
    private routerExtensions: RouterExtensions,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isAndroid) {
      this.platformMessage = 'Listado de Empleados · desliza para actualizar';
    }

    this.cargar();

    this.router.events
      .pipe(filter((evento: any) => evento instanceof NavigationEnd))
      .subscribe((evento: NavigationEnd) => {
        if (evento.urlAfterRedirects === '/empleados') {
          this.cargar();
        }
      });
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';

    this.empleadoApi.listar().subscribe({
      next: (respuesta) => {
        this.empleados = respuesta.datos;
        this.cargando = false;
      },
      error: (error) => {
        this.empleados = [];
        this.cargando = false;
        this.error = this.describirError(error);
      },
    });
  }

  onNuevoTap(): void {
    this.routerExtensions.navigate(['/empleados/nuevo']);
  }

  onRefresh(args: any): void {
    const pullToRefresh = args.object as PullToRefresh;

    this.empleadoApi.listar().subscribe({
      next: (respuesta) => {
        this.empleados = respuesta.datos;
        this.error = '';
        pullToRefresh.refreshing = false;
      },
      error: (error) => {
        this.error = this.describirError(error);
        pullToRefresh.refreshing = false;
      },
    });
  }

  onEditarTap(empleado: Empleado): void {
    Dialogs.action({
      title: 'Editar empleado',
      message: empleado.name,
      cancelButtonText: 'Cancelar',
      actions: ['Cambiar nombre', 'Cambiar cargo', 'Cambiar área', 'Editar contacto'],
    }).then((opcion) => {
      switch (opcion) {
        case 'Cambiar nombre':
          this.pedirNombre(empleado);
          break;
        case 'Cambiar cargo':
          this.elegirCategoria(empleado, 'cargo', 'Selecciona el cargo', CARGOS);
          break;
        case 'Cambiar área':
          this.elegirCategoria(empleado, 'area', 'Selecciona el área', AREAS);
          break;
        case 'Editar contacto':
          this.routerExtensions.navigate(['/empleados', empleado.id, 'editar']);
          break;
      }
    });
  }

  private pedirNombre(empleado: Empleado): void {
    Dialogs.prompt({
      title: 'Cambiar nombre',
      message: 'Escribe el nuevo nombre del empleado',
      defaultText: empleado.name,
      okButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    }).then((resultado) => {
      const nombre = (resultado.text || '').trim();

      if (!resultado.result || !nombre || nombre === empleado.name) {
        return;
      }

      this.aplicarCambio(empleado, { name: nombre });
    });
  }

  private elegirCategoria(
    empleado: Empleado,
    campo: 'cargo' | 'area',
    titulo: string,
    opciones: string[]
  ): void {
    Dialogs.action({
      title: titulo,
      message: empleado.name,
      cancelButtonText: 'Cancelar',
      actions: opciones,
    }).then((opcion) => {
      if (!opcion || opcion === 'Cancelar' || opcion === empleado[campo]) {
        return;
      }

      this.aplicarCambio(empleado, { [campo]: opcion });
    });
  }

  private aplicarCambio(empleado: Empleado, cambios: Partial<NuevoEmpleado>): void {
    this.empleadoApi.actualizar(empleado.id, cambios).subscribe({
      next: () => {
        this.cargar();
        this.avisar('Información actualizada exitosamente');
      },
      error: (error) => {
        this.avisar(this.describirError(error));
      },
    });
  }

  private avisar(texto: string): void {
    new Toasty({
      text: texto,
      duration: ToastDuration.SHORT,
      position: ToastPosition.BOTTOM,
    }).show();
  }

  private describirError(error: any): string {
    if (error?.message === ERROR_SIN_CONFIGURAR) {
      return 'No has configurado la URL del servidor. Ve a Settings.';
    }

    if (error?.error?.error) {
      return error.error.error;
    }

    if (!error?.status) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté arriba.';
    }

    return `El servidor respondió con un error (${error.status}).`;
  }

  onItemTap(args: ItemEventData): void {
    this.onEmpleadoTap(this.empleados[args.index]);
  }

  onEmpleadoTap(empleado: Empleado): void {
    this.routerExtensions.navigate(['/empleados', empleado.id]);
  }

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>Application.getRootView();
    sideDrawer.showDrawer();
  }
}
