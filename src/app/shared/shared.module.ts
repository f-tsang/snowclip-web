import {ModuleWithProviders, NgModule} from '@angular/core'

import {indexedDbProvider, windowProvider} from './shared.providers'

@NgModule()
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [windowProvider, indexedDbProvider]
    }
  }
}
