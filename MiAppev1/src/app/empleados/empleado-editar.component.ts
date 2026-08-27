import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgModel } from '@angular/forms';
import { RouterExtensions } from '@nativescript/angular';
import { Toasty, ToastDuration, ToastPosition } from '@triniwiz/nativescript-toasty';
import { EmpleadoService, Empleado } from '../empleado.service';
import { LONGITUD_MAXIMA_TELEFONO } from './telefono-max-length.directive';

@Component({
  selector: 'ns-empleado-editar',
  template: `
    <ActionBar class="action-bar">
      <NavigationButton text="Atrás" android.systemIcon="ic_menu_back" (tap)="onCancelarTap()"></NavigationButton>
      <Label class="action-bar-title" text="Editar contacto"></Label>
    </ActionBar>

    <ScrollView class="page-content">
      <StackLayout *ngIf="empleado" class="form">
        <Label class="form-empleado" [text]="empleado.name" textWrap="true"></Label>

        <Label class="form-label" text="Correo electrónico"></Label>
        <TextField
          class="form-input"
          [(ngModel)]="email"
          [ngModelOptions]="{ standalone: true }"
          keyboardType="email"
          autocorrect="false"
          autocapitalizationType="none"
          hint="correo@dominio.com"
        ></TextField>

        <Label class="form-label" text="Teléfono"></Label>
        <TextField
          #telefonoModel="ngModel"
          class="form-input"
          [(ngModel)]="telefono"
          [ngModelOptions]="{ standalone: true }"
          [maxLongitudTelefono]="maxDigitos"
          keyboardType="phone"
          hint="300 123 4567"
        ></TextField>

        <Label
          class="form-error"
          [text]="mensajeTelefonoInvalido"
          textWrap="true"
          [visibility]="telefonoModel.invalid ? 'visible' : 'collapse'"
        ></Label>

        <Label class="form-ayuda" [text]="'Máximo ' + maxDigitos + ' dígitos'"></Label>

        <Button class="form-guardar" text="Guardar cambios" (tap)="onGuardarTap()"></Button>
        <Button class="form-cancelar" text="Cancelar" (tap)="onCancelarTap()"></Button>
      </StackLayout>
    </ScrollView>
  `,
  styleUrls: ['./empleado-editar.component.css'],
})
export class EmpleadoEditarComponent implements OnInit {
  @ViewChild('telefonoModel') telefonoModel: NgModel;

  empleado: Empleado | undefined;
  email = '';
  telefono = '';
  maxDigitos = LONGITUD_MAXIMA_TELEFONO;

  readonly mensajeTelefonoInvalido =
    'El número de caracteres supera la longitud máxima del campo Teléfono';

  constructor(
    private route: ActivatedRoute,
    private routerExtensions: RouterExtensions,
    private empleadoService: EmpleadoService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.empleado = this.empleadoService.getEmpleado(id);

    if (this.empleado) {
      this.email = this.empleado.email;
      this.telefono = this.empleado.telefono;
    }
  }

  onGuardarTap(): void {
    if (!this.empleado) {
      return;
    }

    if (this.telefonoModel?.invalid) {
      this.avisar(this.mensajeTelefonoInvalido);
      return;
    }

    this.empleadoService.actualizarEmpleado(this.empleado.id, {
      email: this.email.trim(),
      telefono: this.telefono.trim(),
    });

    this.avisar('Información actualizada exitosamente');
    this.routerExtensions.back();
  }

  onCancelarTap(): void {
    this.routerExtensions.back();
  }

  private avisar(texto: string): void {
    new Toasty({
      text: texto,
      duration: ToastDuration.SHORT,
      position: ToastPosition.BOTTOM,
    }).show();
  }
}
