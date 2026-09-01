import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptCommonModule } from '@nativescript/angular'

import { FavoritosRoutingModule } from './favoritos-routing.module'
import { FavoritosComponent } from './favoritos.component'

@NgModule({
  imports: [NativeScriptCommonModule, FavoritosRoutingModule],
  declarations: [FavoritosComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class FavoritosModule {}
