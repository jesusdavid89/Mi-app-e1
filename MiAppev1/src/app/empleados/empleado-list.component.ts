import { Component, OnInit } from '@angular/core';
import { Application, isAndroid } from '@nativescript/core';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import { RouterExtensions } from '@nativescript/angular';
import { EmpleadoService, Empleado } from '../empleado.service';

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
    <StackLayout class="page-content">
      <Label [text]="platformMessage" class="platform-text"></Label>
      <GridLayout
        *ngFor="let item of empleados"
        rows="auto"
        columns="auto, *"
        class="item"
        (tap)="onEmpleadoTap(item)"
      >
        <Label col="0" class="fas item-icon" text="&#xf007;" verticalAlignment="center"></Label>
        <Label col="1" [text]="item.name" class="item-name" verticalAlignment="center"></Label>
      </GridLayout>
    </StackLayout>
  `,
  styleUrls: ['./empleado-list.component.css']
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
      this.platformMessage = 'Listado de Empleados';
    }
  }

  onEmpleadoTap(empleado: Empleado): void {
    this.routerExtensions.navigate(['/empleados', empleado.id]);
  }

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>Application.getRootView();
    sideDrawer.showDrawer();
  }
}