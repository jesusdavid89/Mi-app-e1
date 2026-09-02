import { NgModule } from '@angular/core'
import { Routes } from '@angular/router'
import { NativeScriptRouterModule } from '@nativescript/angular'

const routes: Routes = [
  { path: '', redirectTo: '/splash', pathMatch: 'full' },
  {
    path: 'splash',
    loadChildren: () => import('~/app/splash/splash.module').then((m) => m.SplashModule),
  },
  {
    path: 'home',
    loadChildren: () => import('~/app/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'browse',
    loadChildren: () => import('~/app/browse/browse.module').then((m) => m.BrowseModule),
  },
  {
    path: 'search',
    loadChildren: () => import('~/app/search/search.module').then((m) => m.SearchModule),
  },
  {
    path: 'featured',
    loadChildren: () => import('~/app/featured/featured.module').then((m) => m.FeaturedModule),
  },
  {
    path: 'favoritos',
    loadChildren: () => import('~/app/favoritos/favoritos.module').then((m) => m.FavoritosModule),
  },
  {
    path: 'perfil',
    loadChildren: () => import('~/app/perfil/perfil.module').then((m) => m.PerfilModule),
  },
  {
    path: 'camara',
    loadChildren: () => import('~/app/camara/camara.module').then((m) => m.CamaraModule),
  },
  {
    path: 'mapa',
    loadChildren: () => import('~/app/mapa/mapa.module').then((m) => m.MapaModule),
  },
  {
    path: 'settings',
    loadChildren: () => import('~/app/settings/settings.module').then((m) => m.SettingsModule),
  },
  {
  path: 'empleados',
  loadChildren: () => import('./empleados/empleados.module').then((m) => m.EmpleadosModule),
  }
]

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
