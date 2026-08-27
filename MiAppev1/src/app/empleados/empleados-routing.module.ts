import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';
import { EmpleadoListComponent } from './empleado-list.component';
import { EmpleadoDetailComponent } from './empleado-detail.component';
import { EmpleadoEditarComponent } from './empleado-editar.component';

const routes: Routes = [
  { path: '', component: EmpleadoListComponent },
  { path: ':id/editar', component: EmpleadoEditarComponent },
  { path: ':id', component: EmpleadoDetailComponent },
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule],
})
export class EmpleadosRoutingModule {}
