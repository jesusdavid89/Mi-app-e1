import { Component, OnInit } from '@angular/core';
import { Application, Dialogs, isAndroid, ItemEventData } from '@nativescript/core';
import { Toasty, ToastDuration, ToastPosition } from '@triniwiz/nativescript-toasty';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import { RouterExtensions } from '@nativescript/angular';
import { PullToRefresh } from '@nativescript-community/ui-pulltorefresh';
import { AREAS, CARGOS, EmpleadoService, Empleado } from '../empleado.service';

@Component({
  selector: 'ns-empleado-list',
  template: `
    <ActionBar class="action-bar">
      <NavigationButton visibility="hidden"></NavigationButton>
      <GridLayout columns="50, *">
        <Label class="action-bar-title" text="Empleados" colSpan="2"></Label>

        <Label class="fas" text="&#xf0c9;" (tap)="onDrawerButtonTap()"></Label>
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
    </GridLayout>
  `,
  styleUrls: ['./empleado-list.component.css'],
})
export class EmpleadoListComponent implements OnInit {
  empleados: Empleado[] = [];
  platformMessage: string = 'Ejecutando en entorno general';

  constructor(
    private empleadoService: EmpleadoService,
    private routerExtensions: RouterExtensions
  ) {}

  ngOnInit(): void {
    this.empleados = this.empleadoService.getEmpleados();

    if (isAndroid) {
      this.platformMessage = 'Listado de Empleados · desliza para actualizar';
    }
  }

  onRefresh(args: any): void {
    const pullToRefresh = args.object as PullToRefresh;

    this.empleadoService
      .refrescarEmpleados()
      .then((empleados) => {
        this.empleados = empleados;
      })
      .finally(() => {
        pullToRefresh.refreshing = false;
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

  private aplicarCambio(empleado: Empleado, cambios: Partial<Empleado>): void {
    this.empleadoService.actualizarEmpleado(empleado.id, cambios);
    this.empleados = this.empleadoService.getEmpleados();

    new Toasty({
      text: 'Información actualizada exitosamente',
      duration: ToastDuration.SHORT,
      position: ToastPosition.BOTTOM,
    }).show();
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
