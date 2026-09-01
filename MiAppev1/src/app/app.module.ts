import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptModule, NativeScriptHttpClientModule } from '@nativescript/angular'
import { NativeScriptUISideDrawerModule } from 'nativescript-ui-sidedrawer/angular'
import { StoreModule } from '@ngrx/store'

import { CLAVE_LECTURA, lecturaReducer } from './store/lectura.reducer'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    AppRoutingModule,
    NativeScriptModule,
    NativeScriptHttpClientModule,
    NativeScriptUISideDrawerModule,
    StoreModule.forRoot({ [CLAVE_LECTURA]: lecturaReducer }),
  ],
  declarations: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
