import { platformNativeScript, runNativeScriptAngularApp } from '@nativescript/angular';
import { firebase } from '@nativescript/firebase-core';


import '@nativescript/firebase-messaging';

import { AppModule } from './app/app.module';

firebase()
  .initializeApp()
  .catch((error) => {
    console.log('FCM: fallo initializeApp', error);
  });

runNativeScriptAngularApp({
  appModuleBootstrap: () => platformNativeScript().bootstrapModule(AppModule),
});
