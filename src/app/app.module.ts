import {Injectable, NgModule} from '@angular/core'
import {
  BrowserModule,
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig,
  HammerModule
} from '@angular/platform-browser'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {ServiceWorkerModule} from '@angular/service-worker'
import {EffectsModule} from '@ngrx/effects'
import {StoreModule} from '@ngrx/store'
import {StoreDevtoolsModule} from '@ngrx/store-devtools'
import {BackdropModule} from 'ft-backdrop'
import {DIRECTION_HORIZONTAL} from 'hammerjs'

import {environment} from '../environments/environment'
import {AppMenuComponent} from './app-menu/app-menu.component'
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

@Injectable()
export class HammerConfig extends HammerGestureConfig {
  overrides = {
    // domEvents: true,
    swipe: {direction: DIRECTION_HORIZONTAL}
  }
  /**
   * @see [GitHub](https://github.com/hammerjs/hammer.js/issues/1014#issuecomment-372513548) for applying 'pan-y' only to specific elements.
   */
  buildHammer(element: HTMLElement) {
    return new Hammer(element, {touchAction: 'pan-y'})
  }
}

@NgModule({
  declarations: [AppComponent, AppMenuComponent],
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
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
