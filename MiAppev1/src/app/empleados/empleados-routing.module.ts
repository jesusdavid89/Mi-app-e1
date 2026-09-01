import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';
import { EmpleadoListComponent } from './empleado-list.component';
import { EmpleadoDetailComponent } from './empleado-detail.component';
import { EmpleadoEditarComponent } from './empleado-editar.component';
import { EmpleadoNuevoComponent } from './empleado-nuevo.component';

const routes: Routes = [
  { path: '', component: EmpleadoListComponent },

  { path: 'nuevo', component: EmpleadoNuevoComponent },
  { path: ':id/editar', component: EmpleadoEditarComponent },
  { path: ':id', component: EmpleadoDetailComponent },
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule],
})
export class EmpleadosRoutingModule {}
