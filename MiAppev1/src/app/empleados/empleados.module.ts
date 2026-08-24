import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { EmpleadosRoutingModule } from './empleados-routing.module';
import { EmpleadoListComponent } from './empleado-list.component';
import { EmpleadoDetailComponent } from './empleado-detail.component';

@NgModule({
  imports: [NativeScriptCommonModule, EmpleadosRoutingModule],
  declarations: [EmpleadoListComponent, EmpleadoDetailComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class EmpleadosModule {}