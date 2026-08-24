import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { EmpleadoService, Empleado } from '../empleado.service';

@Component({
  selector: 'ns-empleado-detail',
  template: `
    <ActionBar class="action-bar">
      <NavigationButton text="Atrás" android.systemIcon="ic_menu_back" (tap)="onBackTap()"></NavigationButton>
      <Label class="action-bar-title" text="Detalle"></Label>
    </ActionBar>
    <StackLayout class="page-content">
      <Label class="fas detail-icon" text="&#xf007;"></Label>
      <Label [text]="empleado?.name" class="detail-name"></Label>
      <Label [text]="'ID: ' + empleado?.id" class="detail-id"></Label>
    </StackLayout>
  `,
  styleUrls: ['./empleado-list.component.css']
})
export class EmpleadoDetailComponent implements OnInit {
  empleado: Empleado | undefined;

  constructor(
    private route: ActivatedRoute,
    private routerExtensions: RouterExtensions,
    private empleadoService: EmpleadoService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.empleado = this.empleadoService.getEmpleado(id);
  }

  onBackTap(): void {
    this.routerExtensions.back();
  }
}
