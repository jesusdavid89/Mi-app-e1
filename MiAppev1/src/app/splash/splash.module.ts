import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { SplashRoutingModule } from './splash-routing.module';
import { SplashComponent } from './splash.component';

@NgModule({
  imports: [NativeScriptCommonModule, SplashRoutingModule],
  declarations: [SplashComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SplashModule {}
