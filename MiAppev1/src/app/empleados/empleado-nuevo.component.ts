import { Component, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Dialogs } from '@nativescript/core';
import { RouterExtensions } from '@nativescript/angular';
import { Toasty, ToastDuration, ToastPosition } from '@triniwiz/nativescript-toasty';

import { AREAS, CARGOS, Sexo } from '../empleado.service';
import { EmpleadoApiService, ERROR_SIN_CONFIGURAR, NuevoEmpleado } from '../empleado-api.service';
import { LONGITUD_MAXIMA_TELEFONO } from './telefono-max-length.directive';

const SEXOS: Sexo[] = ['Masculino', 'Femenino'];

@Component({
  selector: 'ns-empleado-nuevo',
  templateUrl: './empleado-nuevo.component.html',
  styleUrls: ['./empleado-nuevo.component.css'],
})
export class EmpleadoNuevoComponent implements OnInit {
  @ViewChild('telefonoModel') telefonoModel: NgModel;

  name = '';
  cedula = '';
  edad = '';
  telefono = '';
  email = '';

  cargo = '';
  area = '';
  sexo: Sexo | '' = '';

  cargos = CARGOS;
  areas = AREAS;
  sexos = SEXOS;

  maxDigitos = LONGITUD_MAXIMA_TELEFONO;
  guardando = false;
  errores: string[] = [];

  constructor(
    private empleadoApi: EmpleadoApiService,
    private routerExtensions: RouterExtensions
  ) {}

  ngOnInit(): void {}

  get cargoTexto(): string {
    return this.cargo || 'Selecciona un cargo';
  }

  get areaTexto(): string {
    return this.area || 'Selecciona un área';
  }

  get sexoTexto(): string {
    return this.sexo || 'Selecciona el sexo';
  }

  limpiarErrores(): void {
    if (this.errores.length > 0) {
      this.errores = [];
    }
  }

  elegirCargo(): void {
    this.elegirDeLista('Cargo', this.cargos).then((opcion) => {
      if (opcion) {
        this.cargo = opcion;
        this.limpiarErrores();
      }
    });
  }

  elegirArea(): void {
    this.elegirDeLista('Área', this.areas).then((opcion) => {
      if (opcion) {
        this.area = opcion;
        this.limpiarErrores();
      }
    });
  }

  elegirSexo(): void {
    this.elegirDeLista('Sexo', this.sexos).then((opcion) => {
      if (opcion) {
        this.sexo = opcion as Sexo;
        this.limpiarErrores();
      }
    });
  }

  guardar(): void {
    this.errores = this.validar();

    if (this.errores.length > 0) {
      return;
    }

    const nuevo: NuevoEmpleado = {
      name: this.name.trim().replace(/\s+/g, ' '),
      cargo: this.cargo,
      area: this.area,
      cedula: Number(this.cedula.replace(/\D/g, '')),
      edad: Number(this.edad),
      sexo: this.sexo as Sexo,
      telefono: this.telefono.trim(),
      email: this.email.trim(),
    };

    this.guardando = true;

    this.empleadoApi.crear(nuevo).subscribe({
      next: (creado) => {
        this.guardando = false;
        this.avisar(`${creado.name} fue creado con el id ${creado.id}`);
        this.routerExtensions.back();
      },
      error: (error) => {
        this.guardando = false;
        this.errores = this.describirError(error);
      },
    });
  }

  cancelar(): void {
    this.routerExtensions.back();
  }

  private validar(): string[] {
    const errores: string[] = [];
    const digitos = this.telefono.replace(/\D/g, '');
    const cedula = Number(this.cedula.replace(/\D/g, ''));
    const edad = Number(this.edad);

    if (this.name.trim().length < 2) {
      errores.push('El nombre debe tener al menos 2 caracteres.');
    }

    if (!this.cargo) {
      errores.push('Selecciona un cargo.');
    }

    if (!this.area) {
      errores.push('Selecciona un área.');
    }

    if (!Number.isInteger(cedula) || cedula <= 0) {
      errores.push('La cédula debe ser un número entero positivo.');
    }

    if (!Number.isInteger(edad) || edad < 18 || edad > 99) {
      errores.push('La edad debe ser un número entre 18 y 99.');
    }

    if (!this.sexo) {
      errores.push('Selecciona el sexo.');
    }

    if (digitos.length < 7 || digitos.length > this.maxDigitos) {
      errores.push(`El teléfono debe tener entre 7 y ${this.maxDigitos} dígitos.`);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      errores.push('El correo no tiene un formato válido.');
    }

    return errores;
  }

  private describirError(error: any): string[] {
    if (error?.message === ERROR_SIN_CONFIGURAR) {
      return ['No has configurado la URL del servidor. Ve a Settings.'];
    }

    if (Array.isArray(error?.error?.errores)) {
      return error.error.errores;
    }

    if (error?.error?.error) {
      return [error.error.error];
    }

    if (!error?.status) {
      return ['No se pudo conectar con el servidor. Verifica que el backend esté arriba.'];
    }

    return [`El servidor respondió con un error (${error.status}).`];
  }

  private elegirDeLista(titulo: string, opciones: string[]): Promise<string | undefined> {
    return Dialogs.action({
      title: titulo,
      cancelButtonText: 'Cancelar',
      actions: opciones,
    }).then((opcion) => (!opcion || opcion === 'Cancelar' ? undefined : opcion));
  }

  private avisar(texto: string): void {
    new Toasty({
      text: texto,
      duration: ToastDuration.SHORT,
      position: ToastPosition.BOTTOM,
    }).show();
  }
}
