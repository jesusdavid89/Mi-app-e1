import { Directive, Input, forwardRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

export const LONGITUD_MAXIMA_TELEFONO = 10;

@Directive({
  selector: '[maxLongitudTelefono]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TelefonoMaxLengthDirective),
      multi: true,
    },
  ],
})
export class TelefonoMaxLengthDirective implements Validator {
  @Input('maxLongitudTelefono') maxDigitos: number | string = LONGITUD_MAXIMA_TELEFONO;

  validate(control: AbstractControl): ValidationErrors | null {
    const digitos = String(control.value || '').replace(/\D/g, '');
    const maximo = Number(this.maxDigitos) || LONGITUD_MAXIMA_TELEFONO;

    if (digitos.length <= maximo) {
      return null;
    }

    return { maxLongitudTelefono: { maximo, actual: digitos.length } };
  }
}
