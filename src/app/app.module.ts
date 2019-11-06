import {NgModule} from '@angular/core'
import {BrowserModule, HammerModule} from '@angular/platform-browser'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {ServiceWorkerModule} from '@angular/service-worker'
import {EffectsModule} from '@ngrx/effects'
import {StoreModule} from '@ngrx/store'
import {StoreDevtoolsModule} from '@ngrx/store-devtools'
import {BackdropModule} from 'ft-backdrop'

import {environment} from '../environments/environment'
import {AppRoutingModule} from './app-routing.module'
import {AppComponent} from './app.component'
import {SharedModule} from './shared/shared.module'

const storeOptions = {
  runtimeChecks: {
    strictActionImmutability: true,
    strictStateImmutability: true
  }
}
const devtoolOptions = {
  maxAge: 100,
  logOnly: environment.production
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HammerModule,
    StoreModule.forRoot({}, storeOptions),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument(devtoolOptions),
    AppRoutingModule,
    SharedModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    }),
    BackdropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
