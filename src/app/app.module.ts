import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {EffectsModule} from '@ngrx/effects'
import {StoreModule} from '@ngrx/store'
import {StoreDevtoolsModule} from '@ngrx/store-devtools'

import {environment} from '../environments/environment'
import {AppRoutingModule} from './app-routing.module'
import {AppComponent} from './app.component'
import {SharedModule} from './shared/shared.module';
import { ServiceWorkerModule } from '@angular/service-worker'

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
    StoreModule.forRoot({}, storeOptions),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument(devtoolOptions),
    AppRoutingModule,
    SharedModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
