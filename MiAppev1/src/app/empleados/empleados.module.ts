import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptFormsModule, registerElement } from '@nativescript/angular';
import { PullToRefresh } from '@nativescript-community/ui-pulltorefresh';
import { EmpleadosRoutingModule } from './empleados-routing.module';
import { EmpleadoListComponent } from './empleado-list.component';
import { EmpleadoDetailComponent } from './empleado-detail.component';
import { EmpleadoEditarComponent } from './empleado-editar.component';
import { EmpleadoNuevoComponent } from './empleado-nuevo.component';
import { TelefonoMaxLengthDirective } from './telefono-max-length.directive';

registerElement('PullToRefresh', () => PullToRefresh);

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptFormsModule, EmpleadosRoutingModule],
  declarations: [
    EmpleadoListComponent,
    EmpleadoDetailComponent,
    EmpleadoEditarComponent,
    EmpleadoNuevoComponent,
    TelefonoMaxLengthDirective,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class EmpleadosModule {}
