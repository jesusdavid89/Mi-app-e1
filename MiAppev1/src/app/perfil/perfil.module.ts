import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptCommonModule, NativeScriptFormsModule } from '@nativescript/angular'

import { PerfilRoutingModule } from './perfil-routing.module'
import { PerfilComponent } from './perfil.component'

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptFormsModule, PerfilRoutingModule],
  declarations: [PerfilComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PerfilModule {}
