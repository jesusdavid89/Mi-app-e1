import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Dialogs, Utils } from '@nativescript/core';
import { Empleado } from '../empleado.service';
import { EmpleadoApiService } from '../empleado-api.service';

@Component({
  selector: 'ns-empleado-detail',
  template: `
    <ActionBar class="action-bar">
      <NavigationButton text="Atrás" android.systemIcon="ic_menu_back" (tap)="onBackTap()"></NavigationButton>
      <Label class="action-bar-title" text="Detalle del empleado"></Label>
    </ActionBar>

    <ScrollView class="page-content">
      <StackLayout *ngIf="empleado; else noEncontrado">
        <StackLayout class="detail-header">
          <Label class="fas detail-icon" text="&#xf007;"></Label>
          <Label [text]="empleado.name" class="detail-name" textWrap="true"></Label>
          <Label [text]="empleado.cargo + ' · ' + empleado.area" class="detail-subtitle" textWrap="true"></Label>
        </StackLayout>

        <StackLayout class="detail-card">
          <Label class="detail-card-title" text="Datos personales"></Label>

          <GridLayout class="detail-row" rows="auto" columns="40, *, auto">
            <Label col="0" class="fas detail-row-icon" text="&#xf2c2;"></Label>
            <Label col="1" class="detail-row-label" text="Número de cédula"></Label>
            <Label col="2" class="detail-row-value" [text]="cedulaFormateada"></Label>
          </GridLayout>

          <GridLayout class="detail-row" rows="auto" columns="40, *, auto">
            <Label col="0" class="fas detail-row-icon" text="&#xf1fd;"></Label>
            <Label col="1" class="detail-row-label" text="Edad"></Label>
            <Label col="2" class="detail-row-value" [text]="empleado.edad + ' años'"></Label>
          </GridLayout>

          <GridLayout class="detail-row" rows="auto" columns="40, *, auto">
            <Label col="0" class="fas detail-row-icon" text="&#xf228;"></Label>
            <Label col="1" class="detail-row-label" text="Sexo"></Label>
            <Label col="2" class="detail-row-value" [text]="empleado.sexo"></Label>
          </GridLayout>
        </StackLayout>

        <StackLayout class="detail-card">
          <Label class="detail-card-title" text="Contacto"></Label>

          <GridLayout class="detail-row" rows="auto" columns="40, *, auto" (tap)="onLlamarTap()">
            <Label col="0" class="fas detail-row-icon" text="&#xf095;"></Label>
            <Label col="1" class="detail-row-label" text="Teléfono"></Label>
            <Label col="2" class="detail-row-value detail-row-value--link" [text]="empleado.telefono"></Label>
          </GridLayout>

          <GridLayout class="detail-row" rows="auto" columns="40, *" (tap)="onCorreoTap()">
            <Label col="0" class="fas detail-row-icon" text="&#xf0e0;"></Label>
            <Label
              col="1"
              class="detail-row-value detail-row-value--link detail-row-value--wrap"
              [text]="empleado.email"
              textWrap="true"
            ></Label>
          </GridLayout>
        </StackLayout>

        <Label class="detail-id" [text]="'ID interno: ' + empleado.id"></Label>

        <Button class="detail-back-button" text="Volver al listado" (tap)="onBackTap()"></Button>
      </StackLayout>

      <ng-template #noEncontrado>
        <StackLayout class="detail-header">
          <Label class="fas detail-icon" text="&#xf071;"></Label>
          <Label class="detail-name" text="Empleado no encontrado" textWrap="true"></Label>
          <Button class="detail-back-button" text="Volver al listado" (tap)="onBackTap()"></Button>
        </StackLayout>
      </ng-template>
    </ScrollView>
  `,
  styleUrls: ['./empleado-detail.component.css'],
})
export class EmpleadoDetailComponent implements OnInit {
  empleado: Empleado | undefined;

  constructor(
    private route: ActivatedRoute,
    private routerExtensions: RouterExtensions,
    private empleadoApi: EmpleadoApiService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.empleadoApi.obtener(id).subscribe({
      next: (empleado) => {
        this.empleado = empleado;
      },
      error: () => {
        this.empleado = undefined;
      },
    });
  }

  get cedulaFormateada(): string {
    if (!this.empleado) {
      return '';
    }

    return this.empleado.cedula.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  onLlamarTap(): void {
    if (!this.empleado) {
      return;
    }

    const numero = this.empleado.telefono.replace(/[^+\d]/g, '');
    this.abrir(`tel:${numero}`, 'No se pudo abrir el marcador telefónico.');
  }

  onCorreoTap(): void {
    if (!this.empleado) {
      return;
    }

    this.abrir(`mailto:${this.empleado.email}`, 'No hay una aplicación de correo configurada.');
  }

  onBackTap(): void {
    this.routerExtensions.back();
  }

  private abrir(url: string, mensajeDeError: string): void {
    if (!Utils.openUrl(url)) {
      Dialogs.alert({
        title: 'Acción no disponible',
        message: mensajeDeError,
        okButtonText: 'Aceptar',
      });
    }
  }
}
